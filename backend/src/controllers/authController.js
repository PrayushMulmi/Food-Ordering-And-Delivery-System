import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { sendResponse } from "../utils/response.js";
import { UserModel } from "../models/userModel.js";
import { RestaurantModel } from "../models/restaurantModel.js";
import { query } from "../config/db.js";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
});

const RESET_CODE_EXPIRY_MINUTES = 10;

function generateSixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
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
  body("phone").optional({ values: "falsy" }).trim().isLength({ min: 7, max: 30 }),
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
      price_level: payload.price_level || '$$',
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
  const updated = await UserModel.updateProfile(req.user.id, req.body);
  sendResponse(res, 200, "Profile updated", updated);
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
  const phone = String(req.body.phone || '').trim();
  if (!phone) throw new ApiError(400, 'Registered phone number is required');

  const rows = await query(
    `SELECT id, full_name, phone, status FROM users WHERE phone = ? AND role = 'customer' LIMIT 1`,
    [phone],
  );
  const user = rows[0];
  if (!user || user.status !== 'active') {
    throw new ApiError(404, 'No active customer account was found with this phone number');
  }

  const code = generateSixDigitCode();
  const codeHash = await bcrypt.hash(code, 10);
  await query(
    `INSERT INTO password_reset_codes (user_id, phone, code_hash, expires_at)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
    [user.id, phone, codeHash, RESET_CODE_EXPIRY_MINUTES],
  );

  // In production, connect an SMS gateway. The verification code is stored hashed and is not exposed in API responses.
  sendResponse(res, 200, 'Verification code generated', {
    reset_token_hint: 'Use the verification code sent to the registered phone number within 10 minutes.',
  });
});

export const verifyPasswordResetCode = asyncHandler(async (req, res) => {
  const phone = String(req.body.phone || '').trim();
  const code = String(req.body.code || '').trim();
  if (!phone || !/^\d{6}$/.test(code)) throw new ApiError(400, 'Phone number and 6-digit code are required');

  const rows = await query(
    `SELECT prc.*, u.status
     FROM password_reset_codes prc
     INNER JOIN users u ON u.id = prc.user_id
     WHERE prc.phone = ? AND prc.used_at IS NULL AND prc.expires_at > NOW()
     ORDER BY prc.id DESC LIMIT 1`,
    [phone],
  );
  const reset = rows[0];
  if (!reset || reset.status !== 'active') throw new ApiError(400, 'Invalid or expired verification code');

  const matched = await bcrypt.compare(code, reset.code_hash);
  if (!matched) throw new ApiError(400, 'Invalid or expired verification code');

  sendResponse(res, 200, 'Verification code accepted', { reset_id: reset.id });
});

export const resetPasswordWithCode = asyncHandler(async (req, res) => {
  const phone = String(req.body.phone || '').trim();
  const code = String(req.body.code || '').trim();
  const { new_password, confirm_password } = req.body;

  if (!phone || !/^\d{6}$/.test(code)) throw new ApiError(400, 'Phone number and 6-digit code are required');
  if (new_password !== confirm_password) throw new ApiError(400, 'Passwords do not match');
  if (!validatePassword(new_password)) throw new ApiError(400, 'Password must be at least 8 characters and contain one letter and one number');

  const rows = await query(
    `SELECT prc.*, u.status
     FROM password_reset_codes prc
     INNER JOIN users u ON u.id = prc.user_id
     WHERE prc.phone = ? AND prc.used_at IS NULL AND prc.expires_at > NOW()
     ORDER BY prc.id DESC LIMIT 1`,
    [phone],
  );
  const reset = rows[0];
  if (!reset || reset.status !== 'active') throw new ApiError(400, 'Invalid or expired verification code');

  const matched = await bcrypt.compare(code, reset.code_hash);
  if (!matched) throw new ApiError(400, 'Invalid or expired verification code');

  await UserModel.updatePassword(reset.user_id, new_password, false);
  await query(`UPDATE password_reset_codes SET used_at = CURRENT_TIMESTAMP WHERE id = ?`, [reset.id]);
  sendResponse(res, 200, 'Password reset successfully');
});
