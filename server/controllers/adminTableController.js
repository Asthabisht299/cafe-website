
import db from "../config/db.js";
import crypto from "crypto";

// GET all tables
export const getAllTables = async (req, res, next) => {
  try {
    const [tables] = await db.query(
      `SELECT id, table_number, qr_token, status, created_at
       FROM cafe_tables
       ORDER BY id ASC`
    );

    res.status(200).json({
      success: true,
      count: tables.length,
      tables,
    });
  } catch (error) {
    next(error);
  }
};

// ADD a new table
export const addTable = async (req, res, next) => {
  try {
    const { table_number } = req.body;

    if (
      typeof table_number !== "string" ||
      !/^[a-zA-Z0-9-]{1,20}$/.test(table_number.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid table number.",
      });
    }

    const cleanTableNumber = table_number.trim();

    const [existing] = await db.query(
      "SELECT id FROM cafe_tables WHERE table_number = ?",
      [cleanTableNumber]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This table number already exists.",
      });
    }

    // Generate a unique 64-character secure token
    const qrToken = crypto.randomBytes(32).toString("hex");

    const [result] = await db.query(
      `INSERT INTO cafe_tables (table_number, qr_token)
       VALUES (?, ?)`,
      [cleanTableNumber, qrToken]
    );

    res.status(201).json({
      success: true,
      message: "Table added successfully.",
      table: {
        id: result.insertId,
        table_number: cleanTableNumber,
        qr_token: qrToken,
        status: "active",
      },
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE table status
export const updateTableStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid table ID.",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive.",
      });
    }

    const [result] = await db.query(
      "UPDATE cafe_tables SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Table not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Table status updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE a table
export const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid table ID.",
      });
    }

    const [result] = await db.query(
      "DELETE FROM cafe_tables WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Table not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Table deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
