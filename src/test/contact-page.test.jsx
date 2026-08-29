/**
 * ContactPage Component Test Suite
 * --------------------------------
 * Tests the ContactPage component (`src/pages/ContactPage.jsx`) rendering,
 * form validation, and form state management.
 *
 * Strategy:
 *   Mocks the API (contactAPI.submit returns success), context providers
 *   (empty cart, unauthenticated, no auth modal), and verifies the contact
 *   form renders all fields, validates user input, and clears on success.
 *
 * Mocks:
 *   - services/api: contactAPI.submit → returns { success: true };
 *     categoriesAPI/brandsAPI → empty data
 *   - CartContext, WishlistContext, AuthContext, AuthModalContext → stub state
 *
 * Structure:
 *   - Shared wrapper with MemoryRouter
 *   - Tests for form presence, all input fields, send button, contact method
 *     cards, business hours, social links, inline validation errors, input
 *     updates, and form clearing after submission
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock API: contactAPI.submit returns success; categories/brands return empty
vi.mock('../services/api', () => ({
  contactAPI: { submit: vi.fn().mockResolvedValue({ success: true }) },
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

// Mock AuthModalContext with no-op functions
vi.mock('../components/AuthModalContext', () => ({
  useAuthModal: vi.fn().mockReturnValue({
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
  }),
}));

import Contact from '../pages/ContactPage';

/**
 * ContactPage test suite.
 * Tests form rendering, field presence, contact method display, validation,
 * input updates, and form clearing behavior.
 */
describe('ContactPage', () => {
  beforeEach(() => {
    // Clear mock call history before each test
    vi.clearAllMocks();
  });

  // Shared wrapper providing MemoryRouter for routing
  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders contact form with testid', () => {
    render(wrapper({ children: <Contact /> }));
    // The form container has a data-testid for easy targeting
    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
  });

  it('renders contact form with all fields', () => {
    render(wrapper({ children: <Contact /> }));
    // Verify all expected form fields are present by their test IDs
    expect(screen.getByTestId('contact-name')).toBeInTheDocument();
    expect(screen.getByTestId('contact-email')).toBeInTheDocument();
    expect(screen.getByTestId('contact-phone')).toBeInTheDocument();
    expect(screen.getByTestId('contact-subject')).toBeInTheDocument();
    expect(screen.getByTestId('contact-message')).toBeInTheDocument();
  });

  it('renders send message button', () => {
    render(wrapper({ children: <Contact /> }));
    // Submit button has a test ID for reliable targeting
    expect(screen.getByTestId('contact-submit')).toBeInTheDocument();
  });

  it('renders contact method cards', () => {
    render(wrapper({ children: <Contact /> }));
    // Contact method cards display alternative ways to reach the business
    expect(screen.getByText(/call us/i)).toBeInTheDocument();
    const whatsappElements = screen.getAllByText(/whatsapp/i);
    expect(whatsappElements.length).toBeGreaterThan(0);
  });

  it('renders business hours', () => {
    render(wrapper({ children: <Contact /> }));
    // Business hours section shows operating schedule
    expect(screen.getByText('Business Hours')).toBeInTheDocument();
  });

  it('renders social media links with aria-labels', () => {
    render(wrapper({ children: <Contact /> }));
    // Social links use aria-labels for accessibility and reliable targeting
    const facebookLinks = screen.getAllByLabelText(/facebook/i);
    const instagramLinks = screen.getAllByLabelText(/instagram/i);
    expect(facebookLinks.length).toBeGreaterThan(0);
    expect(instagramLinks.length).toBeGreaterThan(0);
  });

  it('shows inline validation error for empty name', async () => {
    render(wrapper({ children: <Contact /> }));
    // Submit without filling any fields — should show validation errors
    fireEvent.click(screen.getByTestId('contact-submit'));
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('shows inline validation error for empty message', async () => {
    render(wrapper({ children: <Contact /> }));
    // Submit without a message — should show the required error
    fireEvent.click(screen.getByTestId('contact-submit'));
    await waitFor(() => {
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });
  });

  it('shows inline validation error for invalid email', async () => {
    render(wrapper({ children: <Contact /> }));
    const emailInput = screen.getByTestId('contact-email');
    // Enter an invalid email and blur to trigger validation
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('updates form fields on input', () => {
    render(wrapper({ children: <Contact /> }));
    const nameInput = screen.getByTestId('contact-name');
    // Verify the input value updates as the user types
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput.value).toBe('John Doe');
  });

  it('clears form after successful submission', async () => {
    render(wrapper({ children: <Contact /> }));

    // Fill in all form fields with valid data
    fireEvent.change(screen.getByTestId('contact-name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByTestId('contact-email'), { target: { value: 'john@test.com' } });
    fireEvent.change(screen.getByTestId('contact-phone'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByTestId('contact-subject'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByTestId('contact-message'), { target: { value: 'Hello' } });

    fireEvent.click(screen.getByTestId('contact-submit'));

    // After successful submission, all fields should be cleared
    await waitFor(() => {
      expect(screen.getByTestId('contact-name').value).toBe('');
    });
  });
});
