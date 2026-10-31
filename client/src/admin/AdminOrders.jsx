
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Admin.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setError("");

      const response = await api.get("/admin/orders");

      setOrders(response.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setError("");

      await api.patch(`/admin/orders/${orderId}/status`, {
        order_status: newStatus,
      });

      await fetchOrders();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  if (loading) {
    return <div className="admin-dashboard">Loading orders...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-heading">
        <div>
          <h1>Orders</h1>
          <p>View and manage customer orders.</p>
        </div>

        <button className="refresh-btn" onClick={fetchOrders}>
          Refresh
        </button>
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="orders-summary">
        <p>
          Total Orders: <strong>{orders.length}</strong>
        </p>
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="admin-order-card" key={order.id}>
              <div className="admin-order-top">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p>{formatDate(order.created_at)}</p>
                </div>

                <span className={`order-status ${order.order_status}`}>
                  {order.order_status}
                </span>
              </div>

              <div className="admin-order-details">
                <p><strong>Customer:</strong> {order.customer_name}</p>
                <p><strong>Email:</strong> {order.customer_email}</p>
                <p><strong>Phone:</strong> {order.customer_phone}</p>
                <p><strong>Order Type:</strong> {order.order_type}</p>

                {order.order_type === "dine_in" && (
                  <p>
                    <strong>Table:</strong> {order.table_number || "—"}
                  </p>
                )}

                <p>
                  <strong>Amount:</strong> ₹
                  {Number(order.total_amount).toFixed(2)}
                </p>

                <p><strong>Payment:</strong> {order.payment_method}</p>
                <p><strong>Payment Status:</strong> {order.payment_status}</p>

                {order.notes && (
                  <p><strong>Notes:</strong> {order.notes}</p>
                )}
              </div>

              <div className="ordered-items-section">
                <h4>Ordered Products</h4>

                {order.items?.map((item) => {
                  const options = Array.isArray(item.selected_options)
                    ? item.selected_options
                    : [];

                  return (
                    <div className="ordered-item" key={item.id}>
                      <div className="ordered-item-info">
                        <strong>{item.product_name}</strong>

                        <p>Quantity: {item.quantity}</p>

                        <p>
                          Unit Price: ₹
                          {Number(item.unit_price).toFixed(2)}
                        </p>

                        {options.length > 0 && (
                          <div className="admin-selected-options">
                            <strong>Selected Extras:</strong>

                            {options.map((option) => (
                              <p key={option.id}>
                                + {option.option_name} — ₹
                                {Number(option.additional_price).toFixed(2)}
                              </p>
                            ))}
                          </div>
                        )}

                        {options.length === 0 && (
                          <p className="no-customizations">
                            No extras selected
                          </p>
                        )}
                      </div>

                      <strong className="ordered-item-subtotal">
                        ₹{Number(item.subtotal).toFixed(2)}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="admin-order-actions">
                <label htmlFor={`status-${order.id}`}>
                  Update Status
                </label>

                <select
                  id={`status-${order.id}`}
                  value={order.order_status}
                  disabled={updatingId === order.id}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value)
                  }
                >
                  <option value="placed">Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {updatingId === order.id && <span>Updating...</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
