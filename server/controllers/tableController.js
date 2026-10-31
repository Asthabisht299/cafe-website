
import db from "../config/db.js";

// Verify a customer's QR token
export const verifyTableToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({
        success: false,
        message: "Invalid table QR code.",
      });
    }

    const [tables] = await db.query(
      `SELECT table_number
       FROM cafe_tables
       WHERE qr_token = ? AND status = 'active'
       LIMIT 1`,
      [token]
    );

    if (tables.length === 0) {
      return res.status(404).json({
        success: false,
        message: "This table QR code is invalid or inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Table verified successfully.",
      table: {
        table_number: tables[0].table_number,
      },
    });
  } catch (error) {
    next(error);
  }
};
