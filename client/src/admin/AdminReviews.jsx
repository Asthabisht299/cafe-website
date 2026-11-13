
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Admin.css";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get("/admin/product-reviews");
        setReviews(response.data.reviews || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load customer reviews."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        Loading customer reviews...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-heading">
        <div>
          <h1>Food Ratings & Reviews</h1>
          <p>Customer feedback from completed orders.</p>
        </div>
      </div>

      {error && (
        <p className="dashboard-error">{error}</p>
      )}

      {!error && (
        <div className="orders-summary">
          <p>
            Total Reviews: <strong>{reviews.length}</strong>
          </p>
        </div>
      )}

      {!error && reviews.length === 0 ? (
        <p>No customer reviews yet.</p>
      ) : !error ? (
        <div className="orders-list">
          {reviews.map((item) => (
            <article
              className="admin-order-card"
              key={item.id}
            >
              <div className="admin-order-top">
                <div>
                  <h3>{item.product_name}</h3>
                  <p>
                    Order #{item.order_id} · {item.customer_name}
                  </p>
                </div>

                <span className="review-rating-value">
                  {"★".repeat(Number(item.rating))}
                  {"☆".repeat(5 - Number(item.rating))}
                </span>
              </div>

              <p>
                {item.review || "No written comment."}
              </p>

              <small>
                {new Date(item.created_at).toLocaleString("en-IN")}
              </small>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default AdminReviews;
