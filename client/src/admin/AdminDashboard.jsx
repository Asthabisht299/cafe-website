
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Admin.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_orders: 0,
    today_orders: 0,
    pending_orders: 0,
    total_products: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setError("");

      const response = await api.get("/admin/dashboard");

      setStats(response.data.stats);
      setRecentOrders(response.data.recent_orders);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return <div className="admin-dashboard"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening at your cafe.</p>
        </div>

        <button onClick={fetchDashboardData} className="refresh-btn">
          Refresh
        </button>
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{stats.total_orders}</p>
        </div>

        <div className="stat-card">
          <h3>Today's Orders</h3>
          <p>{stats.today_orders}</p>
        </div>

        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p>{stats.pending_orders}</p>
        </div>

        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{stats.total_products}</p>
        </div>
      </div>

      <section className="recent-orders-section">
        <h2>Recent Orders</h2>

        {recentOrders.length === 0 ? (
          <p>No orders found yet.</p>
        ) : (
          <div className="orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.order_type}</td>
                    <td>₹{Number(order.total_amount).toFixed(2)}</td>
                    <td>
                      <span className={`order-status ${order.order_status}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
