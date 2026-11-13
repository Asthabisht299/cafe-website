
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import "./OrderTracking.css";
import ProductRating from "../components/ProductRating";

const statuses = [
  "placed",
  "confirmed",
  "preparing",
  "ready",
  "completed",
];

function OrderTracking() {
  const { token } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchOrder = async () => {
      try {
        const response = await api.get(
          `/orders/track/${encodeURIComponent(token)}`
        );

        if (isActive) {
          setOrder(response.data.order);
          setError("");
        }
      } catch (err) {
        if (isActive) {
          setError(
            err.response?.data?.message ||
              "Unable to find your order."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    const intervalId = setInterval(fetchOrder, 10000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [token]);

  const formatPrice = (price) =>
    `₹${Number(price || 0).toFixed(2)}`;

  const formatOptions = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    if (typeof value === "object") {
      return value;
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <main className="tracking-page">
        <p>Loading your order...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="tracking-page">
        <h1>Order Not Found</h1>
        <p>{error || "Unable to find your order."}</p>
        <Link to="/menu">Back to Menu</Link>
      </main>
    );
  }

  const currentStatus = statuses.indexOf(order.order_status);
  const isCancelled = order.order_status === "cancelled";

  return (
    <main className="tracking-page">
      <div className="tracking-container">
        <h1>Track Your Order</h1>

        <p className="tracking-subtitle">
          Thank you for choosing our café.
        </p>

        <section className="tracking-order-info">
          <h2>Order #{order.id}</h2>

          <p>
            Order Type: {order.order_type.replace("_", " ")}
          </p>

          {order.order_type === "dine_in" && (
            <p>
              Table Number: {order.table_number || "—"}
            </p>
          )}

          <p>Total: {formatPrice(order.total_amount)}</p>
          <p>Payment: {order.payment_status}</p>
          <p>Status: {order.order_status}</p>
        </section>

        {!isCancelled && (
          <section className="tracking-progress">
            <h2>Order Progress</h2>

            {statuses.map((status, index) => (
              <div
                className={`tracking-step ${
                  currentStatus >= 0 && index <= currentStatus
                    ? "completed"
                    : ""
                }`}
                key={status}
              >
                <span className="tracking-dot">
                  {currentStatus >= 0 && index <= currentStatus
                    ? "✓"
                    : index + 1}
                </span>

                <span>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            ))}
          </section>
        )}

        <section className="tracking-items">
          <h2>Your Items</h2>

         
{order.items?.map((item) => {
  const options = formatOptions(item.selected_options);

  return (
    <div className="tracking-item-wrapper" key={item.id}>
      <div className="tracking-item">
        <div className="tracking-item-details">
          <strong>{item.product_name}</strong>

          <p>Quantity: {item.quantity}</p>

          <p>
            Unit Price: {formatPrice(item.unit_price)}
          </p>

          {options.length > 0 && (
            <div className="tracking-selected-options">
              <strong>Selected Extras</strong>

              {options.map((option) => (
                <p key={option.id}>
                  + {option.option_name} —{" "}
                  {formatPrice(option.additional_price)}
                </p>
              ))}
            </div>
          )}
        </div>

        <strong className="tracking-item-price">
          {formatPrice(item.subtotal)}
        </strong>
      </div>

      {order.order_status === "completed" &&
        item.product_id &&
        !Number(item.has_reviewed) && (
          <ProductRating
            token={token}
            productId={item.product_id}
            productName={item.product_name}
          />
        )}

      {order.order_status === "completed" &&
        item.product_id &&
        Number(item.has_reviewed) === 1 && (
          <p className="review-already-submitted">
            Thank you! You've already rated this item.
          </p>
        )}
    </div>
  );
})}

        </section>

        {isCancelled && (
          <p className="tracking-cancelled">
            This order has been cancelled.
          </p>
        )}

        <Link to="/menu" className="tracking-back">
          Back to Menu
        </Link>
      </div>
    </main>
  );
}

export default OrderTracking;
