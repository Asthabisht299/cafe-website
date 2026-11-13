
import { useState } from "react";
import api from "../api/axios";
import cafeDetails from "../config/cafeDetails";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // WhatsApp configuration
  const whatsappNumber = (cafeDetails.whatsappNumber || "").replace(/\D/g, "");
  const validWhatsAppNumber =
    whatsappNumber.length >= 8 && whatsappNumber.length <= 15;

  const whatsappMessage = encodeURIComponent(
    "Hello! I would like to know more about your café."
  );

  const whatsappUrl = validWhatsAppNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : "";

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
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setSubmitted(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
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
        {/* Contact Information */}
        <div className="contact-info">
          <p className="section-label">CONTACT INFORMATION</p>

          <h2>Let's Start a Conversation.</h2>

          <p className="contact-description">
            We would love to connect with you.
            Reach out to us for enquiries and feedback.
          </p>

          <div className="contact-detail">
            <h3>Our Location</h3>

            <p>
              {cafeDetails.address || "Location to be announced."}
            </p>

            {cafeDetails.googleMapsUrl && (
              <a
                href={cafeDetails.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Google Maps →
              </a>
            )}
          </div>

          <div className="contact-detail">
            <h3>Email Us</h3>

            {cafeDetails.email ? (
              <a href={`mailto:${cafeDetails.email}`}>
                {cafeDetails.email}
              </a>
            ) : (
              <p>Email to be announced.</p>
            )}
          </div>

          <div className="contact-detail">
            <h3>Call Us</h3>

            {cafeDetails.phone ? (
              <a href={`tel:${cafeDetails.phone}`}>
                {cafeDetails.phone}
              </a>
            ) : (
              <p>Phone number to be announced.</p>
            )}
          </div>

          {/* WhatsApp Contact */}
          {validWhatsAppNumber && (
            <div className="contact-detail">
              <h3>Chat With Us</h3>

              <p>
                Have a quick question? Connect with us directly on WhatsApp.
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-whatsapp-link"
              >
                Message Us on WhatsApp →
              </a>
            </div>
          )}

          <div className="contact-detail">
            <h3>Opening Hours</h3>

            <p>
              {cafeDetails.openingHours ||
                "Opening hours to be announced."}
            </p>

            <p>
              {cafeDetails.closingDay
                ? `Weekly closing day: ${cafeDetails.closingDay}`
                : "Weekly closing day to be announced."}
            </p>
          </div>
        </div>

        {/* Contact Form */}
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

            <label htmlFor="phone">Phone Number</label>

            <input
              id="phone"
              type="tel"
              name="phone"
              maxLength={20}
              placeholder="Enter your phone number"
              value={formData.phone}
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
