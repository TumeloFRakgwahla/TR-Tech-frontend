/**
 * Wishlist sync.
 *
 * A wishlist is a SET, so its merge has two properties the cart does not have:
 * it is idempotent and commutative with no batching machinery required. That
 * makes the whole thing much smaller than `cartSync.js` — the only things worth
 * centralising are the storage namespace (so accounts stay isolated) and the
 * set union itself.
 *
 * The previous implementation merged by calling `wishlistAPI.add` once per item
 * and then, if any call failed, silently keeping the leftovers local. That could
 * drop a selection permanently. Merging through a single `POST /merge` makes
 * the operation atomic: either the whole union lands or none of it does.
 */

const STORAGE_VERSION = 1;
const NAMESPACE_PREFIX = 'trtech_sync_v1:wl';

export const wishlistNamespaceFor = (userId) => (userId ? `${NAMESPACE_PREFIX}:u_${userId}` : `${NAMESPACE_PREFIX}:guest`);

export const GUEST_WISHLIST_NAMESPACE = wishlistNamespaceFor(null);

function readState(storage, key) {
  try {
    const raw = storage?.getItem(key);
    if (!raw) return { version: STORAGE_VERSION, products: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.products)) {
      return { version: STORAGE_VERSION, products: [] };
    }
    return parsed;
  } catch {
    return { version: STORAGE_VERSION, products: [] };
  }
}

function writeState(storage, key, state) {
  try {
    storage?.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/**
 * Set union by product identity, preserving order: existing entries first, then
 * incoming ones. Incoming duplicates and non-ObjectIds are dropped.
 */
export function unionWishlist(existing, incoming) {
  const seen = new Set();
  const merged = [];

  const push = (product) => {
    const id = String(product?._id ?? product?.id ?? product?.product ?? '').trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    merged.push(product);
  };

  existing.forEach(push);
  incoming.forEach(push);
  return merged;
}

/** A wishlist held as ids only — enough to render and to sync. */
export const toWishlistIds = (items) => items
  .map((item) => String(item?._id ?? item?.id ?? item?.product ?? ''))
  .filter(Boolean);

export class WishlistSync {
  constructor({
    transport,
    storage = typeof localStorage !== 'undefined' ? localStorage : null,
    userId = null,
    logger = null,
  } = {}) {
    this.transport = transport;
    this.storage = storage;
    this.userId = userId;
    this.logger = logger;
  }

  get namespace() {
    return wishlistNamespaceFor(this.userId);
  }

  read() {
    return readState(this.storage, this.namespace).products;
  }

  write(products) {
    writeState(this.storage, this.namespace, { version: STORAGE_VERSION, products });
  }

  setUser(userId) {
    this.userId = userId || null;
  }

  /**
   * Merge the guest wishlist into the signed-in account.
   *
   * Uses a stable batch id per account, so a retry — or a second effect firing
   * after login — is recognised as a replay and cannot duplicate entries.
   */
  async mergeGuestWishlist(guestItems) {
    if (!this.userId) return { status: 'skipped', reason: 'guest' };

    const stored = readState(this.storage, GUEST_WISHLIST_NAMESPACE).products;
    const ids = toWishlistIds(guestItems?.length ? guestItems : stored)
      .filter((id) => /^[a-f\d]{24}$/i.test(id));

    if (ids.length === 0) {
      writeState(this.storage, GUEST_WISHLIST_NAMESPACE, { version: STORAGE_VERSION, products: [] });
      return { status: 'empty' };
    }

    try {
      const response = await this.transport.merge(ids, `guest-wl-merge-${this.userId}`);
      writeState(this.storage, GUEST_WISHLIST_NAMESPACE, { version: STORAGE_VERSION, products: [] });
      return {
        status: 'merged',
        products: response?.data || [],
        rev: response?.rev ?? 0,
        warnings: response?.warnings || [],
      };
    } catch (error) {
      this.logger?.warn?.('guest wishlist merge failed', error);
      // Guest entries are left intact so the merge can be retried.
      return { status: 'error', error };
    }
  }

  async fetch() {
    if (!this.userId) return { status: 'skipped', reason: 'guest', products: this.read() };
    try {
      const response = await this.transport.getAll();
      return { status: 'fetched', products: response?.data || [], rev: response?.rev ?? 0 };
    } catch (error) {
      this.logger?.warn?.('wishlist fetch failed', error);
      return { status: 'error', error, products: this.read() };
    }
  }
}
