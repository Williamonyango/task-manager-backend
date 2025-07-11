import express from "express";

import {
  signup,
  login,
  deleteUser,
  getUsers,
  updateRole,
  getUserbyId,
} from "../controllers/auth.controllers.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/delete/:userId", deleteUser);
router.get("/users", getUsers);
router.get("/user/:userId", getUserbyId);
router.post("/user/role/:userId", updateRole);
// router.get("/logout", logout);

export default router;
