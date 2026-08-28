import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../services/api', () => ({
  productsAPI: { getAll: vi.fn().mockResolvedValue({ success: true, data: [] }) },
  categoriesAPI: { getActive: vi.fn().mockResolvedValue({ success: true, data: [] }) },
  brandsAPI: { getActive: vi.fn().mockResolvedValue({ success: true, data: [] }) },
}));

vi.mock('../components/CartContext', () => ({
  useCart: vi.fn().mockReturnValue({
    addToCart: vi.fn(),
    totalItems: 0,
    totalPrice: 0,
    cart: [],
  }),
}));

vi.mock('../components/WishlistContext', () => ({
  useWishlist: vi.fn().mockReturnValue({
    wishlist: [],
    wishlistCount: 0,
    toggleWishlist: vi.fn(),
    isInWishlist: vi.fn().mockReturnValue(false),
    isToggling: vi.fn().mockReturnValue(false),
  }),
}));

vi.mock('../components/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../components/AuthModalContext', () => ({
  useAuthModal: vi.fn().mockReturnValue({
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
  }),
}));

import Home from '../pages/HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders hero section with CTAs', () => {
    render(wrapper({ children: <Home /> }));
    const heroElements = screen.getAllByText(/book repair/i);
    expect(heroElements.length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    render(wrapper({ children: <Home /> }));
    const homeLinks = screen.getAllByText('Home');
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Services').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Shop').length).toBeGreaterThan(0);
  });

  it('renders trending products section', () => {
    render(wrapper({ children: <Home /> }));
    expect(screen.getByText('Trending Now')).toBeInTheDocument();
  });

  it('renders new arrivals section', () => {
    render(wrapper({ children: <Home /> }));
    expect(screen.getByText('New Arrivals')).toBeInTheDocument();
  });

  it('renders promo banner', () => {
    render(wrapper({ children: <Home /> }));
    expect(screen.getByText(/free delivery on orders over r500/i)).toBeInTheDocument();
  });

  it('renders footer with copyright', () => {
    render(wrapper({ children: <Home /> }));
    expect(screen.getByText(/tr-tech repairs & designs/i)).toBeInTheDocument();
  });

  it('renders trust signals section', () => {
    render(wrapper({ children: <Home /> }));
    expect(screen.getByText(/warranty included/i)).toBeInTheDocument();
  });

  it('renders "See All" links that navigate to shop', () => {
    render(wrapper({ children: <Home /> }));
    const seeAllLinks = screen.getAllByText(/see all/i);
    expect(seeAllLinks.length).toBeGreaterThan(0);
  });

  it('renders Book Repair button in navbar', () => {
    render(wrapper({ children: <Home /> }));
    const bookRepairButtons = screen.getAllByText(/book repair/i);
    expect(bookRepairButtons.length).toBeGreaterThan(0);
  });

  it('renders Shop Now button in promo banner', () => {
    render(wrapper({ children: <Home /> }));
    const shopNowButtons = screen.getAllByText(/shop now/i);
    expect(shopNowButtons.length).toBeGreaterThan(0);
  });
});
