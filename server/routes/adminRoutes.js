
import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Dashboard statistics - admin only
router.get(
  "/admin/dashboard",
  adminMiddleware,
  getDashboardStats
);

export default router;
