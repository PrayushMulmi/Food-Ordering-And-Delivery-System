import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { body, validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { sendResponse } from "../utils/response.js";
import { UserModel } from "../models/userModel.js";
import { RestaurantModel } from "../models/restaurantModel.js";
import { query } from "../config/db.js";
import { sendWhatsappOtp } from "../services/whatsappService.js";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
});

const RESET_CODE_EXPIRY_MINUTES = 10;
const RESET_CODE_RESEND_SECONDS = 60;

function generateSixDigitCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function normalizeResetUsername(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhoneNumber(value) {
  return String(value || '').replace(/\D/g, '').slice(-10);
}

async function findCustomerForPasswordReset(username, phone) {
  const identifier = normalizeResetUsername(username);
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!identifier) throw new ApiError(400, 'Username is required');
  if (!/^\d{10}$/.test(normalizedPhone)) throw new ApiError(400, 'Registered phone number must be exactly 10 digits');

  const rows = await query(
    `SELECT id, full_name, email, phone, status
     FROM users
     WHERE role = 'customer'
       AND REPLACE(REPLACE(REPLACE(IFNULL(phone, ''), ' ', ''), '-', ''), '+977', '') = ?
       AND (LOWER(email) = ? OR LOWER(SUBSTRING_INDEX(email, '@', 1)) = ? OR LOWER(full_name) = ?)
     LIMIT 1`,
    [normalizedPhone, identifier, identifier, identifier],
  );

  const user = rows[0];
  if (!user || user.status !== 'active') {
    throw new ApiError(404, 'Username and phone number do not match an active customer account');
  }
  return { ...user, phone: normalizedPhone };
}

function validatePassword(password) {
  return String(password || '').length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export const registerValidation = [
  body("full_name").trim().notEmpty().withMessage("Full name is required"),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .withMessage("Password must contain at least one letter and one number"),
  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("Mobile number must be exactly 10 digits"),
  body("confirm_password").optional(),
];

export const loginValidation = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(422, errors.array()[0]?.msg || "Validation failed");

  if (req.body.confirm_password && req.body.password !== req.body.confirm_password) {
    throw new ApiError(400, "Passwords do not match");
  }

  const payload = { ...req.body, email: String(req.body.email || "").trim().toLowerCase() };

  const existing = await UserModel.findByEmail(payload.email);
  if (existing) throw new ApiError(400, "Email already registered");

  const role = payload.role || "customer";
  const user = await UserModel.create({ ...payload, role });

  if (role === 'restaurant_admin') {
    await RestaurantModel.create({
      owner_user_id: user.id,
      name: payload.restaurant_name || `${user.full_name}'s Restaurant`,
      description: payload.restaurant_description || 'Restaurant profile pending update.',
      cuisine: payload.restaurant_cuisine || 'Multi Cuisine',
      address: payload.restaurant_address || 'Kathmandu',
      contact_phone: payload.phone || null,
      price_level: payload.price_level || 'Medium',
      image_url: payload.restaurant_image_url || null,
      region: payload.region || 'Kathmandu',
      restaurant_location_url: payload.restaurant_location_url || null,
    });
  }

  const token = generateToken(user.id);
  sendResponse(res, 201, "Registration successful. Please log in to continue.", { user: await UserModel.findById(user.id), token });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(422, errors.array()[0]?.msg || "Validation failed");

  const email = String(req.body.email || "").trim().toLowerCase();
  const expectedRole = req.body.expected_role ? String(req.body.expected_role).trim() : null;
  const user = await UserModel.findAuthUserByEmail(email);
  if (!user) throw new ApiError(401, "Invalid credentials");

  const matched = await UserModel.comparePassword(req.body.password, user.password);
  if (!matched) throw new ApiError(401, "Invalid credentials");
  if (user.status !== "active") throw new ApiError(403, "Account is not active");

  if (expectedRole && user.role !== expectedRole) {
    throw new ApiError(403, `This login portal is only for ${expectedRole.replace('_', ' ')} accounts.`);
  }

  const token = generateToken(user.id);
  const safeUser = await UserModel.findById(user.id);
  sendResponse(res, 200, "Login successful", { user: safeUser, token });
});

export const getMe = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Profile fetched", req.user);
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const phone = req.body.phone;
  if (phone !== undefined && phone !== null && String(phone).trim() && !/^\d{10}$/.test(String(phone).trim())) {
    throw new ApiError(400, "Mobile number must be exactly 10 digits");
  }
  const updated = await UserModel.updateProfile(req.user.id, req.body);
  sendResponse(res, 200, "Profile updated", updated);
});

