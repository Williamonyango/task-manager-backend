import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

//  connect to database
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Task Manager API");
});
app.use("/api/auth", authRoutes);
app.use("/api/", tasksRoutes);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
