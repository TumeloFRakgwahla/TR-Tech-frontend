import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useAuthModal } from './AuthModalContext';

const WISHLIST_STORAGE_KEY = 'trtech_wishlist';
const WISHLIST_STORAGE_VERSION = 1;

// Safe localStorage read with versioning — falls back gracefully and
// never throws. If the stored value is corrupted, we discard it and
// start fresh so a bad entry never clears the cart silently.
function readStorage(key, defaultValue = []) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.version !== WISHLIST_STORAGE_VERSION && parsed.items !== undefined) {
      return parsed.items;
    }
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch {
    try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
    return defaultValue;
  }
}

const WishlistStateContext = createContext(undefined);
const WishlistDispatchContext = createContext(undefined);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => readStorage(WISHLIST_STORAGE_KEY));
  const [loading, setLoading] = useState(false);
  const [togglingIds, setTogglingIds] = useState(new Set());
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();
  const wishlistRef = useRef(wishlist);
  wishlistRef.current = wishlist;

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [wishlist]);

  const getProductId = useCallback((product) => product._id || product.id, []);

  const mergeLocalWishlist = useCallback(async (serverProducts) => {
    const currentWishlist = wishlistRef.current;
    const serverIds = new Set((serverProducts || []).map((p) => getProductId(p)));
    const localIds = currentWishlist.map((p) => getProductId(p));
    const newProductIds = localIds.filter((id) => !serverIds.has(id));

    if (newProductIds.length === 0) {
      return { merged: serverProducts, allSynced: true };
    }

    try {
      const results = await Promise.allSettled(
        newProductIds.map((id) => wishlistAPI.add(id))
      );
      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0 && failures.length < newProductIds.length) {
        toast.error('Some wishlist items could not be saved to your account');
      } else if (failures.length === newProductIds.length) {
        toast.error('Failed to save wishlist items. They remain in your local wishlist.');
      }

      const failedProductIds = new Set(
        results
          .map((r, i) => (r.status === 'rejected' ? newProductIds[i] : null))
          .filter(Boolean)
      );
      const failedLocalItems = currentWishlist.filter((p) =>
        failedProductIds.has(getProductId(p))
      );

      return {
        merged: [...serverProducts, ...failedLocalItems],
        allSynced: failedProductIds.size === 0,
      };
    } catch {
      toast.error('Failed to save wishlist items. They remain in your local wishlist.');
      return {
        merged: [
          ...serverProducts,
          ...currentWishlist.filter((p) => !serverIds.has(getProductId(p))),
        ],
        allSynced: false,
      };
    }
  }, [getProductId]);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist(readStorage(WISHLIST_STORAGE_KEY));
      return;
    }

    try {
      setLoading(true);
      const data = await wishlistAPI.getAll();
      const serverProducts = data.data || [];
      const { merged, allSynced } = await mergeLocalWishlist(serverProducts);
      setWishlist(merged);
      // Only clear localStorage if all local items were successfully
      // synced to the server. If any failed, keep them in localStorage
      // so they survive page reloads for retry on next login.
      if (allSynced) {
        localStorage.removeItem(WISHLIST_STORAGE_KEY);
      }
    } catch {
      toast.error('Failed to load wishlist from server');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, mergeLocalWishlist]);

  const prevAuthRef = useRef(false);
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (isAuthenticated && !prevAuthRef.current) {
      prevAuthRef.current = true;
      fetchedRef.current = false;
    } else if (!isAuthenticated) {
      prevAuthRef.current = false;
      fetchedRef.current = false;
      return;
    }

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchWishlist();
    }
  }, [isAuthenticated]); // Removed fetchWishlist from deps to break the loop

  const addToWishlist = useCallback(async (product) => {
    const productId = getProductId(product);
    const productData = { ...product, id: productId };

    setWishlist((prev) => {
      if (prev.find((item) => getProductId(item) === productId)) {
        return prev;
      }
      return [...prev, productData];
    });

    if (!isAuthenticated) {
      toast('Added to wishlist', {
        description: 'Sign in to save it permanently',
        action: {
          label: 'Sign In',
          onClick: () => openAuthModal(),
        },
        duration: 5000,
      });
      return;
    }

    setTogglingIds((prev) => new Set(prev).add(productId));
    try {
      await wishlistAPI.add(productId);
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error(error.message || 'Failed to add to wishlist');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, [isAuthenticated, getProductId, openAuthModal]);

  const removeFromWishlist = useCallback(async (product) => {
    const productId = getProductId(product);

    setWishlist((prev) => prev.filter((item) => getProductId(item) !== productId));

    if (!isAuthenticated) {
      toast.success('Removed from wishlist', {
        description: 'Sign in to manage your wishlist across devices',
      });
      return;
    }

    setTogglingIds((prev) => new Set(prev).add(productId));
    try {
      await wishlistAPI.remove(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error.message || 'Failed to remove from wishlist');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, [isAuthenticated, getProductId]);

  const toggleWishlist = useCallback(async (product) => {
    const productId = getProductId(product);
    const isInWishlist = wishlist.some((item) => getProductId(item) === productId);

    if (isInWishlist) {
      await removeFromWishlist(product);
    } else {
      await addToWishlist(product);
    }
  }, [wishlist, getProductId, addToWishlist, removeFromWishlist]);

  const isInWishlist = useCallback((product) => {
    const productId = getProductId(product);
    return wishlist.some((item) => getProductId(item) === productId);
  }, [wishlist, getProductId]);

  const isToggling = useCallback((product) => {
    const productId = getProductId(product);
    return togglingIds.has(productId);
  }, [togglingIds, getProductId]);

  const checkWishlistStatus = useCallback(async (productId) => {
    if (!isAuthenticated) return isInWishlist(productId);
    try {
      const data = await wishlistAPI.check(productId);
      return data.inWishlist;
    } catch {
      return isInWishlist(productId);
    }
  }, [isAuthenticated, isInWishlist]);

  const hasGuestItems = useMemo(() => !isAuthenticated && wishlist.length > 0, [isAuthenticated, wishlist.length]);

  const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

  const stateValue = useMemo(
    () => ({
      wishlist,
      wishlistCount,
      loading,
      isToggling,
      isInWishlist,
      checkWishlistStatus,
      hasGuestItems,
      isAuthenticated,
    }),
    [wishlist, wishlistCount, loading, isToggling, isInWishlist, checkWishlistStatus, hasGuestItems, isAuthenticated]
  );

  const dispatchValue = useMemo(
    () => ({
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      fetchWishlist,
      checkWishlistStatus,
    }),
    [addToWishlist, removeFromWishlist, toggleWishlist, fetchWishlist, checkWishlistStatus]
  );

  return (
    <WishlistStateContext.Provider value={stateValue}>
      <WishlistDispatchContext.Provider value={dispatchValue}>
        {children}
      </WishlistDispatchContext.Provider>
    </WishlistStateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlistState() {
  const context = useContext(WishlistStateContext);
  if (!context) {
    return {
      wishlist: [],
      wishlistCount: 0,
      loading: false,
      isToggling: () => false,
      isInWishlist: () => false,
      checkWishlistStatus: async () => false,
      hasGuestItems: false,
      isAuthenticated: false,
    };
  }
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlistDispatch() {
  const context = useContext(WishlistDispatchContext);
  if (!context) {
    return {
      addToWishlist: () => {},
      removeFromWishlist: () => {},
      toggleWishlist: () => {},
      fetchWishlist: () => {},
      checkWishlistStatus: async () => false,
    };
  }
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  return {
    ...useWishlistState(),
    ...useWishlistDispatch(),
  };
}
