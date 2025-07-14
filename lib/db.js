import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    console.log("Database connected successfully");
    return connection;
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
