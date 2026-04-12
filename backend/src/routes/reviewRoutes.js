import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";
import {
  createReview,
  getRestaurantReviews,
  getMyReviews,
  getMyReviewableItems,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/restaurant/:restaurantId", getRestaurantReviews);
router.get("/mine", protect, allowRoles(ROLES.CUSTOMER), getMyReviews);
router.get("/reviewable", protect, allowRoles(ROLES.CUSTOMER), getMyReviewableItems);
router.post("/", protect, allowRoles(ROLES.CUSTOMER), createReview);

export default router;
