import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { loginUser, getAllUsers, addUser } from "../controllers/authController.js";

const router = express.Router();

// POST /auth/login
router.post("/login", verifyToken, loginUser);

// GET /auth/users  → Admin only
router.get("/users", verifyToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}, getAllUsers);

// POST /auth/users → Admin only
router.post("/users", verifyToken, async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}, addUser);

export default router;
