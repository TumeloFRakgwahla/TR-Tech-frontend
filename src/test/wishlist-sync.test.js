import { describe, it, expect, vi } from 'vitest';
import {
  WishlistSync,
  wishlistNamespaceFor,
  unionWishlist,
  toWishlistIds,
  GUEST_WISHLIST_NAMESPACE,
} from '../services/wishlistSync';

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _dump: () => Object.fromEntries(map),
  };
}

const objId = (c) => c.repeat(24);

describe('wishlist namespaces', () => {
  it('isolates guests from accounts and accounts from each other', () => {
    expect(wishlistNamespaceFor(null)).toBe(GUEST_WISHLIST_NAMESPACE);
    expect(wishlistNamespaceFor('a')).not.toBe(wishlistNamespaceFor('b'));
    expect(wishlistNamespaceFor('a')).not.toBe(GUEST_WISHLIST_NAMESPACE);
  });
});

describe('unionWishlist', () => {
  it('unions by product identity without duplicates', () => {
    const a = { _id: objId('a') };
    const b = { _id: objId('b') };
    const result = unionWishlist([a], [b, a]);
    expect(result).toHaveLength(2);
  });

  it('preserves existing order, then appends new entries', () => {
    const a = { _id: objId('a') };
    const b = { _id: objId('b') };
    const result = unionWishlist([a], [b]);
    expect(result[0]).toBe(a);
    expect(result[1]).toBe(b);
  });

  it('is idempotent', () => {
    const items = [{ _id: objId('a') }, { _id: objId('b') }];
    expect(unionWishlist(items, items)).toHaveLength(2);
    expect(unionWishlist(items, [])).toHaveLength(2);
  });

  it('drops entries with no usable id', () => {
    const result = unionWishlist([], [{ name: 'no id' }, { _id: objId('c') }]);
    expect(result).toHaveLength(1);
  });

  it('accepts both _id and id shapes', () => {
    const result = unionWishlist([], [{ _id: objId('a') }, { id: objId('a') }]);
    expect(result).toHaveLength(1);
  });
});

describe('toWishlistIds', () => {
  it('extracts ids and drops unusable entries', () => {
    expect(toWishlistIds([{ _id: objId('a') }, { id: objId('b') }, {}])).toEqual([
      objId('a'), objId('b'),
    ]);
  });
});

describe('WishlistSync storage', () => {
  it('round-trips through storage', () => {
    const storage = memoryStorage();
    const sync = new WishlistSync({ transport: {}, storage, userId: 'u1' });
    sync.write([{ _id: objId('a') }]);
    expect(sync.read()).toHaveLength(1);
  });

  it('discards corrupted storage instead of throwing', () => {
    const storage = memoryStorage({ [wishlistNamespaceFor('u1')]: '{oops' });
    const sync = new WishlistSync({ transport: {}, storage, userId: 'u1' });
    expect(sync.read()).toHaveLength(0);
  });

  it('keeps one account out of another account namespace', () => {
    const storage = memoryStorage();
    const first = new WishlistSync({ transport: {}, storage, userId: 'userA' });
    first.write([{ _id: objId('a') }]);

    const second = new WishlistSync({ transport: {}, storage, userId: 'userB' });
    expect(second.read()).toHaveLength(0);
  });
});

