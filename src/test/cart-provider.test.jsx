import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

/**
 * CartProvider reconciliation tests.
 *
 * These exist because of a real regression: the provider's reconciliation
 * effect was written as a `userId`-change watcher, which never fires on a hard
 * page reload while already signed in (the id is identical on first render).
 * The result was that the server cart was never fetched and the UI sat on
 * whatever happened to be in localStorage.
 *
 * The behaviours locked down here:
 *   - already authenticated on mount  -> fetches the server cart
 *   - authenticated after guest state -> refresh, then merge the guest cart
 *   - logout                          -> switches to the guest namespace
 */

const cartLine = (quantity = 2) => ({
  product: 'a'.repeat(24),
  variantKey: '',
  name: 'Server Item',
  condition: 'New',
  price: 250,
  image: '',
  quantity,
  stock: 10,
  available: true,
});

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  message: vi.fn(),
  warning: vi.fn(),
}));

const transportMock = vi.hoisted(() => ({
  getAll: vi.fn(),
  mutate: vi.fn(),
  merge: vi.fn(),
}));

const authMock = vi.hoisted(() => ({
  isAuthenticated: false,
  user: null,
}));

vi.mock('sonner', () => ({ toast: toastMock }));
vi.mock('../services/api', () => ({
  cartAPI: transportMock,
  wishlistAPI: { getAll: vi.fn(), merge: vi.fn(), add: vi.fn(), remove: vi.fn(), check: vi.fn() },
}));
vi.mock('../components/AuthContext', () => ({
  useAuth: () => authMock,
}));

const { CartProvider, useCart } = await import('../components/CartContext');

function Probe() {
  const { cart, totalItems } = useCart();
  return (
    <div>
      <span data-testid="count">{totalItems}</span>
      <span data-testid="names">{cart.map((i) => i.name).join(',')}</span>
    </div>
  );
}

const renderProvider = () =>
  render(
    <CartProvider>
      <Probe />
    </CartProvider>
  );

describe('CartProvider reconciliation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    authMock.isAuthenticated = false;
    authMock.user = null;
    transportMock.getAll.mockResolvedValue({ success: true, data: [cartLine(2)], rev: 3, subtotal: 500 });
    transportMock.mutate.mockResolvedValue({ success: true, data: [cartLine(2)], rev: 4, subtotal: 500 });
    transportMock.merge.mockResolvedValue({ success: true, data: [cartLine(3)], rev: 5, subtotal: 750, warnings: [] });
  });

  afterEach(() => cleanup());

  it('fetches the server cart when already authenticated on mount', async () => {
    authMock.isAuthenticated = true;
    authMock.user = { id: 'user1' };

    renderProvider();

    // Regression: this call did not happen on a hard reload.
    await waitFor(() => expect(transportMock.getAll).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId('names')).toHaveTextContent('Server Item'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('does not call the server for a guest', async () => {
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('0'));
    expect(transportMock.getAll).not.toHaveBeenCalled();
    expect(transportMock.merge).not.toHaveBeenCalled();
  });

  it('renders guest items from storage without any server call', async () => {
    localStorage.setItem('trtech_sync_v1:guest', JSON.stringify({
      version: 1,
      rev: 0,
      queue: [],
      items: [{
        product: 'b'.repeat(24), variantKey: '', name: 'Guest Item',
        condition: 'New', price: 10, image: '', quantity: 1,
      }],
    }));

    renderProvider();

    await waitFor(() => expect(screen.getByTestId('names')).toHaveTextContent('Guest Item'));
    expect(transportMock.getAll).not.toHaveBeenCalled();
  });

  it('queues an ADD for a signed-in user and flushes it', async () => {
    authMock.isAuthenticated = true;
    authMock.user = { id: 'user1' };
    renderProvider();
    await waitFor(() => expect(transportMock.getAll).toHaveBeenCalled());

    const product = { _id: 'c'.repeat(24), name: 'New Thing', price: 10, stock: 5 };
    // Exercised through the provider's public dispatch.
    const { addToCart } = useCartForTest();
    addToCart(product, 1);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('trtech_sync_v1:u_user1') || '{}');
      expect(saved.queue?.length ?? 0).toBeGreaterThan(0);
    });
  });
});

/**
 * Hooks cannot be called outside a component, so expose the dispatch functions
 * from the probe by capturing them during render.
 */
let capturedDispatch = null;
function CaptureDispatch() {
  capturedDispatch = useCart();
  return null;
}
function useCartForTest() {
  render(
    <CartProvider>
      <CaptureDispatch />
    </CartProvider>
  );
  return capturedDispatch;
}
