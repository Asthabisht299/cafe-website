
import db from "../config/db.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const [orderStats] = await db.query(`
      SELECT
        COUNT(*) AS total_orders,
        SUM(DATE(created_at) = CURDATE()) AS today_orders,
        SUM(
          order_status IN ('placed', 'confirmed', 'preparing')
        ) AS pending_orders
      FROM orders
    `);

    const [productStats] = await db.query(`
      SELECT COUNT(*) AS total_products
      FROM products
    `);

    const [recentOrders] = await db.query(`
      SELECT
        id,
        customer_name,
        order_type,
        total_amount,
        order_status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

    return res.status(200).json({
      success: true,
      stats: {
        total_orders: Number(orderStats[0].total_orders || 0),
        today_orders: Number(orderStats[0].today_orders || 0),
        pending_orders: Number(orderStats[0].pending_orders || 0),
        total_products: Number(productStats[0].total_products || 0),
      },
      recent_orders: recentOrders,
    });
  } catch (error) {
    next(error);
  }
};
