import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WISHLIST_STORAGE_KEY = 'trtech_wishlist';

const WishlistStateContext = createContext(undefined);
const WishlistDispatchContext = createContext(undefined);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Storage full or unavailable
    }
  }, [wishlist]);

  const getProductId = useCallback((product) => product._id || product.id, []);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await wishlistAPI.getAll();
      setWishlist(data.data || []);
    } catch {
      // Silently fail wishlist fetch
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated, fetchWishlist]);

  const addToWishlist = useCallback(async (product) => {
    const productId = getProductId(product);

    if (!isAuthenticated) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }

    try {
      await wishlistAPI.add(productId);
      setWishlist((prev) => {
        if (prev.find((item) => getProductId(item) === productId)) {
          return prev;
        }
        return [...prev, { ...product, id: productId }];
      });
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error(error.message || 'Failed to add to wishlist');
    }
  }, [isAuthenticated, getProductId]);

  const removeFromWishlist = useCallback(async (product) => {
    const productId = getProductId(product);

    try {
      await wishlistAPI.remove(productId);
      setWishlist((prev) => prev.filter((item) => getProductId(item) !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error.message || 'Failed to remove from wishlist');
    }
  }, [getProductId]);

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

  const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

  const stateValue = useMemo(
    () => ({
      wishlist,
      wishlistCount,
      loading,
      isInWishlist,
    }),
    [wishlist, wishlistCount, loading, isInWishlist]
  );

  const dispatchValue = useMemo(
    () => ({
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      fetchWishlist,
    }),
    [addToWishlist, removeFromWishlist, toggleWishlist, fetchWishlist]
  );

  return (
    <WishlistStateContext.Provider value={stateValue}>
      <WishlistDispatchContext.Provider value={dispatchValue}>
        {children}
      </WishlistDispatchContext.Provider>
    </WishlistStateContext.Provider>
  );
}

export function useWishlistState() {
  const context = useContext(WishlistStateContext);
  if (!context) {
    return {
      wishlist: [],
      wishlistCount: 0,
      loading: false,
      isInWishlist: () => false,
    };
  }
  return context;
}

export function useWishlistDispatch() {
  const context = useContext(WishlistDispatchContext);
  if (!context) {
    return {
      addToWishlist: () => {},
      removeFromWishlist: () => {},
      toggleWishlist: () => {},
      fetchWishlist: () => {},
    };
  }
  return context;
}

export function useWishlist() {
  return {
    ...useWishlistState(),
    ...useWishlistDispatch(),
  };
}
