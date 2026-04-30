import express from "express";
import authRoutes from "./authRoutes.js";
import restaurantRoutes from "./restaurantRoutes.js";
import menuRoutes from "./menuRoutes.js";
import basketRoutes from "./basketRoutes.js";
import orderRoutes from "./orderRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import restaurantAdminRoutes from "./restaurantAdminRoutes.js";
import superAdminRoutes from "./superAdminRoutes.js";
import riderRoutes from "./riderRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/restaurants", restaurantRoutes);
router.use("/menu", menuRoutes);
router.use("/basket", basketRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/restaurant-admin", restaurantAdminRoutes);
router.use("/super-admin", superAdminRoutes);
router.use("/rider", riderRoutes);

export default router;
