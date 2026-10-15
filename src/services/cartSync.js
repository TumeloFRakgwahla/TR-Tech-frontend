/**
 * Cart sync engine.
 *
 * Replaces the previous "diff against a last-synced snapshot and fire a request
 * per item" approach, which inflated cart quantities on every page load and
 * silently lost writes across tabs.
 *
 * Model
 * -----
 * The server is authoritative. The client never computes a price and never
 * uploads a snapshot — it sends *intents* and renders whatever the server
 * returns. Three properties follow from that:
 *
 *   1. DURABLE QUEUE — intents are appended to localStorage before any network
 *      call, so a tab closed mid-flight loses nothing on reload.
 *   2. IDEMPOTENCY — every flush carries a `clientBatchId`. If a response is
 *      lost and the batch is retried, the server recognises the batch and
 *      returns the current state instead of applying it twice. This is what
 *      makes retry-on-timeout safe.
 *   3. OPTIMISTIC CONCURRENCY — a flush carries `baseRev`. A stale writer gets
 *      409 STALE_REV plus the authoritative cart; the engine adopts that cart,
 *      keeps its intents, and retries against the fresh revision.
 *
 * Cross-tab: all tabs share one localStorage namespace, so the queue is already
 * shared. A short-lived leader lock keeps tabs from flushing simultaneously.
 * Correctness does not depend on the lock — duplicate flushes are absorbed by
 * the server's batch ledger — the lock is only an optimisation.
 *
 * Everything the engine touches (transport, storage, timers, ids) is injectable
 * so it can be unit-tested without a browser or a network.
 */

const SYNC_VERSION = 1;
export const GUEST_NAMESPACE = 'trtech_sync_v1:guest';
const CHANNEL_NAME = 'trtech_sync_v1';
const LEADER_KEY = 'trtech_sync_v1:leader';
const LEADER_LOCK_MS = 3000;
const FLUSH_DEBOUNCE_MS = 500;
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;
const MAX_STALE_RETRIES = 6;

/** Per-user storage namespace, so two accounts never share a cart. */
export const namespaceFor = (userId) => (userId ? `trtech_sync_v1:u_${userId}` : GUEST_NAMESPACE);

/**
 * Batch id for one logical flush. Reused verbatim when retrying the same batch
 * so the server can recognise the replay.
 */
export function createBatchId(random = Math.random) {
  const randomPart = Math.floor(random() * 0xffffffff).toString(36);
  const timePart = Date.now().toString(36);
  return `b_${timePart}_${randomPart}${randomPart.length < 6 ? '0'.repeat(6 - randomPart.length) : ''}`;
}

const isObjectId = (id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);

/** Stable line identity: product plus variant. */
export const lineKeyOf = (item) => `${item?.product || item?.id || ''}:${item?.variantKey || ''}`;

/**
 * Normalise a product (local) or cart line (server) into one shape.
 * Local products arrive as `{ _id }` or `{ id }`; server lines as `{ product }`.
 */
export function normaliseItem(raw) {
  const productId = String(raw?.product ?? raw?.id ?? raw?._id ?? '');
  return {
    product: productId,
    variantKey: raw?.variantKey || '',
    name: raw?.name || '',
    condition: raw?.condition || '',
    // Kept because checkout sends cart categories to the coupon validator.
    category: raw?.category || '',
    price: Number(raw?.price) || 0,
    image: raw?.image || '',
    quantity: Math.max(1, parseInt(raw?.quantity, 10) || 1),
    stock: raw?.stock ?? null,
    available: raw?.available ?? true,
  };
}

const readStorage = (storage, key, fallback) => {
  try {
    const raw = storage?.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== SYNC_VERSION) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
};

const writeStorage = (storage, key, value) => {
  try {
    storage?.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Storage full or blocked (private mode). The queue is then memory-only,
    // which degrades durability but must never break the UI.
    return false;
  }
};

const emptyState = () => ({ version: SYNC_VERSION, rev: 0, items: [], queue: [] });

