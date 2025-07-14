import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

//  connect to database
connectDB();

app.use(express.json());
app.use(
  cors({
    origin: "https://task-manager-imtv.onrender.com/",
    credentials: true,
  })
);
app.use;
cookieParser();

app.get("/", (req, res) => {
  res.send("Welcome to the Task Manager API");
});
app.use("/api/auth", authRoutes);
app.use("/api/", tasksRoutes);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
