
import express from "express";
import { body } from "express-validator";

import {
  adminLogin,
  getAdminProfile,
  adminLogout,
} from "../controllers/authController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin login
router.post(
  "/admin/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address."),

    body("password")
      .notEmpty()
      .withMessage("Password is required."),
  ],
  adminLogin
);

// Check admin session
router.get("/admin/me", adminMiddleware, getAdminProfile);

// Admin logout
router.post("/admin/logout", adminLogout);

export default router;
