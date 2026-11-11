import { useState } from "react";
import api from "../api/axios";

function ProductRating({ token, productId, productName }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      const response = await api.post(
        `/orders/track/${encodeURIComponent(token)}/reviews`,
        { product_id: productId, rating, review: review.trim() }
      );
      setMessage(response.data.message);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit your review. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <p className="product-review-success" role="status">{message}</p>;
  }

  return (
    <form className="product-rating-form" onSubmit={handleSubmit}>
      <h3>Rate {productName}</h3>
      <p>How was this item?</p>
      <div className="rating-stars" role="group" aria-label={`Rate ${productName}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={star <= (hovered || rating) ? "rating-star active" : "rating-star"}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            aria-pressed={rating === star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
      </div>
      <label>
        Your review (optional)
        <textarea
          value={review}
          onChange={(event) => setReview(event.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Share what you liked..."
        />
      </label>
      {error && <p className="product-review-error" role="alert">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Rating"}
      </button>
    </form>
  );
}

export default ProductRating;
