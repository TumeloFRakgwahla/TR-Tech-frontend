/**
 * ProtectedRoute Component Test Suite
 * -----------------------------------
 * Tests the ProtectedRoute component (`src/components/ProtectedRoute.jsx`),
 * which guards routes that require user authentication.
 *
 * This component checks the AuthContext for authentication state and renders:
 *   1. A loading spinner while auth state is being determined
 *   2. A redirect to the login page if not authenticated
 *   3. The children if authenticated (optionally checking a required role)
 *
 * Strategy:
 *   Mocks only AuthContext (tested in isolation, not with page-level mocks).
 *   Uses MemoryRouter with configurable initialEntries for redirect testing.
 *
 * Structure:
 *   - Shared wrapper with MemoryRouter
 *   - TestChild: simple element rendered inside ProtectedRoute for assertions
 *   - Tests for: loading state, authenticated render, unauthenticated
 *     redirect, custom redirect path, role-based access (matched and
 *     mismatched)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../components/AuthContext';

// Mock AuthContext to control auth state per test
vi.mock('../components/AuthContext', () => ({
  useAuth: vi.fn(),
}));

/**
 * ProtectedRoute test suite.
 * Tests route guarding logic: loading states, authentication gates,
 * role-based access control, and redirect behavior.
 */
describe('ProtectedRoute', () => {
  // Get a typed reference to the mocked useAuth function
  const mockUseAuth = vi.mocked(useAuth);

  /**
   * Shared router wrapper.
   * @param {Object} props
   * @param {React.ReactNode} props.children - elements to render inside the router
   * @param {string[]} props.initialEntries - starting route paths for MemoryRouter
   */
  const wrapper = ({ children, initialEntries = ['/'] }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );

  // Simple test component rendered inside the protected route to verify
  // whether children are rendered or not
  const TestChild = () => <div data-testid="child">Protected Content</div>;

  it('renders loading spinner when loading is true', () => {
    // While loading, the component shows a spinner and withholds children
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: true,
    });

    const { container } = render(
      wrapper({
        children: <ProtectedRoute><TestChild /></ProtectedRoute>,
      })
    );

    // Tailwind animate-spin class is used for the loading spinner
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    // Children should not be rendered during loading
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('renders children when authenticated with no required role', () => {
    // Authenticated (any role) with no requiredRole prop → render children
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'customer' },
      loading: false,
    });

    render(
      wrapper({
        children: <ProtectedRoute><TestChild /></ProtectedRoute>,
      })
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to default when not authenticated', () => {
    // Not authenticated → redirect to the default login path
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    render(
      wrapper({
        children: <ProtectedRoute><TestChild /></ProtectedRoute>,
      })
    );

    // After redirect, the protected content should not be present
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('redirects to custom path when not authenticated', () => {
    // The redirectTo prop allows overriding the default redirect destination
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    render(
      wrapper({
        initialEntries: ['/'],
        children: <ProtectedRoute redirectTo="/login"><TestChild /></ProtectedRoute>,
      })
    );

    // Custom redirect path should prevent children from rendering
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('renders children when requiredRole matches user role', () => {
    // Authenticated as admin, and the route requires admin role → render children
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'admin' },
      loading: false,
    });

    render(
      wrapper({
        children: <ProtectedRoute requiredRole="admin"><TestChild /></ProtectedRoute>,
      })
    );

    // Role matches → children are rendered
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('redirects when requiredRole does not match user role', () => {
    // Authenticated as customer, but route requires admin role → redirect
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'customer' },
      loading: false,
    });

    render(
      wrapper({
        children: <ProtectedRoute requiredRole="admin"><TestChild /></ProtectedRoute>,
      })
    );

    // Role mismatch → children should not be rendered
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });
});
