
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import "./Checkout.css";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();

  const savedTableNumber = localStorage.getItem("cafe_table_number");
  const savedTableToken = localStorage.getItem("cafe_table_token");

  const hasVerifiedTable =
    Boolean(savedTableNumber) &&
    Boolean(savedTableToken) &&
    /^[a-f0-9]{64}$/i.test(savedTableToken);

  const [orderType, setOrderType] = useState(
    hasVerifiedTable ? "dine-in" : "takeaway"
  );

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  const clearTableData = () => {
    localStorage.removeItem("cafe_table_number");
    localStorage.removeItem("cafe_table_token");
  };

  const completeOrder = (order) => {
    setSuccessOrder(order);
    clearCart();
    clearTableData();
    setLoading(false);
  };

  // ORDER SUCCESS
  if (successOrder) {
    const trackingToken = successOrder.tracking_token;

    return (
      <main className="checkout-page">
        <div className="empty-cart order-success">
          <div className="success-icon">✓</div>

          <p className="section-label">ORDER CONFIRMED</p>

          <h1>Thank You, {customerName}!</h1>

          <p>
            Your order has been placed successfully. We'll take care of the rest.
          </p>

          <div className="order-confirmation-details">
            <div>
              <span>Order Number</span>
              <strong>#{successOrder.id}</strong>
            </div>

            <div>
              <span>Order Type</span>
              <strong>
                {successOrder.order_type === "dine_in"
                  ? "Dine In"
                  : "Takeaway"}
              </strong>
            </div>

            {successOrder.order_type === "dine_in" &&
              successOrder.table_number && (
                <div>
                  <span>Table Number</span>
                  <strong>{successOrder.table_number}</strong>
                </div>
              )}

            <div>
              <span>Order Total</span>
              <strong>
                ₹{Number(successOrder.total_amount).toFixed(2)}
              </strong>
            </div>

            <div>
              <span>Payment Method</span>
              <strong>
                {successOrder.payment_method === "razorpay"
                  ? "Razorpay Online"
                  : "Pay at Counter / Pickup"}
              </strong>
            </div>

            <div>
              <span>Payment Status</span>
              <strong>
                {successOrder.payment_status === "paid"
                  ? "Paid"
                  : "Pending"}
              </strong>
            </div>

            <div>
              <span>Order Status</span>
              <strong className="order-confirmation-status">
                {successOrder.order_status}
              </strong>
            </div>
          </div>

          {trackingToken ? (
            <Link
              to={`/track/${trackingToken}`}
              className="continue-shopping"
            >
              Track My Order
            </Link>
          ) : (
            <p className="checkout-error">
              Your order is confirmed, but the tracking link is unavailable.
              Please contact the café with your order number.
            </p>
          )}

          <Link to="/menu" className="order-menu-link">
            Continue Exploring Menu
          </Link>
        </div>
      </main>
    );
  }

  // EMPTY CART
  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="empty-cart">
          <h1>Your Cart is Empty</h1>
          <p>Add some delicious items before checkout.</p>

          <Link to="/menu" className="continue-shopping">
            Explore Menu
          </Link>
        </div>
      </main>
    );
  }

  // PREPARE ORDER DATA
  const getOrderData = () => ({
    customer_name: customerName.trim(),
    customer_email: customerEmail.trim(),
    customer_phone: phone.trim(),
    order_type: orderType === "dine-in" ? "dine_in" : "takeaway",
    table_token: orderType === "dine-in" ? savedTableToken : null,
    notes: notes.trim(),
    items: cartItems.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      option_ids: item.option_ids || [],
    })),
  });

  // HANDLE RAZORPAY PAYMENT
  const handleRazorpayPayment = async (orderData) => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error(
        "Unable to load Razorpay. Please check your internet connection."
      );
    }

    // Create order securely on backend
    const createResponse = await api.post(
      "/payments/create-order",
      orderData
    );

    const paymentData = createResponse.data;
    const order = paymentData.order;

    if (
      !paymentData.key_id ||
      !paymentData.razorpay_order_id ||
      !paymentData.amount ||
      !order?.id
    ) {
      throw new Error("Invalid payment order response from server.");
    }

    const options = {
      key: paymentData.key_id,
      amount: paymentData.amount,
      currency: paymentData.currency || "INR",
      name: "CAFÉ",
      description: "Cafe Order Payment",
      order_id: paymentData.razorpay_order_id,

      prefill: {
        name: customerName.trim(),
        email: customerEmail.trim(),
        contact: phone.trim(),
      },

      notes: {
        cafe_order_id: String(order.id),
      },

      theme: {
        color: "#6f4e37",
      },

      handler: async (razorpayResponse) => {
        try {
          // Verify payment on backend
          const verifyResponse = await api.post("/payments/verify", {
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
          });

          if (verifyResponse.data.payment_status !== "paid") {
            setError(
              `Payment is not confirmed yet. Your order number is #${order.id}. Please contact the café before trying again.`
            );
            setLoading(false);
            return;
          }

          completeOrder({
            ...order,
            payment_method: "razorpay",
            payment_status: "paid",
          });
        } catch (err) {
          console.error("Payment verification error:", err);

          setError(
            `We could not confirm your payment right now. Your order number is #${order.id}. Please contact the café before making another payment.`
          );

          setLoading(false);
        }
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", (response) => {
      console.error("Razorpay payment failed:", response.error);

      setError(
        response.error?.description ||
          "Payment failed. You can try again."
      );

      setLoading(false);
    });

    razorpay.open();

    razorpay.on("payment.failed", () => {
      setLoading(false);
    });
  };

  // PLACE ORDER
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (orderType === "dine-in" && !hasVerifiedTable) {
      setError(
        "Please scan an active table QR code to place a dine-in order."
      );
      return;
    }

    try {
      setLoading(true);

      const orderData = getOrderData();

      if (paymentMethod === "razorpay") {
        await handleRazorpayPayment(orderData);
        return;
      }

      // Existing offline order flow
      const response = await api.post("/orders", orderData);
      const order = response.data.order;

      completeOrder({
        ...order,
        order_type: orderType === "dine-in" ? "dine_in" : "takeaway",
        table_number:
          order?.table_number ||
          (orderType === "dine-in" ? savedTableNumber : null),
        total_amount: order?.total_amount ?? cartTotal,
        tracking_token:
          order?.tracking_token || response.data.tracking_token,
        payment_method:
          orderType === "dine-in" ? "pay_at_counter" : "cash_on_pickup",
        payment_status: order?.payment_status || "pending",
      });
    } catch (err) {
      console.error("Order submission error:", err);

      const validationErrors = err.response?.data?.errors;

      if (validationErrors?.length) {
        setError(
          validationErrors
            .map((item) => item.message || item.msg)
            .filter(Boolean)
            .join(" ")
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to place your order. Please try again."
        );
      }

      setLoading(false);
    }
  };

  return (
    <main className="checkout-page">
      <section className="cart-heading">
        <p className="section-label">ALMOST THERE</p>
        <h1>Complete Your Order</h1>
        <p>Just a few details before we prepare your order.</p>
      </section>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Your Details</h2>

          <label htmlFor="customerName">Full Name</label>
          <input
            id="customerName"
            type="text"
            placeholder="Enter your full name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            maxLength={100}
            required
          />

          <label htmlFor="customerEmail">Email Address</label>
          <input
            id="customerEmail"
            type="email"
            placeholder="Enter your email address"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            maxLength={150}
            required
          />

          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            pattern="[0-9]{10}"
            title="Enter a valid 10-digit phone number"
            required
          />

          <h2 className="order-type-heading">Choose Order Type</h2>

          <div className="order-type-options">
            <label className={orderType === "takeaway" ? "selected" : ""}>
              <input
                type="radio"
                name="orderType"
                value="takeaway"
                checked={orderType === "takeaway"}
                onChange={() => setOrderType("takeaway")}
              />
              Takeaway
            </label>

            <label
              className={orderType === "dine-in" ? "selected" : ""}
              style={!hasVerifiedTable ? { opacity: 0.5 } : undefined}
            >
              <input
                type="radio"
                name="orderType"
                value="dine-in"
                checked={orderType === "dine-in"}
                disabled={!hasVerifiedTable}
                onChange={() => setOrderType("dine-in")}
              />
              Dine In
            </label>
          </div>

          {orderType === "dine-in" && hasVerifiedTable && (
            <>
              <label htmlFor="tableNumber">Verified Table Number</label>
              <input
                id="tableNumber"
                type="text"
                value={savedTableNumber}
                readOnly
              />
            </>
          )}

          {!hasVerifiedTable && (
            <p>
              Dine-in ordering is available after scanning an active
              table QR code.
            </p>
          )}

          <h2 className="order-type-heading">Choose Payment Method</h2>

          <div className="order-type-options">
            <label
              className={paymentMethod === "razorpay" ? "selected" : ""}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
              />
              Pay Online (UPI / Cards / Net Banking)
            </label>

            <label
              className={paymentMethod === "offline" ? "selected" : ""}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="offline"
                checked={paymentMethod === "offline"}
                onChange={() => setPaymentMethod("offline")}
              />
              {orderType === "dine-in"
                ? "Pay at Counter"
                : "Cash on Pickup"}
            </label>
          </div>

          <label htmlFor="notes">
            Special Instructions (Optional)
          </label>

          <textarea
            id="notes"
            rows="4"
            placeholder="Any special requests?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
          />

          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="checkout-place-button"
            disabled={loading}
          >
            {loading
              ? paymentMethod === "razorpay"
                ? "Opening Secure Payment..."
                : "Placing Your Order..."
              : paymentMethod === "razorpay"
                ? "Pay Securely"
                : "Place Order"}
          </button>
        </form>

        {/* ORDER SUMMARY */}
        <aside className="checkout-summary">
          <h2>Your Order</h2>

          {cartItems.map((item) => {
            const optionsTotal = (item.selectedOptions || []).reduce(
              (total, option) =>
                total + Number(option.additional_price || 0),
              0
            );

            const itemTotal =
              (Number(item.price) + optionsTotal) * item.quantity;

            return (
              <div
                className="checkout-product"
                key={item.cartKey || item.id}
              >
                <div>
                  <strong>{item.name}</strong>
                  <p>Quantity: {item.quantity}</p>

                  {item.selectedOptions?.map((option) => (
                    <p key={option.id}>
                      + {option.option_name} (
                      ₹{Number(option.additional_price).toFixed(2)})
                    </p>
                  ))}
                </div>

                <span>₹{itemTotal.toFixed(2)}</span>
              </div>
            );
          })}

          <div className="checkout-total">
            <span>Order Total</span>
            <strong>₹{Number(cartTotal).toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
