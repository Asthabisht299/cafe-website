
import crypto from "crypto";
import db from "../config/db.js";
import { validationResult } from "express-validator";

export const createOrder = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Please check your order details.",
      errors: errors.array(),
    });
  }

  const {
    customer_name,
    customer_email,
    customer_phone,
    order_type,
    table_token,
    notes,
    items,
  } = req.body;

  if (!["dine_in", "takeaway"].includes(order_type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order type.",
    });
  }

  if (
    order_type === "dine_in" &&
    (!table_token || !/^[a-f0-9]{64}$/i.test(table_token))
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid table QR code is required for dine-in orders.",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Your order must contain at least one item.",
    });
  }

  // Validate product IDs, quantities and option IDs
  for (const item of items) {
    if (
      !Number.isInteger(Number(item.product_id)) ||
      Number(item.product_id) <= 0 ||
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) < 1 ||
      Number(item.quantity) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product or quantity in your order.",
      });
    }

    if (
      item.option_ids !== undefined &&
      (!Array.isArray(item.option_ids) ||
        item.option_ids.some(
          (id) => !Number.isInteger(Number(id)) || Number(id) <= 0
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid customization options.",
      });
    }

    const optionIds = (item.option_ids || []).map(Number);

    if (new Set(optionIds).size !== optionIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate customization options are not allowed.",
      });
    }
  }

  const productIds = [
    ...new Set(items.map((item) => Number(item.product_id))),
  ];

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Verify the QR token and get the real table number
    let verifiedTableNumber = null;

    if (order_type === "dine_in") {
      const [tables] = await connection.query(
        `SELECT table_number
         FROM cafe_tables
         WHERE qr_token = ? AND status = 'active'
         LIMIT 1`,
        [table_token]
      );

      if (tables.length === 0) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Invalid or inactive table QR code. Please scan again.",
        });
      }

      verifiedTableNumber = tables[0].table_number;
    }

    const [products] = await connection.query(
      `SELECT id, name, price, is_available
       FROM products
       WHERE id IN (?)`,
      [productIds]
    );

    if (products.length !== productIds.length) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "One or more products were not found.",
      });
    }

    const productMap = new Map(
      products.map((product) => [Number(product.id), product])
    );

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(Number(item.product_id));

      if (!product || !product.is_available) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: `${product?.name || "A product"} is currently unavailable.`,
        });
      }

      const quantity = Number(item.quantity);
      const basePrice = Number(product.price);
      const optionIds = (item.option_ids || []).map(Number);

      let selectedOptions = [];
      let optionsTotal = 0;

      if (optionIds.length > 0) {
        const [options] = await connection.query(
          `SELECT id, option_name, additional_price
           FROM product_options
           WHERE product_id = ? AND id IN (?)`,
          [product.id, optionIds]
        );

        if (options.length !== optionIds.length) {
          await connection.rollback();

          return res.status(400).json({
            success: false,
            message: `Invalid customization selected for ${product.name}.`,
          });
        }

        selectedOptions = options.map((option) => {
          const additionalPrice = Number(option.additional_price || 0);

          optionsTotal += additionalPrice;

          return {
            id: option.id,
            option_name: option.option_name,
            additional_price: additionalPrice,
          };
        });
      }

      const unitPrice = basePrice + optionsTotal;
      const subtotal = unitPrice * quantity;

      totalAmount += subtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: unitPrice,
        selected_options: selectedOptions,
        subtotal,
      });
    }

    const trackingToken = crypto.randomBytes(32).toString("hex");

    const paymentMethod =
      order_type === "dine_in"
        ? "pay_at_counter"
        : "cash_on_pickup";

    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (
         customer_name,
         customer_email,
         customer_phone,
         order_type,
         table_number,
         notes,
         total_amount,
         payment_method,
         tracking_token
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_name.trim(),
        customer_email.trim(),
        customer_phone.trim(),
        order_type,
        verifiedTableNumber,
        notes?.trim() || null,
        totalAmount.toFixed(2),
        paymentMethod,
        trackingToken,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items
         (
           order_id,
           product_id,
           product_name,
           quantity,
           unit_price,
           selected_options,
           subtotal
         )
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name,
          item.quantity,
          item.unit_price.toFixed(2),
          JSON.stringify(item.selected_options),
          item.subtotal.toFixed(2),
        ]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Your order has been placed successfully!",
      order: {
        id: orderId,
        total_amount: totalAmount.toFixed(2),
        order_status: "placed",
        tracking_token: trackingToken,
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Transaction rollback failed:", rollbackError);
      }
    }

    next(error);
  } finally {
    connection?.release();
  }
};
