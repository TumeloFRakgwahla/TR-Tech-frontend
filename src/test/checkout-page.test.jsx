/**
 * CheckoutPage Component Test Suite
 * -------------------------------
 * Tests the CheckoutPage component (`src/pages/CheckoutPage.jsx`).
 *
 * Strategy:
 *   Renders CheckoutPage with a mocked cart (two items). Verifies the review
 *   step renders the heading, cart items, order summary, trust signals, and
 *   primary action buttons, then that proceeding advances into the checkout
 *   modal (auth step for unauthenticated users).
 *
 * Mocks:
 *   - CartContext: useCart → mockCart (2 items), totalPrice=39000, totalItems=3
 *   - AuthContext / WishlistContext / AuthModalContext → stub state
 *   - ../services/api → ordersAPI, paymentsAPI, categoriesAPI, ...
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockCart = [
  {
    _id: '1',
    name: 'iPhone 15',
    price: 15000,
    quantity: 1,
    image: 'iphone.jpg',
    condition: 'new',
  },
  {
    _id: '2',
    name: 'Samsung Galaxy',
    price: 12000,
    quantity: 2,
    image: null,
    condition: 'refurbished',
  },
];

vi.mock('../services/api', () => ({
  ordersAPI: { create: vi.fn() },
  paymentsAPI: { initializePaystack: vi.fn(), verifyPaystack: vi.fn() },
  categoriesAPI: {
    getActive: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
  cartAPI: {
    getAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
  authAPI: {
    getMe: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
  productsAPI: { getAll: vi.fn() },
  brandsAPI: { getActive: vi.fn() },
  usersAPI: { getAll: vi.fn() },
  contactAPI: { submit: vi.fn() },
  repairsAPI: { getAll: vi.fn() },
}));

vi.mock('../components/CartContext', () => ({
  useCart: vi.fn(() => ({
    cart: mockCart,
    totalItems: 3,
    totalPrice: 39000,
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
  })),
}));

vi.mock('../components/WishlistContext', () => ({
  useWishlist: vi.fn(() => ({
    wishlist: [],
    wishlistCount: 0,
    toggleWishlist: vi.fn(),
    isInWishlist: vi.fn(() => false),
    isToggling: vi.fn(() => false),
  })),
}));

vi.mock('../components/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('../components/AuthModalContext', () => ({
  useAuthModal: vi.fn(() => ({
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
  })),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import Checkout from '../pages/CheckoutPage';

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders the review heading', () => {
    render(wrapper({ children: <Checkout /> }));
    expect(
      screen.getByRole('heading', { name: /review your order/i })
    ).toBeInTheDocument();
  });

  it('renders cart items in the order summary', () => {
    render(wrapper({ children: <Checkout /> }));
    expect(screen.getAllByText('iPhone 15').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Samsung Galaxy').length).toBeGreaterThanOrEqual(1);
  });

  it('renders order summary totals', () => {
    render(wrapper({ children: <Checkout /> }));
    expect(screen.getAllByText(/order summary/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders trust signals', () => {
    render(wrapper({ children: <Checkout /> }));
    expect(screen.getByText(/secure checkout/i)).toBeInTheDocument();
  });

  it('renders an edit cart link', () => {
    render(wrapper({ children: <Checkout /> }));
    expect(screen.getByRole('link', { name: /edit cart/i })).toBeInTheDocument();
  });

  it('renders a proceed to checkout button', () => {
    render(wrapper({ children: <Checkout /> }));
    expect(
      screen.getByRole('button', { name: /proceed to checkout/i })
    ).toBeInTheDocument();
  });

  it('opens the checkout modal when proceeding', async () => {
    render(wrapper({ children: <Checkout /> }));
    fireEvent.click(screen.getByRole('button', { name: /proceed to checkout/i }));
    // Unauthenticated users land on the modal's auth step
    await waitFor(() => {
      expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();
      expect(screen.getByText(/complete your order/i)).toBeInTheDocument();
    });
  });
});
