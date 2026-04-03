import express from "express";
import {
  register,
  login,
  getMe,
  updateMyProfile,
  changeMyPassword,
  registerValidation,
  loginValidation,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMyProfile);
router.put("/change-password", protect, changeMyPassword);

export default router;
