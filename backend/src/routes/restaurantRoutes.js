import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";
import {
  listRestaurants,
  getRestaurantByCode,
  getRestaurantFilters,
  getRestaurantSections,
  getRestaurantImage,
  getRecommendedRestaurants,
} from "../controllers/restaurantController.js";

const router = express.Router();
router.get("/", listRestaurants);
router.get("/filters", getRestaurantFilters);
router.get("/sections", getRestaurantSections);
router.get("/recommended/me", protect, allowRoles(ROLES.CUSTOMER), getRecommendedRestaurants);
router.get("/:code/image/:kind", getRestaurantImage);
router.get("/:code", getRestaurantByCode);

export default router;
