
import db from "../config/db.js";

// Get all categories for admin
export const getAdminCategories = async (req, res, next) => {
  try {
    const [categories] = await db.query(`
      SELECT
        c.id,
        c.name,
        c.description,
        c.image_url,
        c.created_at,
        COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// Add category
export const addCategory = async (req, res, next) => {
  try {
    const { name, description, image_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Category name must not exceed 100 characters.",
      });
    }

    const [existing] = await db.query(
      "SELECT id FROM categories WHERE name = ?",
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This category already exists.",
      });
    }

    const [result] = await db.query(
      `INSERT INTO categories (name, description, image_url)
       VALUES (?, ?, ?)`,
      [
        name.trim(),
        description?.trim() || null,
        image_url?.trim() || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Category added successfully.",
      category_id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This category already exists.",
      });
    }

    next(error);
  }
};

// Update category
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Category name must not exceed 100 characters.",
      });
    }

    const [result] = await db.query(
      `UPDATE categories
       SET name = ?, description = ?, image_url = ?
       WHERE id = ?`,
      [
        name.trim(),
        description?.trim() || null,
        image_url?.trim() || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        "SELECT id FROM categories WHERE id = ?",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists.",
      });
    }

    next(error);
  }
};

// Delete category
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    // Check whether products use this category
    const [products] = await db.query(
      "SELECT id FROM products WHERE category_id = ? LIMIT 1",
      [id]
    );

    if (products.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This category contains products. Move or remove those products first.",
      });
    }

    const [result] = await db.query(
      "DELETE FROM categories WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
