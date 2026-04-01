import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";
import {
  getSuperAdminDashboard,
  listUsers,
  listRestaurants,
  suspendUser,
  restoreUser,
  permanentlyDeleteUser,
  suspendRestaurant,
  restoreRestaurant,
  permanentlyDeleteRestaurant,
  resetUserPasswordByAdmin,
} from "../controllers/superAdminController.js";

const router = express.Router();

router.use(protect, allowRoles(ROLES.SUPER_ADMIN));

router.get("/dashboard", getSuperAdminDashboard);

router.get("/users", listUsers);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/restore", restoreUser);
router.delete("/users/:id", permanentlyDeleteUser);
router.put("/users/:id/reset-password", resetUserPasswordByAdmin);

router.get("/restaurants", listRestaurants);
router.put("/restaurants/:id/suspend", suspendRestaurant);
router.put("/restaurants/:id/restore", restoreRestaurant);
router.delete("/restaurants/:id", permanentlyDeleteRestaurant);

export default router;
