/**
 * CheckoutModal Component Test Suite
 * ---------------------------------
 * Tests the CheckoutModal component (`src/components/CheckoutModal.jsx`),
 * a multi-step modal dialog (auth → details → confirmation).
 *
 * Strategy:
 *   Mocks the API, CartContext, AuthContext, and sonner. Tests verify the
 *   modal renders the active step, advances through steps, validates required
 *   fields (inline + toast), and reaches the confirmation step with valid
 *   input. An authenticated case verifies the details step is shown first.
 *
 * Mocks:
 *   - services/api: ordersAPI.create, paymentsAPI.initializePaystack
 *   - CartContext / AuthContext: stubbed, reconfigured per-test in beforeEach
 *   - sonner: toast spies (hoisted) so we can assert calls
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockCart = [
  {
    _id: '1',
    name: 'iPhone 15',
    price: 15000,
    quantity: 1,
    image: 'iphone.jpg',
    condition: 'new',
  },
];

// Hoist toast spies so the vi.mock factory can reference them before init
const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock('sonner', () => ({ toast: toastMock }));

vi.mock('../services/api', () => ({
  ordersAPI: {
    create: vi.fn().mockResolvedValue({
      success: true,
      data: { _id: 'order1', totalAmount: 15000 },
    }),
  },
  paymentsAPI: {
    initializePaystack: vi.fn().mockResolvedValue({
      success: true,
      data: { authorizationUrl: 'https://checkout.paystack.com/test' },
    }),
    verifyPaystack: vi.fn(),
  },
  categoriesAPI: {
    getActive: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
  cartAPI: {
    getAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
  authAPI: { getMe: vi.fn(), login: vi.fn(), register: vi.fn(), logout: vi.fn() },
  productsAPI: { getAll: vi.fn() },
  brandsAPI: { getActive: vi.fn() },
}));

vi.mock('../components/CartContext', () => ({
  useCart: vi.fn(),
}));
vi.mock('../components/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../components/AuthModalContext', () => ({
  useAuthModal: vi.fn(() => ({
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
  })),
}));

import { useAuth } from '../components/AuthContext';
import { useCart } from '../components/CartContext';
import { CheckoutModal } from '../components/CheckoutModal';

const authedUser = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '',
  address: {},
};

describe('CheckoutModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    useCart.mockReturnValue({
      cart: mockCart,
      totalItems: 1,
      totalPrice: 15000,
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
    });
  });

  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders the modal in the auth step for guests', () => {
    render(
      wrapper({
        children: <CheckoutModal open={true} onOpenChange={vi.fn()} />,
      })
    );
    expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();
    expect(screen.getByText(/complete your order/i)).toBeInTheDocument();
    expect(screen.getByTestId('checkout-continue-guest')).toBeInTheDocument();
  });

  it('advances to the details step when continuing as guest', async () => {
    render(
      wrapper({
        children: <CheckoutModal open={true} onOpenChange={vi.fn()} />,
      })
    );
    fireEvent.click(screen.getByTestId('checkout-continue-guest'));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /delivery details/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(
        screen.getByTestId('checkout-continue-confirm')
      ).toBeInTheDocument();
    });
  });

  it('shows validation errors for empty required fields', async () => {
    render(
      wrapper({
        children: <CheckoutModal open={true} onOpenChange={vi.fn()} />,
      })
    );
    fireEvent.click(screen.getByTestId('checkout-continue-guest'));
    await waitFor(() => {
      expect(
        screen.getByTestId('checkout-continue-confirm')
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('checkout-continue-confirm'));
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      expect(toastMock.error).toHaveBeenCalledWith(
        'Please fill in all required fields correctly'
      );
    });
  });

  it('advances to the confirmation step with valid details', async () => {
    render(
      wrapper({
        children: <CheckoutModal open={true} onOpenChange={vi.fn()} />,
      })
    );
    fireEvent.click(screen.getByTestId('checkout-continue-guest'));
    await waitFor(() => {
      expect(
        screen.getByTestId('checkout-continue-confirm')
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '+27821234567' },
    });
    fireEvent.change(screen.getByLabelText(/street address/i), {
      target: { value: '123 Main Street' },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: 'Cape Town' },
    });

     fireEvent.click(screen.getByTestId('checkout-continue-confirm'));
    await waitFor(() => {
      expect(screen.getByTestId('checkout-continue-payment')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('checkout-continue-payment'));
    await waitFor(() => {
      expect(
        screen.getByTestId('checkout-place-order')
      ).toBeInTheDocument();
      expect(screen.getByText(/confirm your order/i)).toBeInTheDocument();
    });
  });

  it('starts on the details step for authenticated users', async () => {
    useAuth.mockReturnValue({
      user: authedUser,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      wrapper({
        children: <CheckoutModal open={true} onOpenChange={vi.fn()} />,
      })
    );
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /delivery details/i })
      ).toBeInTheDocument();
    });
  });
});
