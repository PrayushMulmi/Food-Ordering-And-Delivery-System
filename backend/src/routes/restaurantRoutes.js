import express from "express";
import { listRestaurants, getRestaurantById, getRestaurantFilters, getRestaurantSections } from "../controllers/restaurantController.js";

const router = express.Router();
router.get("/", listRestaurants);
router.get("/filters", getRestaurantFilters);
router.get("/sections", getRestaurantSections);
router.get("/:id", getRestaurantById);

export default router;
//