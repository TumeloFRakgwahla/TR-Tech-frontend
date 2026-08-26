import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

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
  const [syncing, setSyncing] = useState(false);
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const { isAuthenticated, user } = useAuth();
  const syncTimerRef = useRef(null);
  const syncInProgressRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage full or unavailable
    }
  }, [cart]);

  const getProductId = useCallback((product) => product._id || product.id, []);

  const mergeCarts = useCallback((localCart, serverCart) => {
    const merged = [...serverCart];
    const serverIds = new Set(serverCart.map((item) => getProductId(item)));

    for (const localItem of localCart) {
      const localId = getProductId(localItem);
      if (!serverIds.has(localId)) {
        merged.push(localItem);
      }
    }

    return merged;
  }, [getProductId]);

  const fetchServerCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setSyncing(true);
      const data = await cartAPI.getAll();
      if (data.success) {
        const serverCart = data.data || [];
        const merged = mergeCarts(cartRef.current, serverCart);
        setCart(merged);
      }
    } catch (error) {
      console.error('Failed to fetch server cart:', error);
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated, mergeCarts]);

  const syncCartToServer = useCallback(async (items) => {
    if (!isAuthenticated || syncInProgressRef.current) return;
    syncInProgressRef.current = true;
    try {
      setSyncing(true);
      const serverCartData = await cartAPI.getAll();
      const serverCart = serverCartData?.data || [];
      const serverMap = new Map();
      serverCart.forEach((item) => {
        const id = getProductId(item);
        if (id) serverMap.set(id, item);
      });
      const localMap = new Map();
      items.forEach((item) => {
        const id = getProductId(item);
        if (id) localMap.set(id, item);
      });

      const operations = [];

      for (const [id] of serverMap) {
        if (!localMap.has(id)) {
          operations.push({ type: 'remove', id, promise: cartAPI.remove(id) });
        }
      }

      for (const [id, localItem] of localMap) {
        const serverItem = serverMap.get(id);
        if (!serverItem) {
          if (!/^[a-f\d]{24}$/i.test(id)) {
            console.warn('Skipping cart sync for invalid product ID:', id);
            continue;
          }
          operations.push({ type: 'add', id, promise: cartAPI.add({
            product: id,
            name: localItem.name,
            condition: localItem.condition,
            price: localItem.price,
            quantity: localItem.quantity,
            image: localItem.image,
          }) });
        } else if (serverItem.quantity !== localItem.quantity) {
          if (!/^[a-f\d]{24}$/i.test(id)) {
            console.warn('Skipping cart sync for invalid product ID:', id);
            continue;
          }
          operations.push({ type: 'update', id, promise: cartAPI.update(id, localItem.quantity) });
        }
      }

      if (operations.length > 0) {
        const results = await Promise.allSettled(operations.map((op) => op.promise));
        const failures = results
          .map((result, index) => ({ result, op: operations[index] }))
          .filter(({ result }) => result.status === 'rejected');
        if (failures.length > 0) {
          console.error(`${failures.length} cart sync operation(s) failed:`, failures.map(({ op, result }) => ({
            type: op.type,
            id: op.id,
            error: result.reason?.message || result.reason,
          })));
          toast.error('Some cart changes could not be synced.');
        }
      }
    } catch (error) {
      console.error('Failed to sync cart to server:', error);
      toast.error('Failed to sync cart. Please refresh the page.');
    } finally {
      setSyncing(false);
      syncInProgressRef.current = false;
    }
  }, [isAuthenticated, getProductId]);

  useEffect(() => {
    if (isAuthenticated && (user?.id || user?._id)) {
      fetchServerCart();
    }
  }, [isAuthenticated, user?.id || user?._id, fetchServerCart]);

  useEffect(() => {
    if (isAuthenticated && cart.length > 0 && !syncTimerRef.current) {
      syncTimerRef.current = setTimeout(() => {
        syncCartToServer(cartRef.current);
        syncTimerRef.current = null;
      }, 1000);
    }
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, [cart, isAuthenticated, syncCartToServer]);

  const addToCart = useCallback((product, quantity = 1) => {
    const productId = getProductId(product);
    const availableStock = product.stock || 0;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => getProductId(item) === productId);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > availableStock) {
          return prevCart;
        }
        return prevCart.map((item) =>
          getProductId(item) === productId ? { ...item, quantity: newQuantity } : item
        );
      }
      if (availableStock === 0) {
        return prevCart;
      }
      return [...prevCart, { ...product, id: productId, quantity }];
    });

    const existingItem = cartRef.current.find((item) => getProductId(item) === productId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > availableStock) {
        toast.error(`Cannot add more ${product.name}. Only ${availableStock} available in stock.`);
        return;
      }
      toast.success('Quantity updated in cart');
    } else {
      if (availableStock === 0) {
        toast.error(`${product.name} is out of stock`);
        return;
      }
      toast.success('Added to cart');
    }
  }, [getProductId]);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => getProductId(item) !== productId));
    toast.success('Removed from cart');
  }, [getProductId]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) => {
      const item = prevCart.find((item) => getProductId(item) === productId);
      if (item && quantity > (item.stock || 0)) {
        return prevCart;
      }
      return prevCart.map((item) => (getProductId(item) === productId ? { ...item, quantity } : item));
    });
    const item = cartRef.current.find((item) => getProductId(item) === productId);
    if (item && quantity > (item.stock || 0)) {
      toast.error(`Only ${item.stock || 0} available in stock for ${item.name}`);
    }
  }, [getProductId, removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (isAuthenticated) {
      cartAPI.clear().catch(() => {});
    }
  }, [isAuthenticated]);

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
      syncing,
    }),
    [cart, totalItems, totalPrice, syncing]
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

// eslint-disable-next-line react-refresh/only-export-components
export function useCartState() {
  const context = useContext(CartStateContext);
  if (!context) {
    return {
      cart: [],
      totalItems: 0,
      totalPrice: 0,
      syncing: false,
    };
  }
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
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

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return {
    ...useCartState(),
    ...useCartDispatch(),
  };
}
