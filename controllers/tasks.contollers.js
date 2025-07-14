import { connectDB } from "../lib/db.js";
import { transporter } from "../lib/emailService.js";
import dotenv from "dotenv";
dotenv.config();

export const createTask = async (req, res) => {
  const { title, description, deadline, status, assigned_to } = req.body;

  if (!title || !assigned_to) {
    return res.status(400).json({
      error: "Title and assigned user ID are required",
    });
  }

  try {
    const db = await connectDB();

    const [result] = await db.execute(
      `INSERT INTO tasks (title, description, deadline, status, assigned_to)
         VALUES (?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        deadline || null,
        status || "Pending",
        assigned_to,
      ]
    );

    // fetch the user's email and name for notification
    const [userRows] = await db.execute(
      `SELECT email, name FROM users WHERE id = ?`,
      [assigned_to]
    );
    const user = userRows[0];
    if (!user) {
      return res.status(404).json({ error: "Assigned user not found" });
    }

    // Send email notification to the user
    await transporter.sendMail({
      from: `"Task Manager" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "New Task Assigned",
      html: `<p>Hi ${user.name},</p>
          <p>You have been assigned a new task:</p>
          <ul>
            <li><strong>Title:</strong> ${title}</li>
            <li><strong>Description:</strong> ${description}</li>
            <li><strong>Deadline:</strong> ${deadline || "Not specified"}</li>
          </ul>
          <p>Please login to your dashboard to manage it.</p>
          `,
    });
    res.status(201).json({
      message: "Task created successfully",
      taskId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllTasksWithUsers = async (req, res) => {
  try {
    const db = await connectDB();

    const [rows] = await db.execute(`
        SELECT 
          tasks.id AS task_id,
          tasks.title,
          tasks.description,
          tasks.deadline,
          tasks.status,
          users.id AS user_id,
          users.name AS assigned_user,
          users.email AS assigned_email
        FROM tasks
        LEFT JOIN users ON tasks.assigned_to = users.id
        ORDER BY tasks.created_at DESC
      `);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching tasks with users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTaskDeadline = async (req, res) => {
  const { taskId } = req.params;
  const { deadline } = req.body;

  if (!deadline) {
    return res.status(400).json({ error: "New deadline is required" });
  }

  try {
    const db = await connectDB();

    const [result] = await db.execute(
      `UPDATE tasks SET deadline = ? WHERE id = ?`,
      [deadline, taskId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Deadline updated successfully" });
  } catch (error) {
    console.error("Error updating deadline:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getTasksByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const db = await connectDB();

    const [tasks] = await db.execute(
      `
        SELECT 
          tasks.id AS task_id,
          tasks.title,
          tasks.description,
          tasks.deadline,
          tasks.status,
          users.id AS user_id,
          users.name AS assigned_user,
          users.email AS assigned_email
        FROM tasks
        JOIN users ON tasks.assigned_to = users.id
        WHERE users.id = ?
        ORDER BY tasks.created_at DESC
        `,
      [userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this user" });
    }

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks by user ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const db = await connectDB();

    const [result] = await db.execute(
      `UPDATE tasks SET status = ? WHERE id = ?`,
      [status, taskId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task status updated successfully" });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    const db = await connectDB();
    const [result] = await db.execute(`DELETE FROM tasks WHERE id = ?`, [
      taskId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
