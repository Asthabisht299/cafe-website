
import db from "../config/db.js";

export const createEnquiry = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    if (
      name.trim().length > 100 ||
      email.trim().length > 150 ||
      (subject && (typeof subject !== "string" || subject.trim().length > 200)) ||
      message.trim().length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    await db.query(
      `INSERT INTO contact_enquiries
       (name, email, subject, message)
       VALUES (?, ?, ?, ?)`,
      [
        name.trim(),
        cleanEmail,
        subject?.trim() || null,
        message.trim(),
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Your enquiry has been submitted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
