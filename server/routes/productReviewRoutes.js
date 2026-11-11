import express from "express";
import { body, param, validationResult } from "express-validator";
import {
  createProductReview,
  getProductReviewsForAdmin,
} from "../controllers/productReviewController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Please check your review details.",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }
  next();
};

router.post(
  "/orders/track/:token/reviews",
  [
    param("token").matches(/^[a-f0-9]{64}$/i)
      .withMessage("Invalid order tracking token."),
    body("product_id").isInt({ min: 1 }).withMessage("Invalid product."),
    body("rating").isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars."),
    body("review").optional({ values: "null" }).isString()
      .isLength({ max: 1000 }).withMessage("Review cannot exceed 1,000 characters."),
  ],
  validateRequest,
  createProductReview
);

router.get("/admin/product-reviews", adminMiddleware, getProductReviewsForAdmin);

export default router;
