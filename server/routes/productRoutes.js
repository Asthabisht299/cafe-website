
import express from "express";

import {
  getAllProducts,
  getProductById,
  getProductReviews,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/products", getAllProducts);
router.get("/products/:id/reviews", getProductReviews);
router.get("/products/:id", getProductById);

export default router;
