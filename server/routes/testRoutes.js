
import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DATABASE() AS database_name");

    res.status(200).json({
      success: true,
      message: "Database API working successfully!",
      database: rows[0].database_name,
    });
  } catch (error) {
    console.error("Database API error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database query failed",
    });
  }
});

export default router;
