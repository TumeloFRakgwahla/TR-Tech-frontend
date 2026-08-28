import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../services/api', () => ({
  authAPI: {
    login: vi.fn().mockResolvedValue({ success: true, user: { email: 'test@test.com' } }),
    register: vi.fn().mockResolvedValue({ success: true, user: { email: 'new@test.com' } }),
  },
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
    login: vi.fn().mockResolvedValue({ success: true }),
    register: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn(),
  }),
}));

vi.mock('../components/AuthModalContext', () => ({
  useAuthModal: vi.fn().mockReturnValue({
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
  }),
}));

import { AuthModal } from '../components/AuthModal';

describe('AuthModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders auth modal with testid', () => {
    render(wrapper({ children: <AuthModal open={true} onOpenChange={vi.fn()} /> }));
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
  });

  it('renders login form by default', () => {
    render(wrapper({ children: <AuthModal open={true} onOpenChange={vi.fn()} /> }));
    expect(screen.getByTestId('auth-email')).toBeInTheDocument();
    expect(screen.getByTestId('auth-password')).toBeInTheDocument();
    expect(screen.getByTestId('auth-firstName')).toBeInTheDocument();
  });

  it('switches to login mode when clicked', () => {
    render(wrapper({ children: <AuthModal open={true} onOpenChange={vi.fn()} /> }));
    fireEvent.click(screen.getByTestId('auth-switch-mode'));
    expect(screen.getByTestId('auth-email')).toBeInTheDocument();
    expect(screen.getByTestId('auth-password')).toBeInTheDocument();
    expect(screen.queryByTestId('auth-firstName')).not.toBeInTheDocument();
  });

  it('switches back to register from login', () => {
    render(wrapper({ children: <AuthModal open={true} onOpenChange={vi.fn()} /> }));
    fireEvent.click(screen.getByTestId('auth-switch-mode'));
    fireEvent.click(screen.getByTestId('auth-switch-mode'));
    expect(screen.getByTestId('auth-email')).toBeInTheDocument();
    expect(screen.getByTestId('auth-password')).toBeInTheDocument();
    expect(screen.getByTestId('auth-firstName')).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    render(wrapper({ children: <AuthModal open={true} onOpenChange={vi.fn()} /> }));
    fireEvent.click(screen.getByTestId('auth-submit'));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    render(wrapper({ children: <AuthModal open={true} onOpenChange={vi.fn()} /> }));
    fireEvent.change(screen.getByTestId('auth-password'), { target: { value: '123' } });
    fireEvent.click(screen.getByTestId('auth-submit'));
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });
});
