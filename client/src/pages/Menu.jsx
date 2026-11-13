
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedReviews, setExpandedReviews] = useState({});
  const [productReviews, setProductReviews] = useState({});
  const [reviewLoading, setReviewLoading] = useState({});

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

      // Hide Test categories from customer-facing filters
      const realCategories = (
        categoriesResponse.data.categories || []
      ).filter(
        (category) =>
          !category.name?.toLowerCase().includes("test")
      );

      setCategories([
        { id: "all", name: "All" },
        ...realCategories,
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

  const toggleReviews = async (productId) => {
    const isExpanded = expandedReviews[productId];

    setExpandedReviews((previous) => ({
      ...previous,
      [productId]: !previous[productId],
    }));

    if (isExpanded || productReviews[productId]) {
      return;
    }

    try {
      setReviewLoading((previous) => ({
        ...previous,
        [productId]: true,
      }));

      const response = await api.get(
        `/products/${productId}/reviews`
      );

      setProductReviews((previous) => ({
        ...previous,
        [productId]: response.data.reviews || [],
      }));
    } catch (err) {
      console.error("Unable to fetch reviews:", err);

      setProductReviews((previous) => ({
        ...previous,
        [productId]: null,
      }));
    } finally {
      setReviewLoading((previous) => ({
        ...previous,
        [productId]: false,
      }));
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" ||
      item.category_name === selectedCategory;

    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      item.name?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.category_name?.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

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
          <section className="menu-search">
            <div className="menu-search-box">
              <span className="search-icon">⌕</span>

              <input
                type="text"
                placeholder="Search coffee, desserts, drinks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </section>

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

                    <div className="menu-card-rating">
                      {Number(item.total_reviews) > 0 ? (
                        <>
                          <span className="rating-display-stars">
                            ★
                          </span>

                          <strong>
                            {Number(item.average_rating).toFixed(1)}
                          </strong>

                          <span>
                            ({item.total_reviews} reviews)
                          </span>
                        </>
                      ) : (
                        <span className="no-rating">
                          Be the first to review
                        </span>
                      )}
                    </div>

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

                    <div className="menu-review-section">
                      <button
                        type="button"
                        className="review-toggle-btn"
                        onClick={() => toggleReviews(item.id)}
                        aria-expanded={!!expandedReviews[item.id]}
                      >
                        {expandedReviews[item.id]
                          ? "Hide customer reviews"
                          : "Read customer reviews"}

                        <span>
                          {expandedReviews[item.id] ? "−" : "+"}
                        </span>
                      </button>

                      {expandedReviews[item.id] && (
                        <div className="menu-customer-reviews">
                          {reviewLoading[item.id] ? (
                            <p>Loading reviews...</p>
                          ) : productReviews[item.id] === null ? (
                            <p>
                              Unable to load reviews. Please try again.
                            </p>
                          ) : productReviews[item.id]?.length > 0 ? (
                            productReviews[item.id].map((review) => (
                              <div
                                className="menu-review"
                                key={review.id}
                              >
                                <div className="menu-review-header">
                                  <strong>
                                    {review.customer_name}
                                  </strong>

                                  <span className="menu-review-stars">
                                    {"★".repeat(Number(review.rating))}
                                    {"☆".repeat(
                                      5 - Number(review.rating)
                                    )}
                                  </span>
                                </div>

                                <p>
                                  {review.review ||
                                    "Customer left a rating without a comment."}
                                </p>

                                <small>
                                  {new Date(
                                    review.created_at
                                  ).toLocaleDateString("en-IN")}
                                </small>
                              </div>
                            ))
                          ) : (
                            <p>
                              No reviews yet. Be the first to share
                              your experience!
                            </p>
                          )}
                        </div>
                      )}
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
