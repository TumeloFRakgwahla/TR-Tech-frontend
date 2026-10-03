import { describe, it, expect, vi } from 'vitest';
import {
  CartSyncEngine,
  namespaceFor,
  createBatchId,
  lineKeyOf,
  normaliseItem,
} from '../services/cartSync';

/**
 * Sync-engine tests.
 *
 * These cover the properties the whole client redesign rests on, and they are
 * the regression tests for the original defects:
 *   - a retried flush must not double-apply (the reload-inflation bug)
 *   - a stale revision must requeue, not drop, the user's intent
 *   - guest and per-account state must never share a namespace
 *   - intents enqueued mid-flight must survive
 */

/** In-memory storage double. */
function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _dump: () => Object.fromEntries(map),
  };
}

const line = (product, quantity = 1, variantKey = '') => ({
  product, quantity, variantKey, name: 'P', price: 100, condition: 'New',
});

const makeEngine = (overrides = {}) => new CartSyncEngine({
  transport: {
    mutate: vi.fn().mockResolvedValue({ success: true, data: [], rev: 1, subtotal: 0 }),
    merge: vi.fn().mockResolvedValue({ success: true, data: [], rev: 1 }),
    getAll: vi.fn().mockResolvedValue({ success: true, data: [], rev: 0 }),
  },
  storage: memoryStorage(),
  userId: 'user1',
  channelFactory: null,
  setTimeoutFn: () => null,
  clearTimeoutFn: () => {},
  ...overrides,
});

describe('createBatchId', () => {
  it('produces ids at least 8 characters long', () => {
    // The server rejects anything shorter.
    for (let i = 0; i < 50; i += 1) {
      expect(createBatchId().length).toBeGreaterThanOrEqual(8);
    }
  });

  it('does not collide across many calls', () => {
    const ids = new Set(Array.from({ length: 500 }, () => createBatchId()));
    expect(ids.size).toBe(500);
  });
});

describe('namespaceFor', () => {
  it('separates guests from accounts and accounts from each other', () => {
    expect(namespaceFor(null)).toBe('trtech_sync_v1:guest');
    expect(namespaceFor('u1')).toBe('trtech_sync_v1:u_u1');
    expect(namespaceFor('u1')).not.toBe(namespaceFor('u2'));
  });
});

describe('lineKeyOf / normaliseItem', () => {
  it('treats variants of one product as distinct lines', () => {
    expect(lineKeyOf({ product: 'a', variantKey: 'x' }))
      .not.toBe(lineKeyOf({ product: 'a', variantKey: 'y' }));
  });

  it('normalises product and cart-line shapes to one form', () => {
    expect(normaliseItem({ _id: 'abc', quantity: 2 }).product).toBe('abc');
    expect(normaliseItem({ product: 'abc', quantity: 2 }).product).toBe('abc');
    expect(normaliseItem({ product: 'abc' }).quantity).toBe(1);
  });

  it('preserves category, which checkout sends to the coupon validator', () => {
    // Regression: category was dropped during normalisation, which silently
    // broke category-scoped coupons.
    expect(normaliseItem({ product: 'abc', category: 'Laptops' }).category).toBe('Laptops');
    expect(normaliseItem({ product: 'abc' }).category).toBe('');
  });
});

describe('CartSyncEngine queue', () => {
  it('persists intents to storage before flushing', () => {
    const storage = memoryStorage();
    const engine = makeEngine({ storage });
    engine.enqueue({ type: 'ADD', product: 'a'.repeat(24), quantity: 2 });

    const saved = JSON.parse(storage.getItem('trtech_sync_v1:u_user1'));
    expect(saved.queue).toHaveLength(1);
    expect(saved.queue[0].type).toBe('ADD');
  });

  it('ignores malformed product ids instead of poisoning the queue', () => {
    const engine = makeEngine();
    engine.enqueue({ type: 'ADD', product: 'not-an-id', quantity: 1 });
    expect(engine.state.queue).toHaveLength(0);
  });

  it('survives a reload: a new engine on the same storage still has the queue', () => {
    const storage = memoryStorage();
    const first = makeEngine({ storage });
    first.enqueue({ type: 'ADD', product: 'b'.repeat(24), quantity: 3 });

    // Simulate a reload: fresh engine, same localStorage.
    const second = makeEngine({ storage });
    expect(second.getState().pending).toBe(1);
  });
});

