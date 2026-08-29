/**
 * ProfilePage Component Test Suite
 * --------------------------------
 * Tests the ProfilePage component (`src/pages/account/ProfilePage.jsx`),
 * which displays and allows editing of the user's profile information.
 *
 * Strategy:
 *   Mocks AccountContext (with a mock user and all action methods),
 *   AuthContext (authenticated user), and services/api (authAPI, ordersAPI,
 *   accountAPI). Tests verify the form renders with user data, individual
 *   fields can be edited, and the save button is present.
 *
 * Mocks:
 *   - AccountContext: useAccount → returns mockUser, all CRUD mock functions
 *   - AuthContext: useAuth → authenticated with mockUser
 *   - services/api: authAPI.getMe, ordersAPI.myOrders, accountAPI.getProfile
 *
 * Structure:
 *   - Shared wrapper with MemoryRouter
 *   - Tests for form rendering with pre-filled data, heading presence,
 *     field-by-field input updates (first name, last name, phone), and
 *     save button presence
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock user data displayed in the profile form
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  phone: '1234567890',
};

// Mock AccountContext with the mock user and all action methods as stubs
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

// Mock AuthContext as authenticated with the mock user
vi.mock('../components/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    isAuthenticated: true,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));

// Mock API calls used by the account/profile pages
vi.mock('../services/api', () => ({
  authAPI: { getMe: vi.fn(() => Promise.resolve({ success: true, user: mockUser })) },
  ordersAPI: { myOrders: vi.fn(() => Promise.resolve({ success: true, data: [] })) },
  accountAPI: { getProfile: vi.fn(() => Promise.resolve({ success: true, data: mockUser })) },
}));

import { ProfilePage } from '../pages/account/ProfilePage';

/**
 * ProfilePage test suite.
 * Tests form rendering with pre-filled user data, field updates, and save button.
 */
describe('ProfilePage', () => {
  beforeEach(() => {
    // Clear mock call history before each test
    vi.clearAllMocks();
  });

  // Shared wrapper providing MemoryRouter for routing
  const wrapper = ({ children }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('renders profile form with user data', () => {
    render(wrapper({ children: <ProfilePage /> }));
    // The form should be pre-filled with the mock user's data
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@test.com')).toBeInTheDocument();
  });

  it('renders profile information heading', () => {
    render(wrapper({ children: <ProfilePage /> }));
    // Section heading for the profile information form
    expect(screen.getByText(/profile information/i)).toBeInTheDocument();
  });

  it('updates first name field on input', () => {
    render(wrapper({ children: <ProfilePage /> }));
    const firstNameInput = screen.getByLabelText(/first name/i);
    // Verify the input reflects the typed value
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
    // The save button text may be "Save" or "Update" depending on the component
    expect(screen.getByRole('button', { name: /save|update/i })).toBeInTheDocument();
  });
});
