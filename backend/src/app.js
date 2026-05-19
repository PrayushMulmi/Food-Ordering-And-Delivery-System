import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware.js";
import { protect } from "./middleware/authMiddleware.js";
import { allowRoles } from "./middleware/roleMiddleware.js";
import { ROLES } from "./constants/roles.js";
import { updateMyTheme } from "./controllers/authController.js";
import { updateMyRestaurantOpenStatus } from "./controllers/restaurantAdminController.js";

const app = express();

const configuredOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://192.168.1.10:5173",
  "http://192.168.1.219:5173",
  ...(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const localhostOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
const localNetworkOriginPattern = /^http:\/\/((10|172\.(1[6-9]|2\d|3[0-1])|192\.168)\.\d{1,3}\.\d{1,3}):\d+$/;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (
        configuredOrigins.includes(origin) ||
        localhostOriginPattern.test(origin) ||
        localNetworkOriginPattern.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Food Ordering API is running" });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

// Direct aliases for the two high-frequency settings/status endpoints.
// They sit before the route bundle so older frontend builds and Vite proxies hit
// the exact documented URLs without falling through to the 404 handler.
app.put("/api/auth/me/theme", protect, updateMyTheme);
app.put(
  "/api/restaurant-admin/restaurant/status",
  protect,
  allowRoles(ROLES.RESTAURANT_ADMIN),
  updateMyRestaurantOpenStatus,
);

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
