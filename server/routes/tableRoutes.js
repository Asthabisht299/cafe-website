
import express from "express";
import { verifyTableToken } from "../controllers/tableController.js";

const router = express.Router();

router.get("/verify/:token", verifyTableToken);

export default router;
