import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";
import {
  previewOrder,
  placeOrder,
  myOrders,
  getMyOrderByCode,
  cancelMyOrderByCode,
  restaurantOrders,
  updateRestaurantOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/preview", protect, allowRoles(ROLES.CUSTOMER), previewOrder);
router.post("/", protect, allowRoles(ROLES.CUSTOMER), placeOrder);
router.get("/my", protect, allowRoles(ROLES.CUSTOMER), myOrders);
router.get("/my/:code", protect, allowRoles(ROLES.CUSTOMER), getMyOrderByCode);
router.put("/my/:code/cancel", protect, allowRoles(ROLES.CUSTOMER), cancelMyOrderByCode);

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