export const updateMyTheme = asyncHandler(async (req, res) => {
  const theme = req.body.theme === "dark" ? "dark" : "light";
  const updated = await UserModel.updateTheme(req.user.id, theme);
  sendResponse(res, 200, "Theme updated", updated);
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;

  if (!current_password || !new_password) {
    throw new ApiError(400, "Current password and new password are required");
  }

  if (confirm_password !== undefined && new_password !== confirm_password) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  if (!validatePassword(new_password)) {
    throw new ApiError(400, "New password must be at least 8 characters and contain one letter and one number");
  }

  const authUser = await UserModel.findAuthUserByEmail(req.user.email);
  const matched = await UserModel.comparePassword(current_password, authUser.password);
  if (!matched) throw new ApiError(400, "Current password is incorrect");

  await UserModel.updatePassword(req.user.id, new_password, false);
  sendResponse(res, 200, "Password updated successfully");
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const username = String(req.body.username || '').trim();
  const phone = normalizePhoneNumber(req.body.phone);
  const user = await findCustomerForPasswordReset(username, phone);

  await query(
    `DELETE FROM password_reset_codes WHERE expires_at <= NOW() OR used_at IS NOT NULL`,
  );

  const recentRows = await query(
    `SELECT id FROM password_reset_codes
     WHERE user_id = ? AND phone = ? AND used_at IS NULL AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
     ORDER BY id DESC LIMIT 1`,
    [user.id, phone, RESET_CODE_RESEND_SECONDS],
  );

  if (recentRows[0]) {
    throw new ApiError(429, `Please wait ${RESET_CODE_RESEND_SECONDS} seconds before requesting another OTP`);
  }

  const code = generateSixDigitCode();
  const codeHash = await bcrypt.hash(code, 12);
  const created = await query(
    `INSERT INTO password_reset_codes (user_id, phone, code_hash, expires_at)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
    [user.id, phone, codeHash, RESET_CODE_EXPIRY_MINUTES],
  );

  try {
    await sendWhatsappOtp({ phone, otp: code });
  } catch (error) {
    console.error('WhatsApp OTP delivery failed:', error.message);
    if (created?.insertId) {
      await query(`DELETE FROM password_reset_codes WHERE id = ?`, [created.insertId]);
    }
    throw new ApiError(502, error.message || 'Could not send WhatsApp OTP');
  }

  sendResponse(res, 200, 'OTP sent to the registered WhatsApp number', {
    expires_in_minutes: RESET_CODE_EXPIRY_MINUTES,
  });
});

export const verifyPasswordResetCode = asyncHandler(async (req, res) => {
  const username = String(req.body.username || '').trim();
  const phone = normalizePhoneNumber(req.body.phone);
  const code = String(req.body.code || '').trim();
  if (!/^\d{6}$/.test(code)) throw new ApiError(400, '6-digit OTP is required');

  const user = await findCustomerForPasswordReset(username, phone);

  const rows = await query(
    `SELECT prc.*, u.status
     FROM password_reset_codes prc
     INNER JOIN users u ON u.id = prc.user_id
     WHERE prc.user_id = ? AND prc.phone = ? AND prc.used_at IS NULL AND prc.expires_at > NOW()
     ORDER BY prc.id DESC LIMIT 1`,
    [user.id, phone],
  );
  const reset = rows[0];
  if (!reset || reset.status !== 'active') throw new ApiError(400, 'Invalid or expired OTP');

  const matched = await bcrypt.compare(code, reset.code_hash);
  if (!matched) throw new ApiError(400, 'Invalid or expired OTP');

  sendResponse(res, 200, 'OTP accepted');
});

export const resetPasswordWithCode = asyncHandler(async (req, res) => {
  const username = String(req.body.username || '').trim();
  const phone = normalizePhoneNumber(req.body.phone);
  const code = String(req.body.code || '').trim();
  const { new_password, confirm_password } = req.body;

  if (!/^\d{6}$/.test(code)) throw new ApiError(400, '6-digit OTP is required');
  if (new_password !== confirm_password) throw new ApiError(400, 'Passwords do not match');
  if (!validatePassword(new_password)) throw new ApiError(400, 'Password must be at least 8 characters and contain one letter and one number');

  const user = await findCustomerForPasswordReset(username, phone);

  const rows = await query(
    `SELECT prc.*, u.status
     FROM password_reset_codes prc
     INNER JOIN users u ON u.id = prc.user_id
     WHERE prc.user_id = ? AND prc.phone = ? AND prc.used_at IS NULL AND prc.expires_at > NOW()
     ORDER BY prc.id DESC LIMIT 1`,
    [user.id, phone],
  );
  const reset = rows[0];
  if (!reset || reset.status !== 'active') throw new ApiError(400, 'Invalid or expired OTP');

  const matched = await bcrypt.compare(code, reset.code_hash);
  if (!matched) throw new ApiError(400, 'Invalid or expired OTP');

  await UserModel.updatePassword(reset.user_id, new_password, false);
  await query(`UPDATE password_reset_codes SET used_at = CURRENT_TIMESTAMP WHERE id = ?`, [reset.id]);
  await query(
    `UPDATE password_reset_codes SET used_at = COALESCE(used_at, CURRENT_TIMESTAMP)
     WHERE user_id = ? AND id <> ? AND used_at IS NULL`,
    [reset.user_id, reset.id],
  );
  sendResponse(res, 200, 'Password reset successfully');
});
