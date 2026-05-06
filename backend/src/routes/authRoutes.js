import express from "express";
import {
  register,
  login,
  getMe,
  updateMyProfile,
  changeMyPassword,
  requestPasswordReset,
  verifyPasswordResetCode,
  resetPasswordWithCode,
  registerValidation,
  loginValidation,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { listMySavedLocations, createMySavedLocation, updateMySavedLocation, deleteMySavedLocation } from "../controllers/savedLocationController.js";

const router = express.Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/forgot-password/request", requestPasswordReset);
router.post("/forgot-password/verify", verifyPasswordResetCode);
router.post("/forgot-password/reset", resetPasswordWithCode);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMyProfile);
router.put("/change-password", protect, changeMyPassword);
router.get("/me/locations", protect, listMySavedLocations);
router.post("/me/locations", protect, createMySavedLocation);
router.put("/me/locations/:id", protect, updateMySavedLocation);
router.delete("/me/locations/:id", protect, deleteMySavedLocation);

export default router;
