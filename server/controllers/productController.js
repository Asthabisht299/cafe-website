
import db from "../config/db.js";

// Get all available products
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
        p.is_available
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
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

// Get one product with customization options
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Fetch product
    const [products] = await db.query(
      `SELECT
        p.id,
        p.category_id,
        c.name AS category_name,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.is_available
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
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
