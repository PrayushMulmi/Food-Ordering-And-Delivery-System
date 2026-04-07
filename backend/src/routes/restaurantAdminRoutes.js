import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";
import {
  createMyRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  getRestaurantDashboard,
  createCoupon,
  listCoupons,
  updateCoupon,
  deleteCoupon,
} from "../controllers/restaurantAdminController.js";

const router = express.Router();

router.use(protect, allowRoles(ROLES.RESTAURANT_ADMIN));

router.post("/restaurant", createMyRestaurant);
router.get("/restaurant", getMyRestaurant);
router.put("/restaurant", updateMyRestaurant);

router.get("/dashboard", getRestaurantDashboard);

router.get("/coupons", listCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);

export default router;
