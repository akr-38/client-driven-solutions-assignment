import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoute.js";
import authRoutes from "./routes/auth.js"; // 🔹 import auth routes

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes); // 🔹 use auth routes

// Connect DB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ DB connection error:", err));
