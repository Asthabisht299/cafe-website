
import express from "express";

import {
  getAllTables,
  addTable,
  updateTableStatus,
  deleteTable,
} from "../controllers/adminTableController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(adminMiddleware);

router.get("/tables", getAllTables);
router.post("/tables", addTable);
router.patch("/tables/:id/status", updateTableStatus);
router.delete("/tables/:id", deleteTable);

export default router;
