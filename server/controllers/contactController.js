import db from "../config/db.js";

export const createEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Check required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof message !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and message are required.",
      });
    }

    // Check maximum field lengths
    if (
      name.trim().length > 100 ||
      email.trim().length > 150 ||
      phone.trim().length > 20 ||
      (subject &&
        (typeof subject !== "string" || subject.trim().length > 200)) ||
      message.trim().length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Allow digits, spaces, +, hyphens and parentheses in phone numbers
    if (!/^[+0-9\s()-]+$/.test(cleanPhone) || !/\d{7,15}/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number.",
      });
    }

    // Save enquiry in database
    await db.query(
      `INSERT INTO contact_enquiries
       (name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        cleanEmail,
        cleanPhone,
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