import db from "../config/db.js";

// Get all customization options for a product
export const getProductOptions = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!/^[1-9]\d*$/.test(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const [products] = await db.query(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const [options] = await db.query(
      `SELECT id, product_id, option_name, additional_price
       FROM product_options
       WHERE product_id = ?
       ORDER BY id DESC`,
      [productId]
    );

    return res.status(200).json({
      success: true,
      options: options.map((option) => ({
        ...option,
        additional_price: Number(option.additional_price),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Add a customization option
export const addProductOption = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { option_name, additional_price } = req.body;

    if (!/^[1-9]\d*$/.test(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    if (
      typeof option_name !== "string" ||
      !option_name.trim() ||
      option_name.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Option name is required and must be under 100 characters.",
      });
    }

    if (
      additional_price === undefined ||
      additional_price === null ||
      additional_price === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Additional price is required.",
      });
    }

    const price = Number(additional_price);

    if (!Number.isFinite(price) || price < 0 || price > 9999999.99) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid additional price.",
      });
    }

    const [products] = await db.query(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const [result] = await db.query(
      `INSERT INTO product_options
       (product_id, option_name, additional_price)
       VALUES (?, ?, ?)`,
      [productId, option_name.trim(), price]
    );

    return res.status(201).json({
      success: true,
      message: "Customization option added successfully.",
      option_id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};

// Update a customization option
export const updateProductOption = async (req, res, next) => {
  try {
    const { productId, optionId } = req.params;
    const { option_name, additional_price } = req.body;

    if (
      !/^[1-9]\d*$/.test(productId) ||
      !/^[1-9]\d*$/.test(optionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product or option ID.",
      });
    }

    if (
      typeof option_name !== "string" ||
      !option_name.trim() ||
      option_name.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid option name.",
      });
    }

    if (
      additional_price === undefined ||
      additional_price === null ||
      additional_price === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Additional price is required.",
      });
    }

    const price = Number(additional_price);

    if (!Number.isFinite(price) || price < 0 || price > 9999999.99) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid additional price.",
      });
    }

    const [result] = await db.query(
      `UPDATE product_options
       SET option_name = ?, additional_price = ?
       WHERE id = ? AND product_id = ?`,
      [option_name.trim(), price, optionId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customization option not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customization option updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Delete a customization option
export const deleteProductOption = async (req, res, next) => {
  try {
    const { productId, optionId } = req.params;

    if (
      !/^[1-9]\d*$/.test(productId) ||
      !/^[1-9]\d*$/.test(optionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product or option ID.",
      });
    }

    const [result] = await db.query(
      `DELETE FROM product_options
       WHERE id = ? AND product_id = ?`,
      [optionId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customization option not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customization option deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};