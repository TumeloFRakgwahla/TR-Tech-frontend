import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockProducts = [
  { _id: '1', name: 'iPhone 15', price: 15000, category: 'Smartphones', brand: 'Apple', stock: 5, status: 'Active' },
  { _id: '2', name: 'Samsung Galaxy', price: 12000, category: 'Smartphones', brand: 'Samsung', stock: 3, status: 'Active' },
  { _id: '3', name: 'MacBook Pro', price: 25000, category: 'Laptops', brand: 'Apple', stock: 0, status: 'Out of Stock' },
];

vi.mock('../services/api', () => ({
  productsAPI: { getAll: vi.fn(() => Promise.resolve({ success: true, data: mockProducts })) },
  categoriesAPI: { getActive: vi.fn(() => Promise.resolve({ success: true, data: [{ name: 'Smartphones' }, { name: 'Laptops' }] })) },
  brandsAPI: { getActive: vi.fn(() => Promise.resolve({ success: true, data: [{ name: 'Apple' }, { name: 'Samsung' }] })) },
}));

vi.mock('../components/CartContext', () => ({
  useCart: vi.fn(() => ({
    addToCart: vi.fn(),
    totalItems: 0,
    totalPrice: 0,
    cart: [],
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

import Shop from '../pages/ShopPage';

describe('ShopPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders loading skeleton initially', () => {
    render(wrapper({ children: <Shop /> }));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders products after loading', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });
    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument();
  });

  it('renders search input', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search for products/i)).toBeInTheDocument();
    });
  });

  it('renders sort dropdown', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    });
  });

  it('renders filter sidebar on desktop', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      const filtersElements = screen.getAllByText(/filters/i);
      expect(filtersElements.length).toBeGreaterThan(0);
    });
  });

  it('filters products by search query', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText(/search for products/i);
    fireEvent.change(searchInput, { target: { value: 'iPhone' } });
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      expect(screen.queryByText('Samsung Galaxy')).not.toBeInTheDocument();
    });
  });

  it('renders "Add to Cart" buttons for products', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      const addButtons = screen.getAllByText(/add to cart/i);
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  it('renders out of stock label for out-of-stock products', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });
  });

  it('renders product prices', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      expect(screen.getByText(/R15,000/i)).toBeInTheDocument();
    });
  });

  it('renders category filter checkboxes', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      const smartphonesElements = screen.getAllByText('Smartphones');
      expect(smartphonesElements.length).toBeGreaterThan(0);
    });
  });

  it('renders clear all filters button when filters active', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });
    const checkbox = screen.getByLabelText('Smartphones');
    fireEvent.click(checkbox);
    await waitFor(() => {
      const clearButtons = screen.getAllByText(/clear all/i);
      expect(clearButtons.length).toBeGreaterThan(0);
    });
  });

  it('renders empty state when no products match filters', async () => {
    render(wrapper({ children: <Shop /> }));
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText(/search for products/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistentproduct123' } });
    await waitFor(() => {
      expect(screen.getByText(/no products match your filters/i)).toBeInTheDocument();
    });
  });
});
