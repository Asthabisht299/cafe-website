
import express from "express";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create Razorpay payment order
router.post("/create-order", createRazorpayOrder);

// Verify Razorpay payment signature
router.post("/verify", verifyRazorpayPayment);

// Receive Razorpay webhook events
router.post("/webhook", handleRazorpayWebhook);

export default router;
