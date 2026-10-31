
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const adminMiddleware = async (req, res, next) => {
  const token = req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Please log in as an admin.",
    });
  }

  if (!process.env.JWT_SECRET) {
    return next(new Error("JWT_SECRET is not configured."));
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session.",
    });
  }

  if (
    !decoded ||
    typeof decoded !== "object" ||
    !Number.isInteger(Number(decoded.id)) ||
    Number(decoded.id) <= 0
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid login session.",
    });
  }

  try {
    const [users] = await db.query(
      `SELECT id, name, email, role
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [decoded.id]
    );

    if (users.length === 0 || users[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access denied.",
      });
    }

    req.admin = users[0];

    next();
  } catch (error) {
    next(error);
  }
};

export default adminMiddleware;
