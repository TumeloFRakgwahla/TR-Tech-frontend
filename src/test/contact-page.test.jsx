import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../services/api', () => ({
  contactAPI: { submit: vi.fn().mockResolvedValue({ success: true }) },
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

import Contact from '../pages/ContactPage';

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders contact form with testid', () => {
    render(wrapper({ children: <Contact /> }));
    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
  });

  it('renders contact form with all fields', () => {
    render(wrapper({ children: <Contact /> }));
    expect(screen.getByTestId('contact-name')).toBeInTheDocument();
    expect(screen.getByTestId('contact-email')).toBeInTheDocument();
    expect(screen.getByTestId('contact-phone')).toBeInTheDocument();
    expect(screen.getByTestId('contact-subject')).toBeInTheDocument();
    expect(screen.getByTestId('contact-message')).toBeInTheDocument();
  });

  it('renders send message button', () => {
    render(wrapper({ children: <Contact /> }));
    expect(screen.getByTestId('contact-submit')).toBeInTheDocument();
  });

  it('renders contact method cards', () => {
    render(wrapper({ children: <Contact /> }));
    expect(screen.getByText(/call us/i)).toBeInTheDocument();
    const whatsappElements = screen.getAllByText(/whatsapp/i);
    expect(whatsappElements.length).toBeGreaterThan(0);
  });

  it('renders business hours', () => {
    render(wrapper({ children: <Contact /> }));
    expect(screen.getByText('Business Hours')).toBeInTheDocument();
  });

  it('renders social media links with aria-labels', () => {
    render(wrapper({ children: <Contact /> }));
    const facebookLinks = screen.getAllByLabelText(/facebook/i);
    const instagramLinks = screen.getAllByLabelText(/instagram/i);
    expect(facebookLinks.length).toBeGreaterThan(0);
    expect(instagramLinks.length).toBeGreaterThan(0);
  });

  it('shows inline validation error for empty name', async () => {
    render(wrapper({ children: <Contact /> }));
    fireEvent.click(screen.getByTestId('contact-submit'));
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('shows inline validation error for empty message', async () => {
    render(wrapper({ children: <Contact /> }));
    fireEvent.click(screen.getByTestId('contact-submit'));
    await waitFor(() => {
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });
  });

  it('shows inline validation error for invalid email', async () => {
    render(wrapper({ children: <Contact /> }));
    const emailInput = screen.getByTestId('contact-email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('updates form fields on input', () => {
    render(wrapper({ children: <Contact /> }));
    const nameInput = screen.getByTestId('contact-name');
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput.value).toBe('John Doe');
  });

  it('clears form after successful submission', async () => {
    render(wrapper({ children: <Contact /> }));

    fireEvent.change(screen.getByTestId('contact-name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByTestId('contact-email'), { target: { value: 'john@test.com' } });
    fireEvent.change(screen.getByTestId('contact-phone'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByTestId('contact-subject'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByTestId('contact-message'), { target: { value: 'Hello' } });

    fireEvent.click(screen.getByTestId('contact-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('contact-name').value).toBe('');
    });
  });
});
