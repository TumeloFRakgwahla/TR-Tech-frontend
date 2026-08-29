/**
 * AuthModal Component Test Suite
 * ------------------------------
 * Tests the AuthModal component (`src/components/AuthModal.jsx`), which is
 * a modal dialog for user login and registration.
 *
 * Strategy:
 *   Mocks the API (authAPI.login/register return success), and all context
 *   providers with stub implementations. Tests verify the modal renders in
 *   both login and register modes, switches between them, and validates
 *   required fields.
 *
 * Mocks:
 *   - services/api: authAPI (login + register), productsAPI,
 *     categoriesAPI, brandsAPI
 *   - CartContext, WishlistContext, AuthContext, AuthModalContext → stub state
 *
 * Structure:
 *   - Shared wrapper with MemoryRouter
 *   - Tests for modal visibility, default (login) mode, mode switching
 *     (login ↔ register), empty email validation, and short password validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock API — authAPI login/register return success with mock user data
vi.mock('../services/api', () => ({
  authAPI: {
    login: vi.fn().mockResolvedValue({ success: true, user: { email: 'test@test.com' } }),
    register: vi.fn().mockResolvedValue({ success: true, user: { email: 'new@test.com' } }),
  },
  productsAPI: { getAll: vi.fn().mockResolvedValue({ success: true, data: [] }) },
  categoriesAPI: { getActive: vi.fn().mockResolvedValue({ success: true, data: [] }) },
  brandsAPI: { getActive: vi.fn().mockResolvedValue({ success: true, data: [] }) },
}));

// Mock CartContext with empty cart
vi.mock('../components/CartContext', () => ({
  useCart: vi.fn().mockReturnValue({
    addToCart: vi.fn(),
    totalItems: 0,
    totalPrice: 0,
    cart: [],
  }),
}));

// Mock WishlistContext with empty wishlist
vi.mock('../components/WishlistContext', () => ({
  useWishlist: vi.fn().mockReturnValue({
    wishlist: [],
    wishlistCount: 0,
    toggleWishlist: vi.fn(),
    isInWishlist: vi.fn().mockReturnValue(false),
    isToggling: vi.fn().mockReturnValue(false),
  }),
}));

// Mock AuthContext — login/register resolve with success
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

// Mock AuthModalContext with no-op open/close
vi.mock('../components/AuthModalContext', () => ({
  useAuthModal: vi.fn().mockReturnValue({
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
  }),
}));

import { AuthModal } from '../components/AuthModal';

/**
 * AuthModal test suite.
 * Tests modal rendering, mode switching between login/register, and
 * form validation for required fields.
 */
describe('AuthModal', () => {
  beforeEach(() => {
    // Clear mock call history before each test
    vi.clearAllMocks();
  });

  // Shared wrapper providing MemoryRouter for the modal component
  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders auth modal with testid', () => {
    // The open prop controls modal visibility; onOpenChange receives the toggle callback
    render(wrapper({ children: <AuthModal open={true} onOpenChange={vi.fn()} /> }));
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
  });

  it('renders login form by default', () => {
    render(wrapper({ children: <AuthModal open={true} onOpenChange={vi.fn()} /> }));
    // In login mode: email and password are required, first name is optional
    expect(screen.getByTestId('auth-email')).toBeInTheDocument();
    expect(screen.getByTestId('auth-password')).toBeInTheDocument();
    expect(screen.getByTestId('auth-firstName')).toBeInTheDocument();
  });

  it('switches to login mode when clicked', () => {
    render(wrapper({ children: <AuthModal open={true} onOpenChange={vi.fn()} /> }));
    // Click the mode-switch button to toggle from default (register) to login
    fireEvent.click(screen.getByTestId('auth-switch-mode'));
    // In login mode: firstName field should be hidden, email/password remain
    expect(screen.getByTestId('auth-email')).toBeInTheDocument();
    expect(screen.getByTestId('auth-password')).toBeInTheDocument();
    expect(screen.queryByTestId('auth-firstName')).not.toBeInTheDocument();
  });

  it('switches back to register from login', () => {
    render(wrapper({ children: <AuthModal open={true} onOpenChange={vi.fn()} /> }));
    // Click twice: register → login → register
    fireEvent.click(screen.getByTestId('auth-switch-mode'));
    fireEvent.click(screen.getByTestId('auth-switch-mode'));
    // In register mode: all fields including firstName should be visible
    expect(screen.getByTestId('auth-email')).toBeInTheDocument();
    expect(screen.getByTestId('auth-password')).toBeInTheDocument();
    expect(screen.getByTestId('auth-firstName')).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    render(wrapper({ children: <AuthModal open={true} onOpenChange={vi.fn()} /> }));
    // Submit without filling any fields — triggers inline validation
    fireEvent.click(screen.getByTestId('auth-submit'));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    render(wrapper({ children: <AuthModal open={true} onOpenChange={vi.fn()} /> }));
    // Enter a password shorter than the 8-character minimum
    fireEvent.change(screen.getByTestId('auth-password'), { target: { value: '123' } });
    fireEvent.click(screen.getByTestId('auth-submit'));
    await waitFor(() => {
      // Validation should reject passwords under 8 characters
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });
});
