import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";
import {
  placeOrder,
  myOrders,
  getMyOrderById,
  cancelMyOrder,
  restaurantOrders,
  updateRestaurantOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, allowRoles(ROLES.CUSTOMER), placeOrder);
router.get("/my", protect, allowRoles(ROLES.CUSTOMER), myOrders);
router.get("/my/:id", protect, allowRoles(ROLES.CUSTOMER), getMyOrderById);
router.put(
  "/my/:id/cancel",
  protect,
  allowRoles(ROLES.CUSTOMER),
  cancelMyOrder,
);

router.get(
  "/restaurant",
  protect,
  allowRoles(ROLES.RESTAURANT_ADMIN),
  restaurantOrders,
);
router.put(
  "/restaurant/:id/status",
  protect,
  allowRoles(ROLES.RESTAURANT_ADMIN),
  updateRestaurantOrderStatus,
);

export default router;
