
import express from "express";

import {
  getAllCategories,
  getCategoryById,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);

export default router;
