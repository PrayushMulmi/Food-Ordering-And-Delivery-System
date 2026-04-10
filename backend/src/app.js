import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (configuredOrigins.includes(origin) || localhostOriginPattern.test(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan("dev"));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Food Ordering API is running' });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
