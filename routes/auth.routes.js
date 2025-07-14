import express from "express";

import {
  signup,
  login,
  deleteUser,
  getUsers,
  updateRole,
  getUserbyId,
  logout,
} from "../controllers/auth.controllers.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.delete("/user/:userId", deleteUser);
router.get("/users", getUsers);
router.get("/user/:userId", getUserbyId);
router.put("/user/role/:userId", updateRole);
router.post("/logout", logout);

export default router;
