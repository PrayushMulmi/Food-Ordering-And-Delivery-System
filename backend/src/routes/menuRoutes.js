// v4
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController.js";

const router = express.Router();

router.post("/", protect, allowRoles(ROLES.RESTAURANT_ADMIN), createMenuItem);
router.put("/:id", protect, allowRoles(ROLES.RESTAURANT_ADMIN), updateMenuItem);
router.delete(
  "/:id",
  protect,
  allowRoles(ROLES.RESTAURANT_ADMIN),
  deleteMenuItem,
);

export default router;
