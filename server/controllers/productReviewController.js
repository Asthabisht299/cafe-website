import db from "../config/db.js";

// Submit one review for a product that was part of a completed order.
export const createProductReview = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { product_id, rating, review } = req.body;

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({ success: false, message: "Invalid order tracking token." });
    }

    const productId = Number(product_id);
    const stars = Number(rating);
    const reviewText = typeof review === "string" ? review.trim() : "";

    if (!Number.isInteger(productId) || productId < 1 ||
        !Number.isInteger(stars) || stars < 1 || stars > 5 ||
        reviewText.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Choose a rating from 1 to 5 stars. Reviews must be 1,000 characters or fewer.",
      });
    }

    const [orders] = await db.query(
      "SELECT id, order_status FROM orders WHERE tracking_token = ? LIMIT 1",
      [token]
    );

    if (!orders.length) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const order = orders[0];

    if (order.order_status !== "completed") {
      return res.status(403).json({
        success: false,
        message: "You can review items after your order is completed.",
      });
    }

    const [orderedItems] = await db.query(
      "SELECT id FROM order_items WHERE order_id = ? AND product_id = ? LIMIT 1",
      [order.id, productId]
    );

    if (!orderedItems.length) {
      return res.status(403).json({
        success: false,
        message: "This product was not included in your order.",
      });
    }

    await db.query(
      "INSERT INTO product_reviews (order_id, product_id, rating, review) VALUES (?, ?, ?, ?)",
      [order.id, productId, stars, reviewText || null]
    );

    return res.status(201).json({
      success: true,
      message: "Thank you! Your rating has been submitted.",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this item for this order.",
      });
    }
    next(error);
  }
};

// Admin-only route: all reviews, newest first.
export const getProductReviewsForAdmin = async (req, res, next) => {
  try {
    const [reviews] = await db.query(`
      SELECT
        r.id,
        r.order_id,
        r.product_id,
        p.name AS product_name,
        o.customer_name,
        r.rating,
        r.review,
        r.created_at
      FROM product_reviews r
      INNER JOIN products p ON p.id = r.product_id
      INNER JOIN orders o ON o.id = r.order_id
      ORDER BY r.created_at DESC
    `);

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};
