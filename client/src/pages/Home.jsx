
import { Link } from "react-router-dom";

function Home() {
  return (
    <main>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">WELCOME TO CAFÉ</p>

          <h1>
            A little moment
            <br />
            of happiness.
          </h1>

          <p className="hero-description">
            Freshly brewed coffee, handcrafted treats and
            beautiful moments. Your favourite place to slow down.
          </p>

          <Link to="/menu" className="primary-button">
            Discover Our Menu
          </Link>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200"
            alt="Freshly brewed coffee in a warm café"
          />
        </div>
      </section>

      {/* ORDERING OPTIONS */}
      <section className="ordering-section">
        <p className="eyebrow">YOUR WAY, YOUR MOMENT</p>

        <h2>How would you like to enjoy CAFÉ?</h2>

        <p className="ordering-description">
          Enjoy your favourite coffee and treats your way.
          Choose an ordering option to get started.
        </p>

        <div className="ordering-grid">
          <article className="ordering-card">
            <div className="ordering-icon">☕</div>
            <h3>Dine In</h3>
            <p>
              Visit us, scan your table QR code, browse
              our menu and order directly from your table.
            </p>
            <Link to="/menu" className="ordering-link">
              Explore Menu →
            </Link>
          </article>

          <article className="ordering-card">
            <div className="ordering-icon">🛍️</div>
            <h3>Takeaway</h3>
            <p>
              Order your favourites online and collect
              them fresh from our café.
            </p>
            <Link to="/menu" className="ordering-link">
              Order Takeaway →
            </Link>
          </article>
        </div>

        <p className="qr-note">
          Visiting us? Scan the QR code on your table
          to start your dine-in order.
        </p>
      </section>

      {/* ABOUT SECTION */}
      <section className="about-section" id="about">
        <p className="eyebrow">A PLACE TO UNWIND</p>

        <h2>Good coffee. Good food. Good company.</h2>

        <p>
          At CAFÉ, we believe the little things make life special.
          From the aroma of freshly brewed coffee to the comfort
          of a welcoming space, every visit is a moment to enjoy.
        </p>

        <Link to="/about" className="text-link">
          Discover Our Story →
        </Link>
      </section>

      {/* FEATURED MENU */}
      <section className="menu-section" id="menu">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MADE WITH LOVE</p>
            <h2>Our favourites</h2>
          </div>

          <Link to="/menu" className="text-link">
            View Full Menu →
          </Link>
        </div>

        <div className="product-grid">
          <article className="product-card">
            <img
              src="https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=800"
              alt="Cappuccino coffee"
            />
            <div className="product-info">
              <h3>Classic Cappuccino</h3>
              <p>Rich espresso with smooth, creamy milk.</p>
              <span>₹149</span>
            </div>
          </article>

          <article className="product-card">
            <img
              src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800"
              alt="Chocolate brownie"
            />
            <div className="product-info">
              <h3>Chocolate Brownie</h3>
              <p>Rich, fudgy and freshly baked.</p>
              <span>₹129</span>
            </div>
          </article>

          <article className="product-card">
            <img
              src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800"
              alt="Coffee served in a cup"
            />
            <div className="product-info">
              <h3>Signature Latte</h3>
              <p>Silky milk blended with espresso.</p>
              <span>₹169</span>
            </div>
          </article>
        </div>
      </section>

      {/* GALLERY PROMOTION */}
      <section className="gallery-promo">
        <div>
          <p className="eyebrow">A GLIMPSE OF CAFÉ</p>
          <h2>Every corner has a story.</h2>
          <p>
            Discover our coffee, treats and cozy café atmosphere.
          </p>
          <Link to="/gallery" className="primary-button">
            Explore Gallery
          </Link>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="contact-section" id="contact">
        <p className="eyebrow">COME SAY HELLO</p>
        <h2>Your coffee break is waiting.</h2>
        <p>
          Good coffee and warm moments are just around the corner.
        </p>
        <Link to="/contact" className="primary-button">
          Contact Us
        </Link>
      </section>
    </main>
  );
}

export default Home;
