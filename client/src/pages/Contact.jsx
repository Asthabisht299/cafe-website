
import { useState } from "react";
import api from "../api/axios";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSubmitted(false);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSubmitted(false);

      await api.post("/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setSubmitted(true);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="contact-page">
      <section className="contact-heading">
        <p className="section-label">GET IN TOUCH</p>

        <h1>
          We'd Love to Hear
          <br />
          From You.
        </h1>

        <p>
          Have a question, suggestion or feedback?
          Send us a message.
        </p>
      </section>

      <section className="contact-container">
        <div className="contact-info">
          <p className="section-label">CONTACT INFORMATION</p>

          <h2>Let's Start a Conversation.</h2>

          <p className="contact-description">
            We would love to connect with you.
            Reach out to us for enquiries and feedback.
          </p>

          <div className="contact-detail">
            <h3>Our Location</h3>
            <p>Our café address will be added here.</p>
          </div>

          <div className="contact-detail">
            <h3>Email Us</h3>
            <p>Our café email will be added here.</p>
          </div>

          <div className="contact-detail">
            <h3>Opening Hours</h3>
            <p>Monday – Sunday</p>
            <p>Opening timings will be added here.</p>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Send Us a Message</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Your Name</label>

            <input
              id="name"
              type="text"
              name="name"
              maxLength={100}
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              type="email"
              name="email"
              maxLength={150}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="subject">Subject</label>

            <input
              id="subject"
              type="text"
              name="subject"
              maxLength={200}
              placeholder="Enter subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />

            <label htmlFor="message">Your Message</label>

            <textarea
              id="message"
              name="message"
              rows={5}
              maxLength={5000}
              placeholder="Write your message..."
              value={formData.message}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>

            {submitted && (
              <p className="form-success" role="status">
                Your message has been sent successfully!
              </p>
            )}

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}

export default Contact;