describe('CartSyncEngine flush', () => {
  const productId = 'c'.repeat(24);

  it('does nothing for guests', async () => {
    const transport = { mutate: vi.fn() };
    const engine = makeEngine({ userId: null, transport });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 1 });

    const result = await engine.flush();
    expect(result.status).toBe('skipped');
    expect(transport.mutate).not.toHaveBeenCalled();
  });

  it('applies a batch and clears the queue', async () => {
    const transport = {
      mutate: vi.fn().mockResolvedValue({ data: [line(productId, 2)], rev: 1, subtotal: 200 }),
    };
    const engine = makeEngine({ transport });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 2 });

    const result = await engine.flush();
    expect(result.status).toBe('applied');
    expect(transport.mutate).toHaveBeenCalledTimes(1);
    expect(engine.getState().pending).toBe(0);
    expect(engine.getState().items[0].quantity).toBe(2);
  });

  it('reuses the same batch id across retries', async () => {
    const transport = {
      mutate: vi
        .fn()
        .mockRejectedValueOnce(new Error('network down'))
        .mockResolvedValue({ data: [line(productId, 1)], rev: 1 }),
    };
    const engine = makeEngine({ transport });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 1 });

    await engine.flush();
    const firstId = transport.mutate.mock.calls[0][2];

    await engine.flush();
    const secondId = transport.mutate.mock.calls[1][2];

    // A lost response must not turn into a second application.
    expect(secondId).toBe(firstId);
  });

  it('keeps intents queued when the network fails', async () => {
    const transport = { mutate: vi.fn().mockRejectedValue(new Error('offline')) };
    const engine = makeEngine({ transport });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 1 });

    const result = await engine.flush();
    expect(result.status).toBe('error');
    expect(engine.getState().pending).toBe(1);
  });

  it('keeps intents enqueued during an in-flight flush', async () => {
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    const transport = {
      mutate: vi.fn().mockImplementation(async () => {
        await gate;
        return { data: [line(productId, 1)], rev: 1 };
      }),
    };
    const engine = makeEngine({ transport });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 1 });

    const flushing = engine.flush();
    // Arrives after the batch was captured.
    engine.enqueue({ type: 'ADD', product: 'd'.repeat(24), quantity: 1 });
    release();
    await flushing;

    expect(engine.getState().pending).toBe(1);
  });

  it('adopts the server snapshot rather than trusting local state', async () => {
    const transport = {
      mutate: vi.fn().mockResolvedValue({
        // Server clamped to stock and repriced.
        data: [line(productId, 3)],
        rev: 7,
        subtotal: 300,
      }),
    };
    const engine = makeEngine({ transport });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 99 });

    await engine.flush();
    expect(engine.getState().items[0].quantity).toBe(3);
    expect(engine.getState().rev).toBe(7);
  });
});