export class CartSyncEngine {
  constructor({
    transport,
    storage = typeof localStorage !== 'undefined' ? localStorage : null,
    userId = null,
    setTimeoutFn = setTimeout,
    clearTimeoutFn = clearTimeout,
    channelFactory = typeof BroadcastChannel !== 'undefined'
      ? (name) => new BroadcastChannel(name)
      : null,
    random = Math.random,
    logger = null,
  } = {}) {
    this.transport = transport;
    this.storage = storage;
    this.userId = userId;
    this.setTimeoutFn = setTimeoutFn;
    this.clearTimeoutFn = clearTimeoutFn;
    this.random = random;
    this.logger = logger;
    // Per-instance, not on the prototype: every tab must get a distinct owner
    // id or the leader lock would consider two tabs to be the same owner.
    this.instanceId = `e_${createBatchId(random)}`;
    this.pendingBatchId = null;

    this.listeners = new Set();
    this.state = readStorage(storage, namespaceFor(userId), emptyState());
    this.flushTimer = null;
    this.flushInFlight = false;
    this.staleRetries = 0;
    this.flushPromise = null;

    this.channel = null;
    if (channelFactory) {
      try {
        this.channel = channelFactory(CHANNEL_NAME);
        this.channel.onmessage = (event) => this.onRemoteMessage(event?.data);
      } catch {
        // Channel unavailable — cross-tab sync degrades to storage-only.
        this.channel = null;
      }
    }
  }

  // ---------------------------------------------------------------- storage

  get namespace() {
    return namespaceFor(this.userId);
  }

