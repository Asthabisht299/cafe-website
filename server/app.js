
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import testRoutes from "./routes/testRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminCategoryRoutes from "./routes/adminCategoryRoutes.js";
import adminUploadRoutes from "./routes/adminUploadRoutes.js";
import adminEnquiryRoutes from "./routes/adminEnquiryRoutes.js";
import adminTableRoutes from "./routes/adminTableRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import adminNewsletterRoutes from "./routes/adminNewsletterRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import productReviewRoutes from "./routes/productReviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

// Security headers
app.use(helmet());

// Allow requests from React frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// IMPORTANT: Preserve raw body for Razorpay webhook signature verification.
// This must run BEFORE express.json().
app.use(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
    limit: "100kb",
  })
);

// Common middleware
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cafe backend is running successfully!",
  });
});

// Payment routes
app.use("/api/payments", paymentRoutes);

// Existing API routes
app.use("/api", testRoutes);
app.use("/api", productRoutes);
app.use("/api", categoryRoutes);
app.use("/api", orderRoutes);
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", adminOrderRoutes);
app.use("/api", adminProductRoutes);
app.use("/api", adminCategoryRoutes);
app.use("/api", adminUploadRoutes);
app.use("/api", adminEnquiryRoutes);
app.use("/api/admin", adminTableRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api", adminNewsletterRoutes);
app.use("/api", productReviewRoutes);

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global error handler
app.use(errorMiddleware);

export default app;
