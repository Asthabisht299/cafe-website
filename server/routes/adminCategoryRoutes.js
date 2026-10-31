
import express from "express";

import {
  getAdminCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/adminCategoryController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/admin/categories", adminMiddleware, getAdminCategories);

router.post("/admin/categories", adminMiddleware, addCategory);

router.put("/admin/categories/:id", adminMiddleware, updateCategory);

router.delete("/admin/categories/:id", adminMiddleware, deleteCategory);

export default router;
