import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
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
