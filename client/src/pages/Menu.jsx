
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, categoriesResponse] =
        await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

      setMenuItems(productsResponse.data.products || []);

      setCategories([
        { id: "all", name: "All" },
        ...(categoriesResponse.data.categories || []),
      ]);
    } catch (err) {
      console.error("Error fetching menu data:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load the menu. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter(
          (item) => item.category_name === selectedCategory
        );

  return (
    <main className="menu-page">
      <section className="menu-heading">
        <p className="section-label">DISCOVER OUR MENU</p>

        <h1>
          Something Delicious
          <br />
          For Every Moment.
        </h1>

        <p>
          Explore our selection of freshly prepared coffee,
          desserts and refreshing drinks.
        </p>
      </section>

      {loading ? (
        <p className="menu-status">
          Loading our delicious menu...
        </p>
      ) : error ? (
        <div className="menu-status">
          <p>{error}</p>

          <button
            type="button"
            className="filter-btn"
            onClick={fetchMenuData}
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <section className="menu-filters">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={
                  selectedCategory === category.name
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() =>
                  setSelectedCategory(category.name)
                }
              >
                {category.name}
              </button>
            ))}
          </section>

          <section className="menu-grid">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <article className="menu-card" key={item.id}>
                  <img
                    src={
                      item.image_url ||
                      "https://placehold.co/600x400?text=CAFE"
                    }
                    alt={item.name}
                    loading="lazy"
                  />

                  <div className="menu-card-content">
                    <span className="menu-category">
                      {item.category_name || "Other"}
                    </span>

                    <h3>{item.name}</h3>

                    <p>{item.description}</p>

                    <div className="menu-card-bottom">
                      <strong>
                        ₹{Number(item.price).toFixed(2)}
                      </strong>

                      <Link
                        to={`/product/${item.id}`}
                        className="view-item-button"
                      >
                        View Item
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="menu-status">
                No products found in this category.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default Menu;
