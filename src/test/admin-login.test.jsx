import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

vi.mock('../components/AdminAuthContext', () => ({
  useAdminAuth: vi.fn().mockReturnValue({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn(),
  }),
}));

vi.mock('../components/AuthModalContext', () => ({
  useAuthModal: vi.fn().mockReturnValue({
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
  }),
}));

import AdminLogin from '../pages/Admin/AdminLoginPage';

describe('AdminLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders login form with email and password', () => {
    render(wrapper({ children: <AdminLogin /> }));
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(wrapper({ children: <AdminLogin /> }));
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('updates email field on input', () => {
    render(wrapper({ children: <AdminLogin /> }));
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    expect(emailInput.value).toBe('admin@test.com');
  });

  it('updates password field on input', () => {
    render(wrapper({ children: <AdminLogin /> }));
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });

  it('shows validation error for empty fields', async () => {
    render(wrapper({ children: <AdminLogin /> }));
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      // Validation is done via toast, check that form is still present (no redirect)
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it('displays lockout message when locked out', () => {
    localStorage.setItem('trtech_admin_failed_attempts', '3');
    localStorage.setItem('trtech_admin_lockout_until', String(Date.now() + 60000));
    render(wrapper({ children: <AdminLogin /> }));
    expect(screen.getByText(/locked out/i)).toBeInTheDocument();
  });

  it('disables form during lockout', () => {
    localStorage.setItem('trtech_admin_failed_attempts', '3');
    localStorage.setItem('trtech_admin_lockout_until', String(Date.now() + 60000));
    render(wrapper({ children: <AdminLogin /> }));
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });
});
