/**
 * HomePage Component Test Suite
 * -----------------------------
 * Tests the HomePage component (`src/pages/HomePage.jsx`) rendering output.
 *
 * Strategy:
 *   All external dependencies are mocked to return empty data, so the tests
 *   focus purely on UI structure and static content — not dynamic data
 *   rendering.
 *
 * Mocks:
 *   - services/api: productsAPI, categoriesAPI, brandsAPI → return empty data
 *   - CartContext: useCart → empty cart with zero items/total
 *   - WishlistContext: useWishlist → empty wishlist
 *   - AuthContext: useAuth → unauthenticated, no user
 *   - AuthModalContext: useAuthModal → stub open/close functions
 *
 * Structure:
 *   - Shared wrapper component using MemoryRouter for routing context
 *   - Tests verify hero section, nav links, product sections, promo banner,
 *     footer, trust signals, CTA buttons, and navigation links
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../services/api', () => ({
  // Mock all API modules so no real network requests are made during tests
  productsAPI: { getAll: vi.fn().mockResolvedValue({ success: true, data: [] }) },
  categoriesAPI: { getActive: vi.fn().mockResolvedValue({ success: true, data: [] }) },
  brandsAPI: { getActive: vi.fn().mockResolvedValue({ success: true, data: [] }) },
}));

// Mock CartContext with an empty cart state
vi.mock('../components/CartContext', () => ({
  useCart: vi.fn().mockReturnValue({
    addToCart: vi.fn(),
    totalItems: 0,
    totalPrice: 0,
    cart: [],
  }),
}));

// Mock WishlistContext with an empty wishlist state
vi.mock('../components/WishlistContext', () => ({
  useWishlist: vi.fn().mockReturnValue({
    wishlist: [],
    wishlistCount: 0,
    toggleWishlist: vi.fn(),
    isInWishlist: vi.fn().mockReturnValue(false),
    isToggling: vi.fn().mockReturnValue(false),
  }),
}));

// Mock AuthContext as unauthenticated
vi.mock('../components/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock AuthModalContext with no-op open/close functions
vi.mock('../components/AuthModalContext', () => ({
  useAuthModal: vi.fn().mockReturnValue({
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
  }),
}));

import Home from '../pages/HomePage';

/**
 * HomePage test suite.
 * Tests that the HomePage renders all expected UI sections and navigation
 * elements with mocked (empty) data.
 */
describe('HomePage', () => {
  beforeEach(() => {
    // Clear mock call history before each test to prevent assertion bleed
    vi.clearAllMocks();
  });

  // Shared wrapper that provides MemoryRouter for components that use routing
  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders hero section with CTAs', () => {
    render(wrapper({ children: <Home /> }));
    // The hero section should contain "Book Repair" call-to-action buttons
    const heroElements = screen.getAllByText(/book repair/i);
    expect(heroElements.length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    render(wrapper({ children: <Home /> }));
    // Verify primary navigation links are present in both header and footer
    const homeLinks = screen.getAllByText('Home');
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Services').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Shop').length).toBeGreaterThan(0);
  });

  it('renders trending products section', () => {
    render(wrapper({ children: <Home /> }));
    // The trending products section heading should be visible
    expect(screen.getByText('Trending Now')).toBeInTheDocument();
  });

  it('renders new arrivals section', () => {
    render(wrapper({ children: <Home /> }));
    // The new arrivals section heading should be visible
    expect(screen.getByText('New Arrivals')).toBeInTheDocument();
  });

  it('renders promo banner', () => {
    render(wrapper({ children: <Home /> }));
    // Promo banner text includes the free delivery threshold (R500)
    expect(screen.getByText(/free delivery on orders over r500/i)).toBeInTheDocument();
  });

  it('renders footer with copyright', () => {
    render(wrapper({ children: <Home /> }));
    // Footer should display the company name and copyright
    expect(screen.getByText(/tr-tech repairs & designs/i)).toBeInTheDocument();
  });

  it('renders trust signals section', () => {
    render(wrapper({ children: <Home /> }));
    // Trust signal: warranty is included on all products
    expect(screen.getByText(/warranty included/i)).toBeInTheDocument();
  });

  it('renders "See All" links that navigate to shop', () => {
    render(wrapper({ children: <Home /> }));
    // "See All" links appear in product section headers, linking to the shop page
    const seeAllLinks = screen.getAllByText(/see all/i);
    expect(seeAllLinks.length).toBeGreaterThan(0);
  });

  it('renders Book Repair button in navbar', () => {
    render(wrapper({ children: <Home /> }));
    // Navbar Book Repair button opens the service booking flow
    const bookRepairButtons = screen.getAllByText(/book repair/i);
    expect(bookRepairButtons.length).toBeGreaterThan(0);
  });

  it('renders Shop Now button in promo banner', () => {
    render(wrapper({ children: <Home /> }));
    // Promo banner has a primary CTA button linking to the shop
    const shopNowButtons = screen.getAllByText(/shop now/i);
    expect(shopNowButtons.length).toBeGreaterThan(0);
  });
});
