import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { sendResponse } from "../utils/response.js";
import { UserModel } from "../models/userModel.js";
import { RestaurantModel } from "../models/restaurantModel.js";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
});

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
    });
  }

  const token = generateToken(user.id);
  sendResponse(res, 201, "Registration successful", { user: await UserModel.findById(user.id), token });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(422, errors.array()[0]?.msg || "Validation failed");

  const email = String(req.body.email || "").trim().toLowerCase();
  const user = await UserModel.findAuthUserByEmail(email);
  if (!user) throw new ApiError(401, "Invalid credentials");

  const matched = await UserModel.comparePassword(req.body.password, user.password);
  if (!matched) throw new ApiError(401, "Invalid credentials");
  if (user.status !== "active") throw new ApiError(403, "Account is not active");

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

  if (String(new_password).length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters long");
  }

  const authUser = await UserModel.findAuthUserByEmail(req.user.email);
  const matched = await UserModel.comparePassword(current_password, authUser.password);
  if (!matched) throw new ApiError(400, "Current password is incorrect");

  await UserModel.updatePassword(req.user.id, new_password, false);
  sendResponse(res, 200, "Password updated successfully");
});
