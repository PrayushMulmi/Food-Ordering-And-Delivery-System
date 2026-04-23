<<<<<<< HEAD
import express from "express";
import { listRestaurants, getRestaurantById, getRestaurantFilters, getRestaurantSections } from "../controllers/restaurantController.js";

const router = express.Router();
router.get("/", listRestaurants);
router.get("/filters", getRestaurantFilters);
router.get("/sections", getRestaurantSections);
router.get("/:id", getRestaurantById);

=======
import { Router } from "express";
import { getRestaurants, getRestaurantById } from "../controllers/restaurantController.js";

const router = Router();
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);
>>>>>>> origin/main
export default router;
