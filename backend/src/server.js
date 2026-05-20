import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { pool, initializeDatabase } from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initializeDatabase();
    const connection = await pool.getConnection();
    connection.release();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
