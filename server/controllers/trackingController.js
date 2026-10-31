
import db from "../config/db.js";

export const trackOrder = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Validate tracking token format
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tracking token.",
      });
    }

    // Find order using its secure tracking token
    const [orders] = await db.query(
      `SELECT
        id,
        customer_name,
        order_type,
        table_number,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        created_at
       FROM orders
       WHERE tracking_token = ?`,
      [token]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const order = orders[0];

    // Get products belonging to this order
    const [items] = await db.query(
      `SELECT
        product_name,
        quantity,
        unit_price,
        subtotal
       FROM order_items
       WHERE order_id = ?`,
      [order.id]
    );

    return res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};
