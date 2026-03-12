import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const CART_STORAGE_KEY = 'trtech_cart';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  // Initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Helper function to get product identifier
  const getProductId = (product) => product._id || product.id;

  const addToCart = (product) => {
    const productId = getProductId(product);
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => getProductId(item) === productId);
      if (existingItem) {
        toast.success('Quantity updated in cart');
        return prevCart.map((item) =>
          getProductId(item) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success('Added to cart');
      return [...prevCart, { ...product, id: productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => getProductId(item) !== productId));
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        getProductId(item) === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    // Return default values when not inside CartProvider
    return {
      cart: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      totalItems: 0,
      totalPrice: 0,
    };
  }
  return context;
}
