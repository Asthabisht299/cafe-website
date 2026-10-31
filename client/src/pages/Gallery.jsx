
const galleryImages = [
  {
    id: 1,
    title: "Our Coffee Corner",
    category: "Interior",
    image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=900",
  },
  {
    id: 2,
    title: "Freshly Brewed Coffee",
    category: "Coffee",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900",
  },
  {
    id: 3,
    title: "Sweet Moments",
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=900",
  },
  {
    id: 4,
    title: "Coffee Art",
    category: "Coffee",
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=900",
  },
  {
    id: 5,
    title: "Cozy Café Space",
    category: "Interior",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900",
  },
  {
    id: 6,
    title: "Delicious Treats",
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=900",
  },
];

function Gallery() {
  return (
    <main className="gallery-page">
      <section className="gallery-heading">
        <p className="section-label">A GLIMPSE OF CAFÉ</p>
        <h1>Moments Worth<br />Savouring.</h1>
        <p>
          From freshly brewed coffee to cozy corners,
          explore the little things that make us special.
        </p>
      </section>

      <section className="gallery-grid">
        {galleryImages.map((item) => (
          <div className="gallery-card" key={item.id}>
            <img src={item.image} alt={item.title} />
            <div className="gallery-overlay">
              <span>{item.category}</span>
              <h3>{item.title}</h3>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

export default Gallery;
