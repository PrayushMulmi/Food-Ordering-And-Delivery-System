import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { sendResponse } from "../utils/response.js";
import { UserModel } from "../models/userModel.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const registerValidation = [
  body("full_name").notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
];

export const loginValidation = [
  body("email").isEmail(),
  body("password").notEmpty(),
];

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(422, "Validation failed");

  const existing = await UserModel.findByEmail(req.body.email);
  if (existing) throw new ApiError(400, "Email already registered");

  const user = await UserModel.create({
    ...req.body,
    role: req.body.role || "customer",
  });

  const token = generateToken(user.id);
  sendResponse(res, 201, "Registration successful", { user, token });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(422, "Validation failed");

  const user = await UserModel.findAuthUserByEmail(req.body.email);
  if (!user) throw new ApiError(401, "Invalid credentials");

  const matched = await UserModel.comparePassword(
    req.body.password,
    user.password,
  );
  if (!matched) throw new ApiError(401, "Invalid credentials");
  if (user.status !== "active")
    throw new ApiError(403, "Account is not active");

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
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    throw new ApiError(400, "Current password and new password are required");
  }

  const authUser = await UserModel.findAuthUserByEmail(req.user.email);
  const matched = await UserModel.comparePassword(
    current_password,
    authUser.password,
  );

  if (!matched) {
    throw new ApiError(400, "Current password is incorrect");
  }

  await UserModel.updatePassword(req.user.id, new_password, false);
  sendResponse(res, 200, "Password updated successfully");
});
