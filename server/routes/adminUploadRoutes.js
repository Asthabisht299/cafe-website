
import express from "express";
import adminMiddleware from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { uploadProductImage } from "../controllers/adminUploadController.js";

const router = express.Router();

router.post(
  "/admin/upload/product-image",
  adminMiddleware,
  upload.single("image"),
  uploadProductImage
);

export default router;