describe('WishlistSync guest merge', () => {
  it('merges the guest wishlist and clears the guest namespace', async () => {
    const guestProducts = [{ _id: objId('a') }, { _id: objId('b') }];
    const storage = memoryStorage({
      [GUEST_WISHLIST_NAMESPACE]: JSON.stringify({ version: 1, products: guestProducts }),
    });
    const transport = {
      merge: vi.fn().mockResolvedValue({ data: guestProducts, rev: 1, warnings: [] }),
    };
    const sync = new WishlistSync({ transport, storage, userId: 'u1' });

    const result = await sync.mergeGuestWishlist();

    expect(result.status).toBe('merged');
    expect(transport.merge).toHaveBeenCalledWith(
      [objId('a'), objId('b')],
      'guest-wl-merge-u1'
    );
    const guest = JSON.parse(storage.getItem(GUEST_WISHLIST_NAMESPACE));
    expect(guest.products).toHaveLength(0);
  });

  it('uses a stable batch id so a duplicate merge is a no-op', async () => {
    const products = [{ _id: objId('a') }];
    const storage = memoryStorage({
      [GUEST_WISHLIST_NAMESPACE]: JSON.stringify({ version: 1, products }),
    });
    const transport = { merge: vi.fn().mockResolvedValue({ data: products, rev: 1 }) };
    const sync = new WishlistSync({ transport, storage, userId: 'u1' });

    await sync.mergeGuestWishlist();
    await sync.mergeGuestWishlist(products);

    expect(transport.merge.mock.calls[1][1]).toBe('guest-wl-merge-u1');
  });

  it('keeps the guest wishlist when the merge fails', async () => {
    const products = [{ _id: objId('a') }];
    const storage = memoryStorage({
      [GUEST_WISHLIST_NAMESPACE]: JSON.stringify({ version: 1, products }),
    });
    const transport = { merge: vi.fn().mockRejectedValue(new Error('offline')) };
    const sync = new WishlistSync({ transport, storage, userId: 'u1' });

    const result = await sync.mergeGuestWishlist();
    expect(result.status).toBe('error');
    const guest = JSON.parse(storage.getItem(GUEST_WISHLIST_NAMESPACE));
    expect(guest.products).toHaveLength(1);
  });

  it('never merges for a guest', async () => {
    const transport = { merge: vi.fn() };
    const sync = new WishlistSync({ transport, storage: memoryStorage(), userId: null });
    const result = await sync.mergeGuestWishlist([{ _id: objId('a') }]);
    expect(result.status).toBe('skipped');
    expect(transport.merge).not.toHaveBeenCalled();
  });

  it('does not send malformed ids to the server', async () => {
    const storage = memoryStorage({
      [GUEST_WISHLIST_NAMESPACE]: JSON.stringify({
        version: 1, products: [{ _id: 'nope' }, { _id: objId('a') }],
      }),
    });
    const transport = { merge: vi.fn().mockResolvedValue({ data: [], rev: 1 }) };
    const sync = new WishlistSync({ transport, storage, userId: 'u1' });

    await sync.mergeGuestWishlist();
    expect(transport.merge.mock.calls[0][0]).toEqual([objId('a')]);
  });

  it('reports server warnings for products that could not be carried over', async () => {
    const products = [{ _id: objId('a') }];
    const storage = memoryStorage({
      [GUEST_WISHLIST_NAMESPACE]: JSON.stringify({ version: 1, products }),
    });
    const transport = {
      merge: vi.fn().mockResolvedValue({
        data: [], rev: 1,
        warnings: [{ product: objId('a'), reason: 'PRODUCT_UNAVAILABLE' }],
      }),
    };
    const sync = new WishlistSync({ transport, storage, userId: 'u1' });

    const result = await sync.mergeGuestWishlist();
    expect(result.warnings).toHaveLength(1);
  });
});

describe('WishlistSync fetch', () => {
  it('does not call the server for a guest', async () => {
    const transport = { getAll: vi.fn() };
    const sync = new WishlistSync({ transport, storage: memoryStorage(), userId: null });
    const result = await sync.fetch();
    expect(result.status).toBe('skipped');
    expect(transport.getAll).not.toHaveBeenCalled();
  });

  it('falls back to local state when the fetch fails', async () => {
    const storage = memoryStorage({
      [wishlistNamespaceFor('u1')]: JSON.stringify({ version: 1, products: [{ _id: objId('a') }] }),
    });
    const transport = { getAll: vi.fn().mockRejectedValue(new Error('offline')) };
    const sync = new WishlistSync({ transport, storage, userId: 'u1' });

    const result = await sync.fetch();
    expect(result.status).toBe('error');
    expect(result.products).toHaveLength(1);
  });
});
