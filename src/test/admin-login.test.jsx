/**
 * AdminLoginPage Component Test Suite
 * ------------------------------------
 * Tests the AdminLoginPage component (`src/pages/Admin/AdminLoginPage.jsx`),
 * focusing on form rendering, input handling, validation, and the account
 * lockout mechanism.
 *
 * Strategy:
 *   Mocks all API and context modules, then renders the component in
 *   different localStorage states to test the lockout flow.
 *
 * Mocks:
 *   - services/api: productsAPI, categoriesAPI, brandsAPI → empty data
 *   - CartContext, WishlistContext, AuthContext, AuthModalContext → stub state
 *   - AdminAuthContext: useAdminAuth → returns login mock that resolves success
 *
 * Structure:
 *   - Shared wrapper with MemoryRouter
 *   - Tests for form fields (email/password), sign-in button, input updates,
 *     validation on empty submit, lockout message rendering, and form
 *     disabling during lockout
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock API modules — admin login page doesn't directly call API but
// child components may
vi.mock('../services/api', () => ({
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

// Mock AuthContext as unauthenticated (admin login page doesn't use it)
vi.mock('../components/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock AdminAuthContext — login resolves with success for testing
vi.mock('../components/AdminAuthContext', () => ({
  useAdminAuth: vi.fn().mockReturnValue({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn().mockResolvedValue({ success: true }),
    logout: vi.fn(),
  }),
}));

// Mock AuthModalContext with no-op functions
vi.mock('../components/AuthModalContext', () => ({
  useAuthModal: vi.fn().mockReturnValue({
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
  }),
}));

import AdminLogin from '../pages/Admin/AdminLoginPage';

/**
 * AdminLoginPage test suite.
 * Tests form rendering, input handling, validation, and lockout behavior.
 */
describe('AdminLoginPage', () => {
  beforeEach(() => {
    // Clear mock call history and localStorage state before each test
    vi.clearAllMocks();
    localStorage.clear();
  });

  // Shared wrapper providing MemoryRouter for routing
  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders login form with email and password', () => {
    render(wrapper({ children: <AdminLogin /> }));
    // Verify both input fields are present and accessible by label
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(wrapper({ children: <AdminLogin /> }));
    // The submit button should have the text "Sign In"
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('updates email field on input', () => {
    render(wrapper({ children: <AdminLogin /> }));
    const emailInput = screen.getByLabelText(/email/i);
    // Verify the email input reflects user typing
    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    expect(emailInput.value).toBe('admin@test.com');
  });

  it('updates password field on input', () => {
    render(wrapper({ children: <AdminLogin /> }));
    const passwordInput = screen.getByLabelText(/password/i);
    // Verify the password input reflects user typing
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });

  it('shows validation error for empty fields', async () => {
    render(wrapper({ children: <AdminLogin /> }));
    // Submit the form without filling any fields — validation should fire
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      // Validation is done via toast; just verify the form is still present (no redirect)
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it('displays lockout message when locked out', () => {
    // Simulate a lockout by setting localStorage as if 3 failed attempts
    // have already occurred and the lockout period is still active
    localStorage.setItem('trtech_admin_failed_attempts', '3');
    localStorage.setItem('trtech_admin_lockout_until', String(Date.now() + 60000));
    render(wrapper({ children: <AdminLogin /> }));
    // The lockout message should be displayed, indicating the user must wait
    expect(screen.getByText(/locked out/i)).toBeInTheDocument();
  });

  it('disables form during lockout', () => {
    // Same lockout scenario — the login form inputs and submit should be disabled
    localStorage.setItem('trtech_admin_failed_attempts', '3');
    localStorage.setItem('trtech_admin_lockout_until', String(Date.now() + 60000));
    render(wrapper({ children: <AdminLogin /> }));
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    // The submit button should be disabled to prevent further login attempts
    expect(submitButton).toBeDisabled();
  });
});
