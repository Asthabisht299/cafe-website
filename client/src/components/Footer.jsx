
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import cafeDetails from "../config/cafeDetails";

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
        <div className="footer-brand-section">
          <h2>
            CAFÉ<span>.</span>
          </h2>

          <p>A little moment of happiness, every day.</p>

          {cafeDetails.instagramUrl && (
            <a
              href={cafeDetails.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-instagram-link"
              aria-label="Follow CAFÉ on Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="18" cy="6" r="1" fill="currentColor" />
              </svg>

              <span>Follow us on Instagram ↗</span>
            </a>
          )}
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

      <div className="footer-bottom">
        <p className="footer-copy">
          © {new Date().getFullYear()} CAFÉ. All rights reserved.
        </p>

        <div className="footer-bottom-links">
          {cafeDetails.instagramUrl && (
            <a
              href={cafeDetails.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram ↗
            </a>
          )}

          <Link to="/admin/login" className="footer-staff-login">
            Staff Login ↗
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
