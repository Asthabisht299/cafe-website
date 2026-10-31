
import db from "../config/db.js";

// Get all products (including unavailable products)
export const getAdminProducts = async (req, res, next) => {
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
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Add a new product
export const addProduct = async (req, res, next) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      image_url,
      is_available,
    } = req.body;

    if (!name || !name.trim() || price === undefined || price === "") {
      return res.status(400).json({
        success: false,
        message: "Product name and price are required.",
      });
    }

    const productPrice = Number(price);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid product price.",
      });
    }

    const categoryId =
      category_id === "" || category_id === undefined || category_id === null
        ? null
        : Number(category_id);

    if (
      categoryId !== null &&
      (!Number.isInteger(categoryId) || categoryId < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
    }

    if (categoryId !== null) {
      const [categories] = await db.query(
        "SELECT id FROM categories WHERE id = ?",
        [categoryId]
      );

      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected category does not exist.",
        });
      }
    }

    const available =
      is_available === undefined ? 1 : Number(is_available);

    if (![0, 1].includes(available)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability value.",
      });
    }

    const [result] = await db.query(
      `INSERT INTO products
       (category_id, name, description, price, image_url, is_available)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        categoryId,
        name.trim(),
        description?.trim() || null,
        productPrice,
        image_url?.trim() || null,
        available,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Product added successfully.",
      product_id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};

// Update a product
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const {
      category_id,
      name,
      description,
      price,
      image_url,
      is_available,
    } = req.body;

    if (!name || !name.trim() || price === undefined || price === "") {
      return res.status(400).json({
        success: false,
        message: "Product name and price are required.",
      });
    }

    const productPrice = Number(price);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid product price.",
      });
    }

    const categoryId =
      category_id === "" || category_id === undefined || category_id === null
        ? null
        : Number(category_id);

    if (
      categoryId !== null &&
      (!Number.isInteger(categoryId) || categoryId < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
    }

    if (categoryId !== null) {
      const [categories] = await db.query(
        "SELECT id FROM categories WHERE id = ?",
        [categoryId]
      );

      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected category does not exist.",
        });
      }
    }

    const available =
      is_available === undefined ? 1 : Number(is_available);

    if (![0, 1].includes(available)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability value.",
      });
    }

    const [result] = await db.query(
      `UPDATE products
       SET category_id = ?, name = ?, description = ?,
           price = ?, image_url = ?, is_available = ?
       WHERE id = ?`,
      [
        categoryId,
        name.trim(),
        description?.trim() || null,
        productPrice,
        image_url?.trim() || null,
        available,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        "SELECT id FROM products WHERE id = ?",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // Prevent deletion if the product has appeared in an order.
    const [orderItems] = await db.query(
      "SELECT id FROM order_items WHERE product_id = ? LIMIT 1",
      [id]
    );

    if (orderItems.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This product belongs to an order. Mark it unavailable instead of deleting it.",
      });
    }

    const [result] = await db.query(
      "DELETE FROM products WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
