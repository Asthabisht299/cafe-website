
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import cafeDetails from "../config/cafeDetails";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const instagramPhotos = [
    {
      image:
        "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=700",
      alt: "Freshly brewed coffee",
    },
    {
      image:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=700",
      alt: "Coffee served in a ceramic cup",
    },
    {
      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700",
      alt: "Coffee preparation",
    },
    {
      image:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700",
      alt: "Warm and welcoming café interior",
    },
    {
      image:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=700",
      alt: "Fresh bakery treats",
    },
    {
      image:
        "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=700",
      alt: "A beautifully prepared coffee",
    },
  ];

  // Fetch featured products from the existing backend API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError("");

        const response = await api.get("/products");

        const availableProducts = (
          response.data.products || []
        ).filter(
          (product) => Number(product.is_available) !== 0
        );

        setFeaturedProducts(availableProducts.slice(0, 3));
      } catch (error) {
        console.error(
          "Unable to fetch featured products:",
          error
        );

        setProductsError(
          "Our favourites are temporarily unavailable."
        );
      } finally {
        setProductsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

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

      {/* DYNAMIC FEATURED MENU */}
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

        {productsLoading ? (
          <p className="featured-products-status">
            Preparing our favourites...
          </p>
        ) : productsError ? (
          <p className="featured-products-status">
            {productsError}
          </p>
        ) : featuredProducts.length > 0 ? (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <article
                className="product-card"
                key={product.id}
              >
                <Link
                  to={`/product/${product.id}`}
                  className="featured-product-image"
                >
                  <img
                    src={
                      product.image_url ||
                      "https://placehold.co/600x400?text=CAFE"
                    }
                    alt={product.name}
                    loading="lazy"
                  />
                </Link>

                <div className="product-info">
                  <h3>{product.name}</h3>

                  <p>
                    {product.description ||
                      "Made fresh with love."}
                  </p>

                  <div className="featured-product-bottom">
                    <span>
                      ₹{Number(product.price).toFixed(2)}
                    </span>

                    <Link
                      to={`/product/${product.id}`}
                      className="featured-product-link"
                    >
                      View Item →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="featured-products-status">
            Our menu favourites will be available soon.
          </p>
        )}
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

      {/* INSTAGRAM SECTION */}
      <section className="instagram-section">
        <div className="instagram-heading">
          <p className="eyebrow">
            LITTLE MOMENTS, BEAUTIFULLY CAPTURED
          </p>

          <h2>A Little Taste of CAFÉ.</h2>

          <p>
            Coffee moments, sweet treats and little things
            that make every day special.
          </p>

          {cafeDetails.instagramUrl ? (
            <a
              href={cafeDetails.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-follow-button"
            >
              <span>◎</span> Follow Us on Instagram ↗
            </a>
          ) : (
            <p className="instagram-coming-soon">
              Our Instagram profile is coming soon.
            </p>
          )}
        </div>

        <div className="instagram-photo-grid">
          {instagramPhotos.map((photo, index) => (
            <div className="instagram-photo" key={index}>
              <img
                src={photo.image}
                alt={photo.alt}
                loading="lazy"
              />

              <div
                className="instagram-photo-overlay"
                aria-hidden="true"
              >
                <span>CAFÉ</span>
              </div>
            </div>
          ))}
        </div>

        <p className="instagram-disclaimer">
          A curated collection of café-inspired photography.
          These are illustrative images, not a live Instagram feed.
        </p>
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
