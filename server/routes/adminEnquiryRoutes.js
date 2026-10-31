import express from "express";

import {
  getAllEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../controllers/adminEnquiryController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Get all enquiries
router.get("/admin/enquiries", adminMiddleware, getAllEnquiries);

// Update enquiry status
router.patch(
  "/admin/enquiries/:id/status",
  adminMiddleware,
  updateEnquiryStatus
);

// Delete enquiry
router.delete("/admin/enquiries/:id", adminMiddleware, deleteEnquiry);

export default router;