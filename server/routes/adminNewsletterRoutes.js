
import express from "express";
import {
  getSubscribers,
  deleteSubscriber,
} from "../controllers/adminNewsletterController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/admin/newsletter", adminMiddleware, getSubscribers);
router.delete("/admin/newsletter/:id", adminMiddleware, deleteSubscriber);

export default router;
