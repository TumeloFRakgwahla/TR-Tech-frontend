import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

const CART_STORAGE_KEY = 'trtech_cart';

const CartStateContext = createContext(undefined);
const CartDispatchContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage full or unavailable
    }
  }, [cart]);

  const getProductId = useCallback((product) => product._id || product.id, []);

  const addToCart = useCallback((product) => {
    const productId = getProductId(product);
    const availableStock = product.stock || 0;
    const currentQuantityInCart = cart.find((item) => getProductId(item) === productId)?.quantity || 0;

    if (availableStock === 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    if (currentQuantityInCart >= availableStock) {
      toast.error(`Cannot add more ${product.name}. Only ${availableStock} available in stock.`);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => getProductId(item) === productId);
      if (existingItem) {
        toast.success('Quantity updated in cart');
        return prevCart.map((item) =>
          getProductId(item) === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success('Added to cart');
      return [...prevCart, { ...product, id: productId, quantity: 1 }];
    });
  }, [cart, getProductId]);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => getProductId(item) !== productId));
    toast.success('Removed from cart');
  }, [getProductId]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (getProductId(item) === productId ? { ...item, quantity } : item))
    );
  }, [getProductId, removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const stateValue = useMemo(
    () => ({
      cart,
      totalItems,
      totalPrice,
    }),
    [cart, totalItems, totalPrice]
  );

  const dispatchValue = useMemo(
    () => ({
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [addToCart, removeFromCart, updateQuantity, clearCart]
  );

  return (
    <CartStateContext.Provider value={stateValue}>
      <CartDispatchContext.Provider value={dispatchValue}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

export function useCartState() {
  const context = useContext(CartStateContext);
  if (!context) {
    return {
      cart: [],
      totalItems: 0,
      totalPrice: 0,
    };
  }
  return context;
}

export function useCartDispatch() {
  const context = useContext(CartDispatchContext);
  if (!context) {
    return {
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
    };
  }
  return context;
}

export function useCart() {
  return {
    ...useCartState(),
    ...useCartDispatch(),
  };
}
