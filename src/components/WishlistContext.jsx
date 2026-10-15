import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { wishlistAPI } from '../services/api';
import { WishlistSync, GUEST_WISHLIST_NAMESPACE } from '../services/wishlistSync';
import { useAuth } from './AuthContext';
import { useAuthModal } from './AuthModalContext';

/**
 * Wishlist state.
 *
 * The single behavioural change from the previous implementation is the
 * auth-boundary merge: guest selections are folded in with one atomic
 * `POST /wishlist/merge` instead of one `add` call per product. Storage is
 * namespaced per account, so signing out and signing in as someone else never
 * leaks the previous account's wishlist into view.
 */

const WishlistStateContext = createContext(undefined);
const WishlistDispatchContext = createContext(undefined);

const readGuestWishlist = () => {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_NAMESPACE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.products) ? parsed.products : [];
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || user?._id || null;
  const { openAuthModal } = useAuthModal();

  const syncRef = useRef(null);
  if (syncRef.current === null) {
    syncRef.current = new WishlistSync({ transport: wishlistAPI, userId });
  }
  const sync = syncRef.current;

  const [wishlist, setWishlist] = useState(() => sync.read());
  const [loading, setLoading] = useState(false);
  const [togglingIds, setTogglingIds] = useState(new Set());
  const wishlistRef = useRef(wishlist);
  wishlistRef.current = wishlist;

  const getProductId = useCallback((product) => product?._id || product?.id || product?.product, []);

  // Persist the local view (guest and signed-in alike) for instant paints.
  useEffect(() => {
    sync.write(wishlist);
  }, [sync, wishlist]);

  /**
   * Reconciliation. See the equivalent comment in CartContext: `undefined`
   * means "not looked yet", `null` means "reconciled as a guest". The
   * already-signed-in-on-mount case must fetch explicitly, because `userId`
   * does not change across a reload and a plain change-watcher never fires.
   */
  const bootstrappedUserRef = useRef(undefined);

  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setWishlist(readGuestWishlist());
      return;
    }
    setLoading(true);
    try {
      const result = await sync.fetch();
      if (result.status === 'fetched') {
        setWishlist(result.products);
      }
    } finally {
      setLoading(false);
    }
  }, [sync, userId]);

  // Declared after `fetchWishlist` on purpose: it is in the dependency array,
  // and referencing it before declaration would throw during render.
  useEffect(() => {
    if (bootstrappedUserRef.current === userId) return;
    const previous = bootstrappedUserRef.current;
    bootstrappedUserRef.current = userId;

    if (previous === undefined) {
      if (userId) void fetchWishlist();
      return;
    }

    if (!previous && userId) {
      // Guest -> signed in. Guest entries are read before the namespace
      // switches, so the merge can still find them.
      const guestItems = readGuestWishlist();
      sync.setUser(userId);
      void (async () => {
        setLoading(true);
        try {
          const merged = await sync.mergeGuestWishlist(guestItems);
          if (merged.status === 'merged') {
            setWishlist(merged.products);
            if (merged.warnings?.length) {
              toast.error('Some saved items are no longer available and were not carried over.');
            }
          } else {
            const fetched = await sync.fetch();
            if (fetched.status === 'fetched') setWishlist(fetched.products);
          }
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    sync.setUser(userId);
    setWishlist(sync.read());
    if (userId) void fetchWishlist();
  }, [userId, sync, fetchWishlist]);

  const addToWishlist = useCallback(async (product) => {
    const productId = getProductId(product);

    setWishlist((prev) => (prev.some((item) => getProductId(item) === productId) ? prev : [...prev, product]));

    if (!userId) {
      toast('Added to wishlist', {
        description: 'Sign in to save it permanently',
        action: { label: 'Sign In', onClick: () => openAuthModal() },
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
  }, [userId, getProductId, openAuthModal]);

  const removeFromWishlist = useCallback(async (product) => {
    const productId = getProductId(product);

    setWishlist((prev) => prev.filter((item) => getProductId(item) !== productId));

    if (!userId) {
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
  }, [userId, getProductId]);

  const toggleWishlist = useCallback(async (product) => {
    const productId = getProductId(product);
    const present = wishlistRef.current.some((item) => getProductId(item) === productId);
    if (present) {
      await removeFromWishlist(product);
    } else {
      await addToWishlist(product);
    }
  }, [getProductId, addToWishlist, removeFromWishlist]);

  const isInWishlist = useCallback((product) => {
    const productId = getProductId(product);
    return wishlistRef.current.some((item) => getProductId(item) === productId);
  }, [getProductId]);

  const isToggling = useCallback((product) => {
    const productId = getProductId(product);
    return togglingIds.has(productId);
  }, [togglingIds, getProductId]);

  const checkWishlistStatus = useCallback(async (productId) => {
    if (!userId) return wishlistRef.current.some((item) => getProductId(item) === productId);
    try {
      const data = await wishlistAPI.check(productId);
      return data.inWishlist;
    } catch {
      return wishlistRef.current.some((item) => getProductId(item) === productId);
    }
  }, [userId, getProductId]);

  const hasGuestItems = useMemo(() => !userId && wishlist.length > 0, [userId, wishlist.length]);
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
      isAuthenticated: !!userId,
    }),
    [wishlist, wishlistCount, loading, isToggling, isInWishlist, checkWishlistStatus, hasGuestItems, userId]
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
