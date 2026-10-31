
import express from "express";
import { body, param, validationResult } from "express-validator";

import { createOrder } from "../controllers/orderController.js";
import { trackOrder } from "../controllers/trackingController.js";

const router = express.Router();

// Middleware to handle validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Please check the submitted information.",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

// Create a new order
router.post(
  "/orders",
  [
    body("customer_name")
      .trim()
      .notEmpty()
      .withMessage("Customer name is required.")
      .isLength({ max: 100 })
      .withMessage("Customer name is too long."),

    body("customer_email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address.")
      .isLength({ max: 150 })
      .withMessage("Email is too long."),

    body("customer_phone")
      .trim()
      .matches(/^\d{10}$/)
      .withMessage("Enter a valid 10-digit phone number."),

    body("order_type")
      .isIn(["takeaway", "dine_in"])
      .withMessage("Invalid order type."),

    body("items")
      .isArray({ min: 1 })
      .withMessage("Your cart is empty."),

    body("items.*.product_id")
      .isInt({ min: 1 })
      .withMessage("Invalid product ID."),

    body("items.*.quantity")
      .isInt({ min: 1, max: 50 })
      .withMessage("Quantity must be between 1 and 50."),

    body("table_token")
      .if((value, { req }) => req.body.order_type === "dine_in")
      .matches(/^[a-f0-9]{64}$/i)
      .withMessage("A valid table QR token is required."),

    body("notes")
      .optional({ values: "null" })
      .isString()
      .withMessage("Order notes must be text.")
      .isLength({ max: 500 })
      .withMessage("Order notes cannot exceed 500 characters."),
  ],
  validateRequest,
  createOrder
);

// Track an order using its secure token
router.get(
  "/orders/track/:token",
  [
    param("token")
      .matches(/^[a-f0-9]{64}$/i)
      .withMessage("Invalid tracking token."),
  ],
  validateRequest,
  trackOrder
);

export default router;
