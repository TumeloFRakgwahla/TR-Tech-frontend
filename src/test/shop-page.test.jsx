/**
 * ShopPage Component Test Suite
 * ------------------------------
 * Tests the ShopPage component (`src/pages/ShopPage.jsx`) rendering and
 * filtering functionality.
 *
 * Strategy:
 *   Mocks the API to return a predefined set of mock products, categories,
 *   and brands. Tests then verify that the page renders correctly, loading
 *   states work, product filtering (by search and category) functions as
 *   expected, and out-of-stock items are flagged.
 *
 * Mocks:
 *   - services/api: productsAPI.getAll → returns mockProducts array
 *   - services/api: categoriesAPI/brandsAPI.getActive → return mock lists
 *   - CartContext, WishlistContext, AuthContext, AuthModalContext → empty/unauthenticated
 *
 * Structure:
 *   - Shared wrapper with MemoryRouter
 *   - Tests for initial loading, product rendering, search input, sort
 *     dropdown, filter sidebar, search filtering, add-to-cart buttons,
 *     out-of-stock labels, prices, category filters, clear filters, empty state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Predefined mock product data used across multiple tests — includes
// products in different categories/brands and varying stock statuses
const mockProducts = [
  { _id: '1', name: 'iPhone 15', price: 15000, category: 'Smartphones', brand: 'Apple', stock: 5, status: 'Active' },
  { _id: '2', name: 'Samsung Galaxy', price: 12000, category: 'Smartphones', brand: 'Samsung', stock: 3, status: 'Active' },
  { _id: '3', name: 'MacBook Pro', price: 25000, category: 'Laptops', brand: 'Apple', stock: 0, status: 'Out of Stock' },
];

// Mock API: productsAPI returns mockProducts; categories/brands return fixture lists
vi.mock('../services/api', () => ({
  productsAPI: { getAll: vi.fn(() => Promise.resolve({ success: true, data: mockProducts })) },
  categoriesAPI: { getActive: vi.fn(() => Promise.resolve({ success: true, data: [{ name: 'Smartphones' }, { name: 'Laptops' }] })) },
  brandsAPI: { getActive: vi.fn(() => Promise.resolve({ success: true, data: [{ name: 'Apple' }, { name: 'Samsung' }] })) },
}));

// Mock CartContext with empty cart
vi.mock('../components/CartContext', () => ({
  useCart: vi.fn(() => ({
    addToCart: vi.fn(),
    totalItems: 0,
    totalPrice: 0,
    cart: [],
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

import Shop from '../pages/ShopPage';

/**
 * ShopPage test suite.
 * Tests loading states, product rendering, filtering, and edge cases.
 */
describe('ShopPage', () => {
  beforeEach(() => {
    // Clear mock call history before each test
    vi.clearAllMocks();
  });

  // Shared wrapper providing MemoryRouter for routing-dependent components
  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders loading skeleton initially', async () => {
    render(wrapper({ children: <Shop /> }));
    // Before async data loads, a loading spinner (role="status") is shown
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders products after loading', async () => {
    render(wrapper({ children: <Shop /> }));
    // waitFor polls until the async product data resolves
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });
    // Once loaded, all mock products should be visible
    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument();
  });

  it('renders search input', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      // Search input has a placeholder with the text "search for products"
      expect(screen.getByPlaceholderText(/search for products/i)).toBeInTheDocument();
    });
  });

  it('renders sort dropdown', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      // Sort dropdown is labeled "sort by"
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    });
  });

  it('renders filter sidebar on desktop', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      // Filter sidebar header text "Filters" appears (may appear multiple times)
      const filtersElements = screen.getAllByText(/filters/i);
      expect(filtersElements.length).toBeGreaterThan(0);
    });
  });

  it('filters products by search query', async () => {
    render(wrapper({ children: <Shop /> }));
    // Wait for initial product load
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText(/search for products/i);
    // Type "iPhone" — should filter out Samsung Galaxy which doesn't match
    fireEvent.change(searchInput, { target: { value: 'iPhone' } });
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      expect(screen.queryByText('Samsung Galaxy')).not.toBeInTheDocument();
    });
  });

  it('renders "Add to Cart" buttons for products', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      // Each product should have an "Add to Cart" button
      const addButtons = screen.getAllByText(/add to cart/i);
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  it('renders out of stock label for out-of-stock products', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      // MacBook Pro (stock: 0) should display an "Out of Stock" label
      const outOfStockElements = screen.getAllByText('Out of Stock');
      expect(outOfStockElements.length).toBeGreaterThan(0);
    });
  });

  it('renders product prices', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      // Prices are formatted with the ZAR currency symbol (R)
      expect(screen.getByText(/R15,000/i)).toBeInTheDocument();
    });
  });

  it('renders category filter checkboxes', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      // Category filter checkboxes list "Smartphones" (Apple and Samsung both belong to it)
      const smartphonesElements = screen.getAllByText('Smartphones');
      expect(smartphonesElements.length).toBeGreaterThan(0);
    });
  });

  it('renders clear all filters button when filters active', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });
    // Click the Smartphones category checkbox to activate a filter
    const checkbox = screen.getByLabelText('Smartphones');
    fireEvent.click(checkbox);
    await waitFor(() => {
      // "Clear All" button should appear once at least one filter is active
      const clearButtons = screen.getAllByText(/clear all/i);
      expect(clearButtons.length).toBeGreaterThan(0);
    });
  });

  it('renders empty state when no products match filters', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });
    // Search for a query that matches no products
    const searchInput = screen.getByPlaceholderText(/search for products/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistentproduct123' } });
    await waitFor(() => {
      // Empty state message should be shown instead of any products
      expect(screen.getByText(/no products match your filters/i)).toBeInTheDocument();
    });
  });
});
