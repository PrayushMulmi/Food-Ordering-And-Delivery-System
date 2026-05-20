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
const SIGNUP_CODE_EXPIRY_MINUTES = 10;
const SIGNUP_CODE_RESEND_SECONDS = 60;
const MAX_FAILED_LOGIN_ATTEMPTS = 7;
const LOGIN_BLOCK_MINUTES = 10;
const LOGIN_BLOCK_MESSAGE = "Too many failed login attempts. Please try again after 10 minutes.";

function generateSixDigitCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function normalizeResetUsername(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhoneNumber(value) {
  return String(value || '').replace(/\D/g, '').slice(-10);
}

function isLoginBlocked(user) {
  const blockedUntil = user?.login_blocked_until ? new Date(user.login_blocked_until).getTime() : 0;
  return Boolean(blockedUntil && blockedUntil > Date.now());
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
       AND RIGHT(REPLACE(REPLACE(REPLACE(IFNULL(phone, ''), ' ', ''), '-', ''), '+', ''), 10) = ?
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

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isAccepted(value) {
  return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'on';
}

async function ensureEmailAndPhoneAvailable(email, phone) {
  const existingEmail = await UserModel.findByEmail(email);
  if (existingEmail) throw new ApiError(400, 'Email already registered');

  const existingPhone = await UserModel.findByPhone(phone);
  if (existingPhone) throw new ApiError(400, 'Phone number already registered. Please use an unregistered phone number.');
}

function safeSignupPreferences(value) {
  return Array.isArray(value) ? value : [];
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
  body("terms_accepted").optional(),
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

  const role = req.body.role || "customer";
  const payload = {
    ...req.body,
    email: normalizeEmail(req.body.email),
    phone: normalizePhoneNumber(req.body.phone),
  };

  if (!/^\d{10}$/.test(payload.phone)) {
    throw new ApiError(400, "Mobile number must be exactly 10 digits");
  }

  await ensureEmailAndPhoneAvailable(payload.email, payload.phone);

  // Customer signup must verify ownership of the phone number through WhatsApp OTP
  // before an active user account is created. Restaurant-admin self registration
  // keeps the existing flow, but still receives server-side phone uniqueness checks.
  if (role === 'customer') {
    if (!isAccepted(req.body.terms_accepted)) {
      throw new ApiError(400, 'You must accept the Terms & Conditions before signing up');
    }

    await query(`DELETE FROM signup_verifications WHERE expires_at <= NOW() OR used_at IS NOT NULL`);

    const recentRows = await query(
      `SELECT id FROM signup_verifications
       WHERE (LOWER(email) = ? OR phone = ?) AND used_at IS NULL
         AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
       ORDER BY id DESC LIMIT 1`,
      [payload.email, payload.phone, SIGNUP_CODE_RESEND_SECONDS],
    );

    if (recentRows[0]) {
      throw new ApiError(429, `Please wait ${SIGNUP_CODE_RESEND_SECONDS} seconds before requesting another OTP`);
    }

    // Replace older unverified attempts for the same email/phone so only the
    // latest OTP can complete the signup.
    await query(
      `UPDATE signup_verifications
       SET used_at = COALESCE(used_at, CURRENT_TIMESTAMP)
       WHERE (LOWER(email) = ? OR phone = ?) AND used_at IS NULL`,
      [payload.email, payload.phone],
    );

    const code = generateSixDigitCode();
    const codeHash = await bcrypt.hash(code, 12);
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const acceptedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const created = await query(
      `INSERT INTO signup_verifications
       (full_name, email, password_hash, phone, food_preferences, terms_accepted, terms_accepted_at, code_hash, expires_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [
        String(payload.full_name || '').trim(),
        payload.email,
        passwordHash,
        payload.phone,
        JSON.stringify(safeSignupPreferences(payload.food_preferences)),
        acceptedAt,
        codeHash,
        SIGNUP_CODE_EXPIRY_MINUTES,
      ],
    );

    try {
      const delivery = await sendWhatsappOtp({ phone: payload.phone, otp: code });
      console.info(`Signup WhatsApp OTP delivery accepted by ${delivery.provider} from ${delivery.from || 'configured sender'} to ${delivery.to}`);
    } catch (error) {
      console.error('Signup WhatsApp OTP delivery failed:', error.message);
      if (created?.insertId) {
        await query(`DELETE FROM signup_verifications WHERE id = ?`, [created.insertId]);
      }
      throw new ApiError(502, error.message || 'Could not send WhatsApp OTP');
    }

    return sendResponse(res, 200, 'OTP sent to your WhatsApp number. Verify the OTP to complete signup.', {
      requires_otp: true,
      phone: payload.phone,
      expires_in_minutes: SIGNUP_CODE_EXPIRY_MINUTES,
    });
  }

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

export const verifySignupOtp = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const phone = normalizePhoneNumber(req.body.phone);
  const code = String(req.body.code || '').trim();

  if (!email) throw new ApiError(400, 'Email is required');
  if (!/^\d{10}$/.test(phone)) throw new ApiError(400, 'Mobile number must be exactly 10 digits');
  if (!/^\d{6}$/.test(code)) throw new ApiError(400, '6-digit OTP is required');

  const rows = await query(
    `SELECT * FROM signup_verifications
     WHERE LOWER(email) = ? AND phone = ? AND used_at IS NULL AND expires_at > NOW()
     ORDER BY id DESC LIMIT 1`,
    [email, phone],
  );

  const pending = rows[0];
  if (!pending) throw new ApiError(400, 'Invalid or expired OTP');

  const matched = await bcrypt.compare(code, pending.code_hash);
  if (!matched) throw new ApiError(400, 'Invalid or expired OTP');

  await ensureEmailAndPhoneAvailable(email, phone);

  if (!pending.terms_accepted) {
    throw new ApiError(400, 'Terms & Conditions acceptance is required before account creation');
  }

  const user = await UserModel.createWithHashedPassword({
    full_name: pending.full_name,
    email: pending.email,
    password_hash: pending.password_hash,
    phone: pending.phone,
    role: 'customer',
    food_preferences: (() => {
      try {
        const parsed = JSON.parse(pending.food_preferences || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })(),
    terms_accepted: true,
    terms_accepted_at: pending.terms_accepted_at,
  });

  await query(`UPDATE signup_verifications SET used_at = CURRENT_TIMESTAMP WHERE id = ?`, [pending.id]);
  await query(
    `UPDATE signup_verifications SET used_at = COALESCE(used_at, CURRENT_TIMESTAMP)
     WHERE (LOWER(email) = ? OR phone = ?) AND id <> ? AND used_at IS NULL`,
    [email, phone, pending.id],
  );

  sendResponse(res, 201, 'Signup verified successfully. Please log in to continue.', {
    user: await UserModel.findById(user.id),
  });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(422, errors.array()[0]?.msg || "Validation failed");

  const email = String(req.body.email || "").trim().toLowerCase();
  const expectedRole = req.body.expected_role ? String(req.body.expected_role).trim() : null;
  const user = await UserModel.findAuthUserByEmail(email);
  if (!user) throw new ApiError(401, "Invalid credentials");

  if (isLoginBlocked(user)) {
    throw new ApiError(429, LOGIN_BLOCK_MESSAGE);
  }

  const matched = await UserModel.comparePassword(req.body.password, user.password);
  if (!matched) {
    const failure = await UserModel.recordFailedLogin(user.id, MAX_FAILED_LOGIN_ATTEMPTS, LOGIN_BLOCK_MINUTES);
    if (failure.blocked) throw new ApiError(429, LOGIN_BLOCK_MESSAGE);
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.status !== "active") throw new ApiError(403, "Account is not active");

  if (expectedRole && user.role !== expectedRole) {
    throw new ApiError(403, `This login portal is only for ${expectedRole.replace('_', ' ')} accounts.`);
  }

  await UserModel.resetLoginFailures(user.id);
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
    const delivery = await sendWhatsappOtp({ phone, otp: code });
    console.info(`WhatsApp OTP delivery accepted by ${delivery.provider} from ${delivery.from || 'configured sender'} to ${delivery.to}`);
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
