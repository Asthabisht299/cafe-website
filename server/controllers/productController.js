
import db from "../config/db.js";

// Get all available products with customer ratings
export const getAllProducts = async (req, res, next) => {
  try {
    const [products] = await db.query(`
      SELECT
        p.id,
        p.category_id,
        c.name AS category_name,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.is_available,
        review_stats.average_rating,
        COALESCE(review_stats.total_reviews, 0) AS total_reviews
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      LEFT JOIN (
        SELECT
          product_id,
          ROUND(AVG(rating), 1) AS average_rating,
          COUNT(*) AS total_reviews
        FROM product_reviews
        GROUP BY product_id
      ) review_stats
        ON review_stats.product_id = p.id
      WHERE p.is_available = 1
      ORDER BY p.id DESC
    `);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Get one product with customization options and ratings
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Fetch product with its rating summary
    const [products] = await db.query(
      `SELECT
        p.id,
        p.category_id,
        c.name AS category_name,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.is_available,
        review_stats.average_rating,
        COALESCE(review_stats.total_reviews, 0) AS total_reviews
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      LEFT JOIN (
        SELECT
          product_id,
          ROUND(AVG(rating), 1) AS average_rating,
          COUNT(*) AS total_reviews
        FROM product_reviews
        GROUP BY product_id
      ) review_stats
        ON review_stats.product_id = p.id
      WHERE p.id = ? AND p.is_available = 1`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Fetch customization options
    const [options] = await db.query(
      `SELECT
        id,
        option_name,
        additional_price
      FROM product_options
      WHERE product_id = ?
      ORDER BY id ASC`,
      [id]
    );

    const product = {
      ...products[0],
      options: options.map((option) => ({
        ...option,
        additional_price: Number(option.additional_price || 0),
      })),
    };

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};


// Get customer reviews for one available product
export const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const [products] = await db.query(
      `SELECT id
       FROM products
       WHERE id = ? AND is_available = 1
       LIMIT 1`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const [reviews] = await db.query(
      `SELECT
        r.id,
        r.rating,
        r.review,
        r.created_at,
        SUBSTRING_INDEX(o.customer_name, ' ', 1) AS customer_name
       FROM product_reviews r
       INNER JOIN orders o
         ON o.id = r.order_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id]
    );

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

