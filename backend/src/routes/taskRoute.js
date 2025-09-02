import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByUser,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById).put("/:id", updateTask);
router.delete("/:id", deleteTask);

// 🔹 New route to get tasks assigned to a specific user
router.get("/assigned/:uid", getTasksByUser);

export default router;
