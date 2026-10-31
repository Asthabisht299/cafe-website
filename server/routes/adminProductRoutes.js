import express from "express";

import {
  getAdminProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/adminProductController.js";

import {
  getProductOptions,
  addProductOption,
  updateProductOption,
  deleteProductOption,
} from "../controllers/adminProductOptionController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Product management
router.get("/admin/products", adminMiddleware, getAdminProducts);
router.post("/admin/products", adminMiddleware, addProduct);
router.put("/admin/products/:id", adminMiddleware, updateProduct);
router.delete("/admin/products/:id", adminMiddleware, deleteProduct);

// Product customization management
router.get(
  "/admin/products/:productId/options",
  adminMiddleware,
  getProductOptions
);

router.post(
  "/admin/products/:productId/options",
  adminMiddleware,
  addProductOption
);

router.put(
  "/admin/products/:productId/options/:optionId",
  adminMiddleware,
  updateProductOption
);

router.delete(
  "/admin/products/:productId/options/:optionId",
  adminMiddleware,
  deleteProductOption
);

export default router;