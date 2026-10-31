
import express from "express";
import { createEnquiry } from "../controllers/contactController.js";

const router = express.Router();

router.post("/", createEnquiry);

export default router;
