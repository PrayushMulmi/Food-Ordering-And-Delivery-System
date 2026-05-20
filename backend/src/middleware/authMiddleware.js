import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { UserModel } from "../models/userModel.js";

const getTokenUserId = (decoded = {}) => {
  const rawId = decoded.id ?? decoded.userId ?? decoded.user_id ?? decoded.sub;
  const numericId = Number(rawId);
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
};

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = getTokenUserId(decoded);
    if (!userId) {
      throw new ApiError(401, "Invalid token payload");
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (user.status !== "active") {
      throw new ApiError(403, "Account is not active");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "Invalid or expired token");
  }
});