describe('CartSyncEngine STALE_REV handling', () => {
  const productId = 'e'.repeat(24);

  const staleError = () => {
    const error = new Error('stale');
    error.status = 409;
    error.code = 'STALE_REV';
    error.payload = { data: [line(productId, 1)], rev: 5, subtotal: 100 };
    return error;
  };

  it('adopts the authoritative cart and keeps the intent', async () => {
    const transport = { mutate: vi.fn().mockRejectedValue(staleError()) };
    const engine = makeEngine({ transport });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 2 });

    const result = await engine.flush();

    expect(result.status).toBe('stale');
    // Adopted the server's revision...
    expect(engine.getState().rev).toBe(5);
    // ...but did NOT throw away what the user asked for.
    expect(engine.getState().pending).toBe(1);
  });

  it('re-applies the same intent against the fresh revision', async () => {
    const transport = {
      mutate: vi
        .fn()
        .mockRejectedValueOnce(staleError())
        .mockResolvedValueOnce({ data: [line(productId, 3)], rev: 6 }),
    };
    const engine = makeEngine({ transport });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 2 });

    await engine.flush();
    const result = await engine.flush();

    expect(result.status).toBe('applied');
    expect(engine.getState().pending).toBe(0);
    expect(transport.mutate.mock.calls[1][1]).toBe(5); // used the fresh rev
  });

  it('gives up after repeated staleness but does not lose the intent', async () => {
    const transport = { mutate: vi.fn().mockRejectedValue(staleError()) };
    const engine = makeEngine({ transport });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 1 });

    let last;
    for (let i = 0; i < 8; i += 1) {
      last = await engine.flush();
    }

    expect(last.status).toBe('stale-abandoned');
    expect(engine.getState().pending).toBe(1);
  });
});

describe('CartSyncEngine guest merge', () => {
  const productId = 'f'.repeat(24);

  it('merges guest lines and clears the guest namespace', async () => {
    const storage = memoryStorage({
      'trtech_sync_v1:guest': JSON.stringify({
        version: 1, rev: 0, queue: [],
        items: [line(productId, 2)],
      }),
    });
    const transport = {
      merge: vi.fn().mockResolvedValue({ data: [line(productId, 2)], rev: 1 }),
    };
    const engine = makeEngine({ storage, transport });

    const result = await engine.mergeGuestCart();

    expect(result.status).toBe('merged');
    expect(transport.merge).toHaveBeenCalledWith(
      [{ product: productId, variantKey: '', quantity: 2 }],
      'guest-merge-user1'
    );
    const guest = JSON.parse(storage.getItem('trtech_sync_v1:guest'));
    expect(guest.items).toHaveLength(0);
  });

  it('uses a stable batch id so a duplicate merge cannot double quantities', async () => {
    const storage = memoryStorage({
      'trtech_sync_v1:guest': JSON.stringify({
        version: 1, rev: 0, queue: [], items: [line(productId, 2)],
      }),
    });
    const transport = {
      merge: vi.fn().mockResolvedValue({ data: [line(productId, 2)], rev: 1 }),
    };
    const engine = makeEngine({ storage, transport });

    await engine.mergeGuestCart();
    // Guest namespace was cleared, so re-readding is a no-op — but even if a
    // stale caller re-supplied the lines, the batch id would be identical.
    await engine.mergeGuestCart([line(productId, 2)]);
    expect(transport.merge.mock.calls[1][1]).toBe('guest-merge-user1');
  });

  it('keeps the guest cart when the merge fails, so it can retry', async () => {
    const storage = memoryStorage({
      'trtech_sync_v1:guest': JSON.stringify({
        version: 1, rev: 0, queue: [], items: [line(productId, 2)],
      }),
    });
    const transport = { merge: vi.fn().mockRejectedValue(new Error('offline')) };
    const engine = makeEngine({ storage, transport });

    const result = await engine.mergeGuestCart();
    expect(result.status).toBe('error');
    const guest = JSON.parse(storage.getItem('trtech_sync_v1:guest'));
    expect(guest.items).toHaveLength(1);
  });

  it('does not merge for a guest', async () => {
    const transport = { merge: vi.fn() };
    const engine = makeEngine({ userId: null, transport });
    const result = await engine.mergeGuestCart();
    expect(result.status).toBe('skipped');
    expect(transport.merge).not.toHaveBeenCalled();
  });
});

