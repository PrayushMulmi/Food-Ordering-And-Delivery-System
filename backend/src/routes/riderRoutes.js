import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";
import {
  getRiderDashboard,
  listMyAssignedOrders,
  getMyAssignedOrderDetail,
  updateMyLocation,
  updateMyAvailability,
} from "../controllers/riderController.js";

const router = express.Router();
router.use(protect, allowRoles(ROLES.RIDER));
router.get('/dashboard', getRiderDashboard);
router.get('/orders', listMyAssignedOrders);
router.get('/orders/:id', getMyAssignedOrderDetail);
router.put('/location', updateMyLocation);
router.put('/availability', updateMyAvailability);
export default router;
