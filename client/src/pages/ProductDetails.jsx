
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setSelectedOptions([]);
        setAdded(false);

        const response = await api.get(`/products/${id}`);

        setProduct(response.data.product);
      } catch (err) {
        console.error("Error fetching product:", err);

        setError(
          err.response?.status === 404
            ? "Product not found or currently unavailable."
            : err.response?.data?.message ||
                "Unable to load product. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleOptionChange = (option) => {
    setSelectedOptions((previous) => {
      const alreadySelected = previous.some(
        (item) => item.id === option.id
      );

      return alreadySelected
        ? previous.filter((item) => item.id !== option.id)
        : [...previous, option];
    });

    setAdded(false);
  };

  const additionalPrice = selectedOptions.reduce(
    (total, option) =>
      total + Number(option.additional_price || 0),
    0
  );

  const finalPrice =
    Number(product?.price || 0) + additionalPrice;

  const handleAddToCart = () => {
    if (!product || product.is_available === 0) return;

    addToCart(product, selectedOptions);
    setAdded(true);
  };

  if (loading) {
    return (
      <main className="product-not-found">
        <p>Loading product details...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-not-found">
        <h2>{error || "Product Not Found"}</h2>
        <Link to="/menu">Back to Menu</Link>
      </main>
    );
  }

  const unavailable = product.is_available === 0;

  return (
    <main className="product-details">
      <div className="product-image">
        <img
          src={
            product.image_url ||
            "https://placehold.co/900x700?text=CAFE"
          }
          alt={product.name}
        />
      </div>

      <div className="product-info">
        <p className="menu-category">
          {product.category_name || "Other"}
        </p>

        <h1>{product.name}</h1>

        <div className="product-details-rating">
  {Number(product.total_reviews) > 0 ? (
    <>
      <span className="rating-display-stars">★</span>
      <strong>{Number(product.average_rating).toFixed(1)}</strong>
      <span>({product.total_reviews} customer reviews)</span>
    </>
  ) : (
    <span className="no-rating">Be the first to review this item</span>
  )}
</div>

        <p className="product-description">
          {product.description || "A delicious treat from CAFÉ."}
        </p>

        {product.options?.length > 0 && (
          <section className="product-customizations">
            <h3>Customize Your Order</h3>
            <p>Choose any extras you would like.</p>

            <div className="customization-options">
              {product.options.map((option) => {
                const checked = selectedOptions.some(
                  (item) => item.id === option.id
                );

                return (
                  <label
                    className="customization-option"
                    key={option.id}
                  >
                    <span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleOptionChange(option)}
                      />
                      {option.option_name}
                    </span>

                    <strong>
                      +₹
                      {Number(option.additional_price).toFixed(2)}
                    </strong>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        <div className="customized-product-price">
          <span>Total Price</span>
          <h2>₹{finalPrice.toFixed(2)}</h2>
        </div>

        {unavailable ? (
          <p className="menu-status">
            This product is currently unavailable.
          </p>
        ) : (
          <button
            className="product-add-button"
            type="button"
            onClick={handleAddToCart}
          >
            {added ? "Add Another — Added!" : "Add to Cart"}
          </button>
        )}

        {added && (
          <p className="cart-success-message">
            Product added successfully!{" "}
            <Link to="/cart">View Cart</Link>
          </p>
        )}

        <Link to="/menu" className="back-to-menu">
          ← Back to Menu
        </Link>
      </div>
    </main>
  );
}

export default ProductDetails;