  persist() {
    writeStorage(this.storage, this.namespace, this.state);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState() {
    return {
      items: this.state.items,
      rev: this.state.rev,
      pending: this.state.queue.length,
      guest: !this.userId,
      // Server-computed. Null for guests and before the first server response;
      // callers fall back to summing the (server-owned) item prices.
      subtotal: typeof this.state.subtotal === 'number' ? this.state.subtotal : null,
    };
  }

  emit() {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  /**
   * Adopt server state. This is the only way items or rev change, which is what
   * keeps the client from drifting away from the server's truth.
   */
  adopt({ items, rev, subtotal }) {
    if (Array.isArray(items)) {
      this.state.items = items.map(normaliseItem);
    }
    if (Number.isInteger(rev)) {
      this.state.rev = rev;
    }
    if (typeof subtotal === 'number') {
      this.state.subtotal = subtotal;
    } else {
      // Never keep a subtotal that belongs to a superseded set of items.
      this.state.subtotal = null;
    }
    this.persist();
    this.emit();
  }

  /** Switch namespaces, e.g. guest -> signed-in account or logout. */
  setUser(userId) {
    const next = userId || null;
    if (next === this.userId) return;
    this.cancelScheduledFlush();
    this.userId = next;
    this.state = readStorage(this.storage, this.namespace, emptyState());
    this.staleRetries = 0;
    this.persist();
    this.emit();
  }

  // ------------------------------------------------------------ local edits

  /**
   * Apply an intent.
   *
   * Guests update local state only (there is nowhere to sync to); signed-in
   * users enqueue and flush. Either way the UI updates immediately.
   */
  enqueue(op) {
    if (!op || !op.type) return;
    const product = String(op.product ?? '');
    if (op.type !== 'CLEAR' && !isObjectId(product)) return;

    if (!this.userId) {
      this.applyLocal(op);
      return;
    }

    this.state.queue.push({ ...op, id: createBatchId(this.random) });
    this.persist();
    this.emit();
    this.scheduleFlush();
  }

  /** Optimistic local application, used for guests and for immediate feedback. */
  applyLocal(op) {
    const items = [...this.state.items];
    const key = lineKeyOf({ product: op.product, variantKey: op.variantKey });

    if (op.type === 'CLEAR') {
      this.state.items = [];
    } else if (op.type === 'REMOVE') {
      this.state.items = items.filter((item) => lineKeyOf(item) !== key);
    } else if (op.type === 'ADD' || op.type === 'SET_QTY') {
      const index = items.findIndex((item) => lineKeyOf(item) === key);
      const requested = parseInt(op.quantity, 10) || 1;

      if (index === -1) {
        if (op.type === 'ADD' && isObjectId(op.product)) {
          items.push(normaliseItem({ ...op, quantity: requested }));
        }
      } else {
        const current = items[index];
        const next = op.type === 'ADD'
          ? current.quantity + requested
          : Math.max(1, requested);
        items[index] = { ...current, quantity: next };
      }
      this.state.items = items;
    }

    this.persist();
    this.emit();
  }

  // ------------------------------------------------------------------ flush

  scheduleFlush(delay = FLUSH_DEBOUNCE_MS) {
    this.cancelScheduledFlush();
    this.flushTimer = this.setTimeoutFn(() => {
      this.flushTimer = null;
      void this.flush();
    }, delay);
  }

  cancelScheduledFlush() {
    if (this.flushTimer) {
      this.clearTimeoutFn(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Claim the cross-tab leader lock. Best-effort: if another tab holds a fresh
   * lock we skip this flush, because that tab owns the shared queue.
   */
  claimLeadership() {
    if (!this.storage) return true;
    const now = Date.now();
    try {
      const held = JSON.parse(this.storage.getItem(LEADER_KEY) || 'null');
      if (held && held.until > now && held.owner !== this.instanceId) {
        return false;
      }
      this.storage.setItem(LEADER_KEY, JSON.stringify({
        owner: this.instanceId,
        until: now + LEADER_LOCK_MS,
      }));
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Send every queued intent as one batch.
   *
   * Returns a descriptor of what happened so callers (and tests) can assert on
   * it without reaching into internals.
   */
  async flush() {
    if (!this.userId) return { status: 'skipped', reason: 'guest' };
    if (this.flushInFlight) return { status: 'skipped', reason: 'in-flight' };
    if (this.state.queue.length === 0) return { status: 'empty' };
    if (!this.claimLeadership()) return { status: 'skipped', reason: 'not-leader' };

    const batch = this.state.queue.map(({ id: _opId, ...op }) => op);
    // One stable id per logical flush, reused across retries so a lost response
    // cannot cause the batch to be applied twice. It is deliberately NOT one of
    // the op ids: the batch is the whole queue, not a single operation.
    const batchId = this.pendingBatchId || (this.pendingBatchId = createBatchId(this.random));
    const sentIds = new Set(this.state.queue.map((op) => op.id));

    this.flushInFlight = true;
    try {
      const response = await this.transport.mutate(batch, this.state.rev, batchId);

      // Drop exactly the ops that were sent. Anything enqueued while the
      // request was in flight keeps its own id and stays queued.
      this.state.queue = this.state.queue.filter((op) => !sentIds.has(op.id));
      this.pendingBatchId = null;
      this.staleRetries = 0;

      this.adopt({
        items: response?.data,
        rev: response?.rev,
        subtotal: response?.subtotal,
      });
      this.broadcast({ type: 'flushed', namespace: this.namespace, rev: this.state.rev });
      return { status: 'applied', rev: this.state.rev };
    } catch (error) {
      if (error?.code === 'STALE_REV' && error.status === 409) {
        return this.handleStale(error);
      }
      // Network/server failure: keep the intents and retry with backoff.
      this.logger?.warn?.('cart sync flush failed', error);
      this.scheduleFlush(this.backoffDelay());
      return { status: 'error', error };
    } finally {
      this.flushInFlight = false;
    }
  }

  /**
   * Adopt the authoritative cart from a 409 and retry against its revision.
   * The intents are deliberately NOT dropped — the user still meant to make
   * this change, it just has to be re-applied on top of current state.
   */
  handleStale(error) {
    const payload = error.payload || {};
    this.adopt({ items: payload.data, rev: payload.rev, subtotal: payload.subtotal });

    this.staleRetries += 1;
    if (this.staleRetries > MAX_STALE_RETRIES) {
      // Something else is actively fighting us. Give up on this pass but keep
      // the queue, so the next user action or reload retries cleanly.
      this.logger?.warn?.('cart sync gave up after repeated STALE_REV');
      return { status: 'stale-abandoned', rev: this.state.rev };
    }

    // Keep the same batch id: the ops have not been applied, so the retry must
    // be recognised as the same logical flush rather than a new one.
    this.scheduleFlush(BASE_BACKOFF_MS);
    return { status: 'stale', rev: this.state.rev };
  }

  backoffDelay() {
    const delay = Math.min(BASE_BACKOFF_MS * 2 ** this.staleRetries, MAX_BACKOFF_MS);
    return delay;
  }

  // ------------------------------------------------------------------ merge

  /**
   * Merge the guest cart into the signed-in account.
   *
   * Runs once at the auth boundary. Uses a stable batch id so that a retry —
   * or a duplicate call from a second effect — cannot double the quantities.
   */
  async mergeGuestCart(guestItems, guestNamespace = GUEST_NAMESPACE) {
    if (!this.userId) return { status: 'skipped', reason: 'guest' };

    const stored = readStorage(this.storage, guestNamespace, emptyState());
    const lines = (guestItems && guestItems.length ? guestItems : stored.items || [])
      .filter((item) => isObjectId(String(item?.product ?? item?.id ?? '')))
      .map((item) => ({
        product: String(item.product ?? item.id),
        variantKey: item.variantKey || '',
        quantity: parseInt(item.quantity, 10) || 1,
      }));

    if (lines.length === 0) {
      writeStorage(this.storage, guestNamespace, emptyState());
      return { status: 'empty' };
    }

    const batchId = `guest-merge-${this.userId}`;
    try {
      const response = await this.transport.merge(lines, batchId);
      this.adopt({ items: response?.data, rev: response?.rev, subtotal: response?.subtotal });

      // The guest cart has been absorbed; clear it so a later logout or a
      // second login cannot merge it again.
      writeStorage(this.storage, guestNamespace, emptyState());
      this.broadcast({ type: 'merged', namespace: this.namespace, rev: this.state.rev });
      return { status: 'merged', warnings: response?.warnings || [] };
    } catch (error) {
      this.logger?.warn?.('guest cart merge failed', error);
      // Leave the guest cart intact so the next attempt can retry it.
      return { status: 'error', error };
    }
  }

  /** Pull authoritative state (used on mount, focus, and after a 401). */
  async refresh() {
    if (!this.userId) return { status: 'skipped', reason: 'guest' };
    try {
      const response = await this.transport.getAll();
      this.adopt({ items: response?.data, rev: response?.rev, subtotal: response?.subtotal });
      return { status: 'refreshed', rev: this.state.rev };
    } catch (error) {
      this.logger?.warn?.('cart refresh failed', error);
      return { status: 'error', error };
    }
  }

  /**
   * Flush synchronously-ish before logout, so a guest cart is not lost when the
   * user signs out. Bounded so a hung request cannot block the UI.
   */
  async flushBeforeExit(timeoutMs = 2500) {
    if (this.state.queue.length === 0) return { status: 'empty' };
    let timerId = null;
    const timeout = new Promise((resolve) => {
      timerId = this.setTimeoutFn(() => resolve({ status: 'timeout' }), timeoutMs);
    });
    const result = await Promise.race([this.flush(), timeout]);
    if (timerId) this.clearTimeoutFn(timerId);
    return result;
  }

  // -------------------------------------------------------------- cross-tab

  broadcast(message) {
    try {
      this.channel?.postMessage(message);
    } catch {
      // Channel closed; state is still correct locally.
    }
  }

  onRemoteMessage(message) {
    if (!message || message.namespace !== this.namespace) return;
    if (message.type === 'flushed' || message.type === 'merged') {
      // Another tab already applied our shared queue. Re-read it rather than
      // replaying, then adopt the newer revision.
      this.state = readStorage(this.storage, this.namespace, emptyState());
      if (Number.isInteger(message.rev)) {
        this.state.rev = message.rev;
      }
      this.staleRetries = 0;
      this.emit();
      void this.refresh();
    }
  }

  destroy() {
    this.cancelScheduledFlush();
    this.listeners.clear();
    try {
      this.channel?.close();
    } catch {
      // Already closed.
    }
  }
}

CartSyncEngine.prototype.instanceId = undefined;

export const __testing = {
  SYNC_VERSION,
  GUEST_NAMESPACE,
  LEADER_KEY,
  emptyState,
  readStorage,
  writeStorage,
  isObjectId,
};
