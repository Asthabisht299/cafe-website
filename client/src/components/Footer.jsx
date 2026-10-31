
import { useState } from "react";
import api from "../api/axios";

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await api.post("/newsletter", {
        email: email.trim(),
      });

      setMessage(response.data.message);
      setEmail("");
    } catch (err) {
      if (err.response?.status === 409) {
        setError("This email is already subscribed.");
      } else {
        setError(
          err.response?.data?.message ||
            "Subscription failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <h2>
            CAFÉ<span>.</span>
          </h2>
          <p>A little moment of happiness, every day.</p>
        </div>

        <div className="footer-newsletter">
          <h3>Stay Connected</h3>
          <p>Subscribe for café updates and special offers.</p>

          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage("");
                setError("");
              }}
              maxLength={150}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Joining..." : "Subscribe"}
            </button>
          </form>

          {message && (
            <p className="newsletter-success">{message}</p>
          )}

          {error && (
            <p className="newsletter-error">{error}</p>
          )}
        </div>
      </div>

      <p className="footer-copy">
        © {new Date().getFullYear()} CAFÉ. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
