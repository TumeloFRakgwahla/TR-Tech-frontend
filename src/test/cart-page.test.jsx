/**
 * CartPage Component Test Suite
 * ------------------------------
 * Tests the CartPage component (`src/pages/CartPage.jsx`) rendering and
 * display logic.
 *
 * Strategy:
 *   Mocks CartContext to return a predefined cart with two items (one with
 *   an image, one without), and mocks all other contexts as empty/unauthenticated.
 *   Tests verify the cart UI renders items, quantities, subtotals, totals,
 *   and all action buttons (quantity controls, remove, clear, checkout).
 *
 * Mocks:
 *   - CartContext: useCart → returns mockCart with 2 items, totalItems=3, totalPrice=39000
 *   - WishlistContext, AuthContext, AuthModalContext → stub state
 *
 * Structure:
 *   - Shared wrapper with MemoryRouter
 *   - Tests for heading, cart items, item count, total price, quantity controls,
 *     remove buttons, clear cart, checkout button, product links, per-item
 *     quantity, and per-item subtotals
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock cart data: two items with different quantities and one with no image
const mockCart = [
  { _id: '1', name: 'iPhone 15', price: 15000, quantity: 1, image: 'iphone.jpg' },
  { _id: '2', name: 'Samsung Galaxy', price: 12000, quantity: 2, image: null },
];

// Mock CartContext with the predefined mockCart
vi.mock('../components/CartContext', () => ({
  useCart: vi.fn(() => ({
    cart: mockCart,
    totalItems: 3,          // 1 (iPhone) + 2 (Galaxy) = 3 total items
    totalPrice: 39000,      // 15000 + (12000 * 2) = 39000
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
  })),
}));

// Mock WishlistContext with empty wishlist
vi.mock('../components/WishlistContext', () => ({
  useWishlist: vi.fn(() => ({
    wishlist: [],
    wishlistCount: 0,
    toggleWishlist: vi.fn(),
    isInWishlist: vi.fn(() => false),
    isToggling: vi.fn(() => false),
  })),
}));

// Mock AuthContext as unauthenticated
vi.mock('../components/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));

// Mock AuthModalContext with no-op functions
vi.mock('../components/AuthModalContext', () => ({
  useAuthModal: vi.fn(() => ({
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
  })),
}));

import Cart from '../pages/CartPage';

/**
 * CartPage test suite.
 * Tests rendering of cart items, totals, controls, and action buttons.
 */
describe('CartPage', () => {
  beforeEach(() => {
    // Clear mock call history before each test
    vi.clearAllMocks();
  });

  // Shared wrapper providing MemoryRouter for routing
  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders cart heading', () => {
    render(wrapper({ children: <Cart /> }));
    // Main page heading for the cart page
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });

  it('renders cart items', () => {
    render(wrapper({ children: <Cart /> }));
    // Both mock cart items should be displayed by name
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument();
  });

  it('renders item count', () => {
    render(wrapper({ children: <Cart /> }));
    // The total items count (3) should be displayed somewhere in the UI
    expect(screen.getByText(/3 item/i)).toBeInTheDocument();
  });

  it('renders total price', () => {
    render(wrapper({ children: <Cart /> }));
    // Check for price elements containing the ZAR currency symbol (R) followed by digits
    const priceElements = screen.getAllByText(/R\s*\d/);
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it('renders quantity controls', () => {
    render(wrapper({ children: <Cart /> }));
    // Each cart item has +/- buttons for adjusting quantity
    const minusButtons = screen.getAllByLabelText(/decrease quantity/i);
    const plusButtons = screen.getAllByLabelText(/increase quantity/i);
    expect(minusButtons.length).toBeGreaterThan(0);
    expect(plusButtons.length).toBeGreaterThan(0);
  });

  it('renders remove buttons', () => {
    render(wrapper({ children: <Cart /> }));
    // Each cart item has a remove (delete) button
    const removeButtons = screen.getAllByLabelText(/remove item/i);
    expect(removeButtons.length).toBeGreaterThan(0);
  });

  it('renders Clear Cart button', () => {
    render(wrapper({ children: <Cart /> }));
    // Button to remove all items from the cart at once
    expect(screen.getByText(/clear cart/i)).toBeInTheDocument();
  });

  it('renders Proceed to Checkout button', () => {
    render(wrapper({ children: <Cart /> }));
    // Primary CTA to proceed to the checkout flow
    expect(screen.getByText(/proceed to checkout/i)).toBeInTheDocument();
  });

  it('renders product links in cart items', () => {
    render(wrapper({ children: <Cart /> }));
    // Item names are links to their respective product detail pages
    const productLinks = screen.getAllByRole('link', { name: /iphone 15/i });
    expect(productLinks.length).toBeGreaterThan(0);
  });

  it('renders per-item quantity', () => {
    render(wrapper({ children: <Cart /> }));
    // The quantity value for each item should be displayed (1 and 2 respectively)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders per-item subtotal', () => {
    render(wrapper({ children: <Cart /> }));
    // Subtotal for iPhone: 15000 * 1 = R15,000 — check for "R15" prefix
    const subtotals = screen.getAllByText(/R\s*15/);
    expect(subtotals.length).toBeGreaterThan(0);
  });
});
