
function About() {
  return (
    <main className="about-page">

      <section className="about-hero">
        <p className="section-label">OUR STORY</p>
        <h1>More Than Coffee.<br />A Feeling.</h1>
        <p>
          A place where beautiful moments begin,
          conversations flow and every cup tells a story.
        </p>
      </section>

      <section className="about-story">
        <div className="about-story-image">
          <img
            src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=900"
            alt="Warm and welcoming cafe interior"
          />
        </div>

        <div className="about-story-content">
          <p className="section-label">WHO WE ARE</p>
          <h2>Welcome to CAFÉ.</h2>

          <p>
            CAFÉ is created around a simple idea:
            good coffee, delicious food and a welcoming
            atmosphere can make an ordinary day special.
          </p>

          <p>
            Whether you are meeting friends, taking a break
            or enjoying a quiet moment, we want every visit
            to feel memorable.
          </p>
        </div>
      </section>

      <section className="about-values">
        <div className="about-values-heading">
          <p className="section-label">WHAT WE BELIEVE</p>
          <h2>The Little Things Matter.</h2>
        </div>

        <div className="values-grid">
          <div className="value-card">
            <span>01</span>
            <h3>Quality First</h3>
            <p>
              We believe every cup and every bite
              should be worth enjoying.
            </p>
          </div>

          <div className="value-card">
            <span>02</span>
            <h3>Warm Hospitality</h3>
            <p>
              Every customer deserves a friendly
              welcome and a comfortable experience.
            </p>
          </div>

          <div className="value-card">
            <span>03</span>
            <h3>Beautiful Moments</h3>
            <p>
              We want to create a space where
              people can connect and relax.
            </p>
          </div>
        </div>
      </section>

      <section className="about-quote">
        <p>
          "A little moment of happiness, every day."
        </p>
        <span>— CAFÉ</span>
      </section>

    </main>
  );
}

export default About;
