
import db from "../config/db.js";

// Get all categories
export const getAllCategories = async (req, res, next) => {
  try {
    const [categories] = await db.query(`
      SELECT
        id,
        name,
        description,
        image_url,
        created_at
      FROM categories
      ORDER BY name ASC
    `);

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// Get one category by ID
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const [categories] = await db.query(
      `SELECT id, name, description, image_url, created_at
       FROM categories
       WHERE id = ?`,
      [id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category: categories[0],
    });
  } catch (error) {
    next(error);
  }
};
