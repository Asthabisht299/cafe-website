
import db from "../config/db.js";

// Get all newsletter subscribers
export const getSubscribers = async (req, res, next) => {
  try {
    const [subscribers] = await db.query(`
      SELECT id, email, subscribed_at
      FROM newsletter_subscribers
      ORDER BY subscribed_at DESC
    `);

    return res.status(200).json({
      success: true,
      subscribers,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a subscriber
export const deleteSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscriber ID.",
      });
    }

    const [result] = await db.query(
      "DELETE FROM newsletter_subscribers WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
