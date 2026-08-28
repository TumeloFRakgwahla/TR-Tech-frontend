import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockCart = [
  { _id: '1', name: 'iPhone 15', price: 15000, quantity: 1, image: 'iphone.jpg' },
  { _id: '2', name: 'Samsung Galaxy', price: 12000, quantity: 2, image: null },
];

vi.mock('../components/CartContext', () => ({
  useCart: vi.fn(() => ({
    cart: mockCart,
    totalItems: 3,
    totalPrice: 39000,
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
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

import Cart from '../pages/CartPage';

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders cart heading', () => {
    render(wrapper({ children: <Cart /> }));
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });

  it('renders cart items', () => {
    render(wrapper({ children: <Cart /> }));
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument();
  });

  it('renders item count', () => {
    render(wrapper({ children: <Cart /> }));
    expect(screen.getByText(/3 item/i)).toBeInTheDocument();
  });

  it('renders total price', () => {
    render(wrapper({ children: <Cart /> }));
    // Check for price elements containing R and numbers
    const priceElements = screen.getAllByText(/R\s*\d/);
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it('renders quantity controls', () => {
    render(wrapper({ children: <Cart /> }));
    const minusButtons = screen.getAllByLabelText(/decrease quantity/i);
    const plusButtons = screen.getAllByLabelText(/increase quantity/i);
    expect(minusButtons.length).toBeGreaterThan(0);
    expect(plusButtons.length).toBeGreaterThan(0);
  });

  it('renders remove buttons', () => {
    render(wrapper({ children: <Cart /> }));
    const removeButtons = screen.getAllByLabelText(/remove item/i);
    expect(removeButtons.length).toBeGreaterThan(0);
  });

  it('renders Clear Cart button', () => {
    render(wrapper({ children: <Cart /> }));
    expect(screen.getByText(/clear cart/i)).toBeInTheDocument();
  });

  it('renders Proceed to Checkout button', () => {
    render(wrapper({ children: <Cart /> }));
    expect(screen.getByText(/proceed to checkout/i)).toBeInTheDocument();
  });

  it('renders product links in cart items', () => {
    render(wrapper({ children: <Cart /> }));
    const productLinks = screen.getAllByRole('link', { name: /iphone 15/i });
    expect(productLinks.length).toBeGreaterThan(0);
  });

  it('renders per-item quantity', () => {
    render(wrapper({ children: <Cart /> }));
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders per-item subtotal', () => {
    render(wrapper({ children: <Cart /> }));
    // Check for price elements with R currency symbol
    const subtotals = screen.getAllByText(/R\s*15/);
    expect(subtotals.length).toBeGreaterThan(0);
  });
});
