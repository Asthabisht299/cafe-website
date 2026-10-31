
import express from "express";
import { param, body, validationResult } from "express-validator";
import {
  getAllOrders,
  updateOrderStatus,
} from "../controllers/adminOrderController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Get all orders
router.get("/admin/orders", adminMiddleware, getAllOrders);

// Update order status
router.patch(
  "/admin/orders/:id/status",
  adminMiddleware,
  [
    param("id").isInt({ min: 1 }).withMessage("Invalid order ID."),
    body("order_status")
      .isIn([
        "placed",
        "confirmed",
        "preparing",
        "ready",
        "completed",
        "cancelled",
      ])
      .withMessage("Invalid order status."),
  ],
(req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Invalid order details.",
      errors: errors.array(),
    });
  }

  next();
},
  updateOrderStatus
);

export default router;
