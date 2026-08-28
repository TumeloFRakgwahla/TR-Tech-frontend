import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  phone: '1234567890',
};

vi.mock('../components/AccountContext', () => ({
  useAccount: vi.fn(() => ({
    profile: mockUser,
    loading: false,
    updateProfile: vi.fn(() => Promise.resolve({ success: true })),
    changePassword: vi.fn(() => Promise.resolve({ success: true })),
    addAddress: vi.fn(() => Promise.resolve({ success: true })),
    updateAddress: vi.fn(() => Promise.resolve({ success: true })),
    deleteAddress: vi.fn(() => Promise.resolve({ success: true })),
    setDefaultAddress: vi.fn(() => Promise.resolve({ success: true })),
    updateNotificationPreferences: vi.fn(() => Promise.resolve({ success: true })),
    revokeSession: vi.fn(() => Promise.resolve({ success: true })),
    initializeAccount: vi.fn(),
    addresses: [],
    orders: [],
    repairs: [],
    notifications: null,
    sessions: [],
    refreshOrders: vi.fn(),
    refreshRepairs: vi.fn(),
  })),
}));

vi.mock('../components/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    isAuthenticated: true,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('../services/api', () => ({
  authAPI: { getMe: vi.fn(() => Promise.resolve({ success: true, user: mockUser })) },
  ordersAPI: { myOrders: vi.fn(() => Promise.resolve({ success: true, data: [] })) },
  accountAPI: { getProfile: vi.fn(() => Promise.resolve({ success: true, data: mockUser })) },
}));

import { ProfilePage } from '../pages/account/ProfilePage';

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders profile form with user data', () => {
    render(wrapper({ children: <ProfilePage /> }));
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@test.com')).toBeInTheDocument();
  });

  it('renders profile information heading', () => {
    render(wrapper({ children: <ProfilePage /> }));
    expect(screen.getByText(/profile information/i)).toBeInTheDocument();
  });

  it('updates first name field on input', () => {
    render(wrapper({ children: <ProfilePage /> }));
    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    expect(firstNameInput.value).toBe('Jane');
  });

  it('updates last name field on input', () => {
    render(wrapper({ children: <ProfilePage /> }));
    const lastNameInput = screen.getByLabelText(/last name/i);
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    expect(lastNameInput.value).toBe('Smith');
  });

  it('updates phone field on input', () => {
    render(wrapper({ children: <ProfilePage /> }));
    const phoneInput = screen.getByLabelText(/phone/i);
    fireEvent.change(phoneInput, { target: { value: '0987654321' } });
    expect(phoneInput.value).toBe('0987654321');
  });

  it('renders save button', () => {
    render(wrapper({ children: <ProfilePage /> }));
    expect(screen.getByRole('button', { name: /save|update/i })).toBeInTheDocument();
  });
});
