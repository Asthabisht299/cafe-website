
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cafe-cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cafe-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Create a unique identity for each product customization
  const getCartKey = (productId, optionIds = []) =>
    `${productId}-${[...optionIds].sort((a, b) => a - b).join("-")}`;

  const addToCart = (product, selectedOptions = []) => {
    const options = [...selectedOptions].sort((a, b) => a.id - b.id);
    const optionIds = options.map((option) => Number(option.id));
    const additionalPrice = options.reduce(
      (total, option) => total + Number(option.additional_price || 0),
      0
    );

    const unitPrice = Number(product.price) + additionalPrice;
    const cartKey = getCartKey(product.id, optionIds);

    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) => item.cartKey === cartKey
      );

      if (existingItem) {
        return previousItems.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...previousItems,
        {
          cartKey,
          id: product.id,
          name: product.name,
          price: unitPrice,
          image_url: product.image_url,
          category_name: product.category_name,
          quantity: 1,
          selectedOptions: options,
          option_ids: optionIds,
        },
      ];
    });
  };

  const removeFromCart = (cartKey) => {
    setCartItems((items) =>
      items.filter((item) => item.cartKey !== cartKey)
    );
  };

  const updateQuantity = (cartKey, quantity) => {
    if (quantity < 1) return;

    setCartItems((items) =>
      items.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
