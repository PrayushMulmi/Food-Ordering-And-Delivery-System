import { Router } from "express";
import { getRestaurants, getRestaurantById } from "../controllers/restaurantController.js";

const router = Router();
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);
export default router;
