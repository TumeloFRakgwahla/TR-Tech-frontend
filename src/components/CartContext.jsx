import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { cartAPI } from '../services/api';
import { CartSyncEngine, GUEST_NAMESPACE } from '../services/cartSync';
import { useAuth } from './AuthContext';

/**
 * Cart state.
 *
 * All persistence, queueing and conflict handling live in `cartSync.js`. This
 * provider is a thin React binding over that engine: it maps engine state onto
 * the shape the UI expects and forwards user intents.
 *
 * Consumers historically read `item._id || item.id`, so the mapping below keeps
 * that contract while the engine works in terms of `product`.
 */

const CartStateContext = createContext(undefined);
const CartDispatchContext = createContext(undefined);

/** Engine line -> component-facing cart item. */
const toCartItem = (item) => ({
  ...item,
  id: item.product,
  _id: item.product,
});

const readGuestItems = () => {
  try {
    const raw = localStorage.getItem(GUEST_NAMESPACE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.items) ? parsed.items : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id || user?._id || null;

  const engineRef = useRef(null);
  if (engineRef.current === null) {
    engineRef.current = new CartSyncEngine({
      transport: cartAPI,
      userId,
    });
  }
  const engine = engineRef.current;

  const [snapshot, setSnapshot] = useState(() => engine.getState());
  const [syncing, setSyncing] = useState(false);
  // Surfaced so the UI can explain a merge that clamped or dropped lines.
  const [warnings, setWarnings] = useState([]);

  const cart = useMemo(() => snapshot.items.map(toCartItem), [snapshot.items]);

  useEffect(() => engine.subscribe(setSnapshot), [engine]);

  /**
   * Reconciliation, covering two cases that a naive `userId`-change watcher
   * misses.
   *
   * `bootstrappedUserRef` holds the userId we have already reconciled for:
   *   - `undefined` = we have not looked yet
   *   - `null`      = reconciled as a guest (nothing to fetch)
   *
   * The important case is a hard page reload while already signed in. There
   * `userId` is identical on the first render, so a plain "did userId change?"
   * effect never fires and the server cart is never fetched — the UI would sit
   * on stale localStorage until something else triggered a refresh.
   */
  const bootstrappedUserRef = useRef(undefined);
  useEffect(() => {
    if (bootstrappedUserRef.current === userId) return;
    const previous = bootstrappedUserRef.current;
    bootstrappedUserRef.current = userId;

    if (previous === undefined) {
      // First look. A guest has nothing to fetch; a signed-in user does.
      if (userId) void engine.refresh();
      return;
    }

    if (!previous && userId) {
      // Guest -> signed in. Read the guest cart BEFORE switching namespaces,
      // otherwise the guest lines are unreachable when the merge runs.
      const guestItems = readGuestItems();
      engine.setUser(userId);
      void (async () => {
        setSyncing(true);
        try {
          // Pull authoritative state first, then fold the guest cart in, so the
          // merge sums onto the current server cart rather than an empty one.
          await engine.refresh();
          const result = await engine.mergeGuestCart(guestItems);
          if (result.status === 'merged' && result.warnings?.length) {
            setWarnings(result.warnings);
          }
        } finally {
          setSyncing(false);
        }
      })();
      return;
    }

    // Logout, or a direct account switch. Flush before dropping the session,
    // otherwise intents queued for the old account are lost.
    void (async () => {
      await engine.flushBeforeExit();
      engine.setUser(userId);
      setWarnings([]);
      if (userId) await engine.refresh();
    })();
  }, [userId, engine]);

  // Reconcile when the tab becomes visible again: another device may have
  // changed the cart while this tab was in the background.
  useEffect(() => {
    if (typeof document === 'undefined' || !isAuthenticated) return undefined;
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void engine.refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isAuthenticated, engine]);

  // Stop syncing state updates after unmount.
  useEffect(() => () => engine.destroy(), [engine]);

  const getProductId = useCallback((product) => product?._id || product?.id || product?.product, []);

  const addToCart = useCallback((product, quantity = 1) => {
    const productId = getProductId(product);
    const availableStock = product?.stock ?? null;
    const existing = engine.state.items.find(
      (item) => item.product === productId && (item.variantKey || '') === (product?.variantKey || '')
    );

    const nextQuantity = (existing?.quantity || 0) + quantity;
    if (availableStock !== null && availableStock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    if (availableStock !== null && nextQuantity > availableStock) {
      toast.error(`Cannot add more ${product.name}. Only ${availableStock} available in stock.`);
      return;
    }

    // Optimistic local echo for guests and signed-in users alike; the server
    // response replaces it as soon as the flush completes.
    engine.enqueue({
      type: 'ADD',
      product: productId,
      variantKey: product?.variantKey || '',
      quantity,
      name: product?.name,
      price: product?.price,
      condition: product?.condition,
      category: product?.category,
      image: product?.image,
      stock: availableStock,
    });
    toast.success(existing ? 'Quantity updated in cart' : 'Added to cart');
  }, [engine, getProductId]);

  const removeFromCart = useCallback((productId, variantKey = '') => {
    engine.enqueue({ type: 'REMOVE', product: productId, variantKey });
    toast.success('Removed from cart');
  }, [engine]);

  const updateQuantity = useCallback((productId, quantity, variantKey = '') => {
    if (quantity <= 0) {
      engine.enqueue({ type: 'REMOVE', product: productId, variantKey });
      return;
    }
    const existing = engine.state.items.find(
      (item) => item.product === productId && (item.variantKey || '') === variantKey
    );
    if (existing?.stock !== null && existing?.stock !== undefined && quantity > existing.stock) {
      toast.error(`Only ${existing.stock} available in stock for ${existing.name}`);
      return;
    }
    engine.enqueue({ type: 'SET_QTY', product: productId, variantKey, quantity });
  }, [engine]);

  const clearCart = useCallback(() => {
    engine.enqueue({ type: 'CLEAR' });
  }, [engine]);

  const refreshCart = useCallback(() => engine.refresh(), [engine]);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cart]
  );

  // Prefer the server subtotal. Fall back to summing the item prices, which are
  // themselves server-owned, so guests still get a correct total.
  const totalPrice = useMemo(() => {
    if (typeof snapshot.subtotal === 'number') return snapshot.subtotal;
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0), 0);
  }, [cart, snapshot.subtotal]);

  const stateValue = useMemo(
    () => ({
      cart,
      totalItems,
      totalPrice,
      syncing,
      warnings,
      pendingChanges: snapshot.pending,
      rev: snapshot.rev,
      refreshCart,
    }),
    [cart, totalItems, totalPrice, syncing, warnings, snapshot.pending, snapshot.rev, refreshCart]
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
      warnings: [],
      pendingChanges: 0,
      rev: 0,
      refreshCart: () => {},
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
