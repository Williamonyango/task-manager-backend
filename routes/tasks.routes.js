import express from "express";
import {
  createTask,
  getAllTasksWithUsers,
  updateTaskDeadline,
  getTasksByUserId,
  updateTaskStatus,
  deleteTask,
} from "../controllers/tasks.contollers.js";

const router = express.Router();

router.get("/tasks", getAllTasksWithUsers);
router.post("/tasks", createTask);
router.put("/update-deadline/:taskId", updateTaskDeadline);
router.get("/user-tasks/:userId", getTasksByUserId);
router.put("/update-task-status/:taskId", updateTaskStatus);
router.delete("/tasks/:taskId", deleteTask);

export default router;
