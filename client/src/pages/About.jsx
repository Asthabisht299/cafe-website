
import { useEffect, useState } from "react";

const galleryImages = [
  {
    id: 1,
    title: "A welcoming coffee corner",
    category: "Interior",
    image:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1000",
  },
  {
    id: 2,
    title: "A quiet place to unwind",
    category: "Seating",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000",
  },
  {
    id: 3,
    title: "Coffee, made with care",
    category: "Coffee",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000",
  },
  {
    id: 4,
    title: "Warm and thoughtful details",
    category: "Ambience",
    image:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1000",
  },
  {
    id: 5,
    title: "A cosy place to connect",
    category: "Seating",
    image:
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1000",
  },
  {
    id: 6,
    title: "Little moments over coffee",
    category: "Coffee",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000",
  },
];

function About() {
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  return (
    <main className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <p className="section-label">OUR STORY</p>

        <h1>
          More Than Coffee.
          <br />
          A Feeling.
        </h1>

        <p>
          A place where beautiful moments begin,
          conversations flow and every cup tells a story.
        </p>
      </section>

      {/* OUR STORY */}
      <section className="about-story">
        <div className="about-story-image">
          <img
            src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1000"
            alt="Illustrative photograph of a welcoming café interior"
            loading="lazy"
          />
        </div>

        <div className="about-story-content">
          <p className="section-label">OUR STORY</p>

          <h2>A Space Made for Little Moments.</h2>

          <p>
            Every café begins with an idea. Here is where
            you can share how your journey started, what
            inspired you to create this space and the
            feeling you want every guest to take home.
          </p>

          <p className="about-placeholder">
            [Replace this text with your café's actual
            founding story, inspiration and history.]
          </p>
        </div>
      </section>

      {/* OUR CONCEPT */}
      <section className="about-concept">
        <div className="about-concept-content">
          <p className="section-label">OUR CONCEPT</p>

          <h2>More Than a Place to Have Coffee.</h2>

          <p>
            A café can be a favourite morning stop,
            a meeting place with friends or a peaceful
            corner to spend a little time with yourself.
          </p>

          <p className="about-placeholder">
            [Describe your café's actual theme, speciality,
            design inspiration and the experience you offer.]
          </p>
        </div>

        <div className="about-concept-image">
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000"
            alt="Illustrative photograph of coffee being prepared"
            loading="lazy"
          />
        </div>
      </section>

      {/* WHAT MAKES US DIFFERENT */}
      <section className="about-values">
        <div className="about-values-heading">
          <p className="section-label">THE CAFÉ EXPERIENCE</p>
          <h2>The Little Things Matter.</h2>

          <p>
            Tell your customers what they can expect
            when they visit your café.
          </p>
        </div>

        <div className="values-grid">
          <article className="value-card">
            <span>01</span>
            <h3>Our Specialities</h3>
            <p>
              [Add your signature coffees, special dishes
              and unique recipes.]
            </p>
          </article>

          <article className="value-card">
            <span>02</span>
            <h3>Quality Ingredients</h3>
            <p>
              [Describe your actual ingredients,
              preparation methods and quality standards.]
            </p>
          </article>

          <article className="value-card">
            <span>03</span>
            <h3>Warm Hospitality</h3>
            <p>
              [Describe the service and customer
              experience your café aims to provide.]
            </p>
          </article>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="about-founder">
        <div className="about-founder-image">
          <div className="founder-image-placeholder">
            Add Founder Photograph
          </div>
        </div>

        <div className="about-founder-content">
          <p className="section-label">THE PERSON BEHIND THE CAFÉ</p>

          <h2>A Story Worth Sharing.</h2>

          <p>
            Every business has a person and a vision
            behind it. Introduce the founder and share
            the personal journey behind the café.
          </p>

          <p className="about-placeholder">
            [Add founder name, photograph and personal story.
            This section can be removed if you prefer.]
          </p>
        </div>
      </section>

      {/* ATMOSPHERE */}
      <section className="about-atmosphere">
        <p className="section-label">OUR ATMOSPHERE</p>

        <h2>Come In. Slow Down. Stay Awhile.</h2>

        <p>
          [Describe your real café interior, seating,
          lighting, music, ambience and the kind of
          experience guests can enjoy.]
        </p>
      </section>

      {/* INTERIOR GALLERY */}
      <section className="about-gallery">
        <div className="about-gallery-heading">
          <div>
            <p className="section-label">A GLIMPSE INSIDE</p>
            <h2>Moments Around Our Café.</h2>
          </div>

          <p>
            Explore the spaces, details and moments
            that make a café feel special.
          </p>
        </div>

        <p className="about-placeholder gallery-placeholder-note">
          Illustrative images below. Replace them with
          photographs of your actual café before launch.
        </p>

        <div className="about-gallery-grid">
          {galleryImages.map((item) => (
            <button
              className="about-gallery-item"
              key={item.id}
              type="button"
              onClick={() => setSelectedImage(item)}
              aria-label={`View larger image: ${item.title}`}
            >
              <img
                src={item.image}
                alt={`${item.title} — illustrative café photograph`}
                loading="lazy"
              />

              <span className="about-gallery-overlay">
                <small>{item.category}</small>
                <strong>{item.title}</strong>
                <span>View Image ↗</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* CLOSING MESSAGE */}
      <section className="about-quote">
        <p>
          "A little moment of happiness, every day."
        </p>

        <span>— CAFÉ</span>
      </section>

      {/* IMAGE PREVIEW */}
      {selectedImage && (
        <div
          className="about-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="about-lightbox-close"
            type="button"
            aria-label="Close image preview"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>

          <div
            className="about-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedImage.image}
              alt={`${selectedImage.title} — illustrative café photograph`}
            />

            <p>{selectedImage.title}</p>
          </div>
        </div>
      )}

    </main>
  );
}

export default About;
