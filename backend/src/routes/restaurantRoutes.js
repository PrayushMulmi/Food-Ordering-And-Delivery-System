import express from "express";
import {
  listRestaurants,
  getRestaurantById,
} from "../controllers/restaurantController.js";

const router = express.Router();

router.get("/", listRestaurants);
router.get("/:id", getRestaurantById);

export default router;
