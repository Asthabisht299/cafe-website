
import db from "../config/db.js";

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanEmail.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    await db.query(
      "INSERT INTO newsletter_subscribers (email) VALUES (?)",
      [cleanEmail]
    );

    return res.status(201).json({
      success: true,
      message: "Successfully subscribed to our newsletter!",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed.",
      });
    }

    next(error);
  }
};
