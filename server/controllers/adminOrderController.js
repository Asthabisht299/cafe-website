
import db from "../config/db.js";

// Safely parse saved customization data
const parseSelectedOptions = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

// Get all orders for admin
export const getAllOrders = async (req, res, next) => {
  try {
    const [orders] = await db.query(`
      SELECT
        id,
        customer_name,
        customer_email,
        customer_phone,
        order_type,
        table_number,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        notes,
        created_at
      FROM orders
      ORDER BY created_at DESC
    `);

    const [items] = await db.query(`
      SELECT
        id,
        order_id,
        product_name,
        quantity,
        unit_price,
        selected_options,
        subtotal
      FROM order_items
      ORDER BY id ASC
    `);

    const itemsByOrder = {};

    items.forEach((item) => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }

      itemsByOrder[item.order_id].push({
        ...item,
        selected_options: parseSelectedOptions(item.selected_options),
      });
    });

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    }));

    return res.status(200).json({
      success: true,
      orders: ordersWithItems,
    });
  } catch (error) {
    next(error);
  }
};

// Update order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const allowedStatuses = [
      "placed",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const [result] = await db.query(
      "UPDATE orders SET order_status = ? WHERE id = ?",
      [order_status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};
