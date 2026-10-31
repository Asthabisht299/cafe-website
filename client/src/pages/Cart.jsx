
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <section className="empty-cart">
          <div className="empty-cart-icon">🛍️</div>
          <h1>Your Cart is Empty</h1>
          <p>Looks like you haven't added anything delicious yet.</p>
          <Link to="/menu" className="continue-shopping">
            Explore Our Menu
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <section className="cart-heading">
        <p className="section-label">YOUR SELECTION</p>
        <h1>Your Shopping Cart</h1>
        <p>Review your delicious choices before checkout.</p>
      </section>

      <div className="cart-layout">
        <section className="cart-items">
          {cartItems.map((item) => (
            <article className="cart-item" key={item.cartKey || item.id}>
              <img
                src={item.image_url || "https://placehold.co/200x200?text=CAFE"}
                alt={item.name}
              />

              <div className="cart-item-info">
                <span className="menu-category">
                  {item.category_name || "CAFÉ"}
                </span>

                <h3>{item.name}</h3>
                <p>₹{Number(item.price).toFixed(2)} each</p>

                {item.selectedOptions?.length > 0 && (
                  <div className="cart-selected-options">
                    <small>Customizations:</small>
                    {item.selectedOptions.map((option) => (
                      <p key={option.id}>
                        {option.option_name} (+₹
                        {Number(option.additional_price).toFixed(2)})
                      </p>
                    ))}
                  </div>
                )}

                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.cartKey || String(item.id),
                        item.quantity - 1
                      )
                    }
                    disabled={item.quantity <= 1}
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.cartKey || String(item.id),
                        item.quantity + 1
                      )
                    }
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-item-actions">
                <strong>
                  ₹{(Number(item.price) * item.quantity).toFixed(2)}
                </strong>

                <button
                  type="button"
                  className="remove-item"
                  onClick={() =>
                    removeFromCart(item.cartKey || String(item.id))
                  }
                >
                  Remove
                </button>
              </div>
            </article>
          ))}

          <button
            type="button"
            className="clear-cart"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </section>

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Taxes</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>₹{cartTotal.toFixed(2)}</strong>
          </div>

          <Link to="/checkout" className="checkout-button">
            Proceed to Checkout
          </Link>

          <Link to="/menu" className="continue-link">
            ← Continue Shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}

export default Cart;