describe('CartSyncEngine account isolation', () => {
  const productId = 'a'.repeat(24);

  it('does not carry one account cart into another', async () => {
    const storage = memoryStorage();
    const first = makeEngine({ storage, userId: 'userA' });
    first.enqueue({ type: 'ADD', product: productId, quantity: 1 });

    const second = makeEngine({ storage, userId: 'userB' });
    // A different account starts empty, not with userA's cart.
    expect(second.getState().pending).toBe(0);
    expect(second.getState().items).toHaveLength(0);
  });

  it('restores the previous account cart on switch-back', () => {
    const storage = memoryStorage();
    const engine = makeEngine({ storage, userId: 'userA' });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 1 });

    engine.setUser('userB');
    expect(engine.getState().pending).toBe(0);

    engine.setUser('userA');
    expect(engine.getState().pending).toBe(1);
  });

  it('reads the guest namespace when logging out', () => {
    const storage = memoryStorage();
    const engine = makeEngine({ storage, userId: null });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 1 });

    expect(engine.getState().pending).toBe(0); // guests do not queue
    expect(engine.getState().items).toHaveLength(1);
  });
});

describe('CartSyncEngine local application', () => {
  const productId = 'b'.repeat(24);

  it('adds, increments, sets and removes for a guest without any network call', async () => {
    const transport = { mutate: vi.fn() };
    const engine = makeEngine({ userId: null, transport });

    engine.enqueue({ type: 'ADD', product: productId, quantity: 2 });
    expect(engine.getState().items[0].quantity).toBe(2);

    engine.enqueue({ type: 'ADD', product: productId, quantity: 1 });
    expect(engine.getState().items[0].quantity).toBe(3);

    engine.enqueue({ type: 'SET_QTY', product: productId, quantity: 5 });
    expect(engine.getState().items[0].quantity).toBe(5);

    engine.enqueue({ type: 'REMOVE', product: productId });
    expect(engine.getState().items).toHaveLength(0);

    expect(transport.mutate).not.toHaveBeenCalled();
  });

  it('keeps variants of one product as separate lines', () => {
    const engine = makeEngine({ userId: null });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 1, variantKey: 'black' });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 1, variantKey: 'silver' });

    expect(engine.getState().items).toHaveLength(2);
  });

  it('clears everything', () => {
    const engine = makeEngine({ userId: null });
    engine.enqueue({ type: 'ADD', product: productId, quantity: 1 });
    engine.enqueue({ type: 'CLEAR' });
    expect(engine.getState().items).toHaveLength(0);
  });

  it('carries category through a local ADD', () => {
    const engine = makeEngine({ userId: null });
    engine.enqueue({
      type: 'ADD', product: productId, quantity: 1, category: 'Smartphones',
    });
    expect(engine.getState().items[0].category).toBe('Smartphones');
  });
});

describe('CartSyncEngine subscribers', () => {
  it('notifies subscribers on change', () => {
    const engine = makeEngine({ userId: null });
    const listener = vi.fn();
    const unsubscribe = engine.subscribe(listener);

    engine.enqueue({ type: 'ADD', product: 'a'.repeat(24), quantity: 1 });
    expect(listener).toHaveBeenCalled();

    unsubscribe();
    listener.mockClear();
    engine.enqueue({ type: 'ADD', product: 'b'.repeat(24), quantity: 1 });
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('CartSyncEngine storage robustness', () => {
  it('discards corrupted storage instead of throwing', () => {
    const storage = memoryStorage({ 'trtech_sync_v1:u_user1': '{not json' });
    const engine = makeEngine({ storage });
    expect(engine.getState().items).toHaveLength(0);
    expect(engine.getState().pending).toBe(0);
  });

  it('discards a payload from an older schema version', () => {
    const storage = memoryStorage({
      'trtech_sync_v1:u_user1': JSON.stringify({ version: 0, items: [line('z'.repeat(24))], queue: [] }),
    });
    const engine = makeEngine({ storage });
    expect(engine.getState().items).toHaveLength(0);
  });

  it('keeps working when storage throws', async () => {
    const hostile = {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('denied'); },
      removeItem: () => {},
    };
    const transport = { mutate: vi.fn().mockResolvedValue({ data: [], rev: 1 }) };
    const engine = makeEngine({ storage: hostile, transport });

    engine.enqueue({ type: 'ADD', product: 'a'.repeat(24), quantity: 1 });
    const result = await engine.flush();
    expect(result.status).toBe('applied');
  });
});
