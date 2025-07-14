import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  // Validate input
  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ error: "Email, name and password are required" });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to the database
    const connection = await connectDB();
    const [result] = await connection.execute(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
      [email, hashedPassword, name]
    );

    res
      .status(201)
      .json({ message: "User created successfully", userId: result.insertId });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Fetch user from the database
    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Set the token in a cookie
    res.cookie("token", token, {
      httpOnly: false, // true in production
      secure: false,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie("role", user.role, {
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("userId", user.id, {
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      userId: user.id,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const connection = await connectDB();
    const [result] = await connection.execute(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error during user deletion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT id, email, name, role FROM users"
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  // Validate input
  if (!role) {
    return res.status(400).json({ error: "Role is required" });
  }

  try {
    const connection = await connectDB();
    const [result] = await connection.execute(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserbyId = async (req, res) => {
  const { userId } = req.params;
  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT id, email, name, role FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: false,
    sameSite: "Lax",
    secure: false,
  });

  res.clearCookie("role", {
    httpOnly: false,
    sameSite: "Lax",
    secure: false,
  });

  res.clearCookie("userId", {
    httpOnly: false,
    sameSite: "Lax",
    secure: false,
  });

  return res.status(200).json({ message: "Logged out successfully" });
};
