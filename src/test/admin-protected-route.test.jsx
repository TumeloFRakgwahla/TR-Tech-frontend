/**
 * AdminProtectedRoute Component Test Suite
 * -----------------------------------------
 * Tests the AdminProtectedRoute component (`src/components/AdminProtectedRoute.jsx`),
 * which acts as a route guard for admin-only pages.
 *
 * This component checks the AdminAuthContext for authentication and role.
 * It renders three possible outputs:
 *   1. A loading spinner while auth state is being determined
 *   2. A redirect to the login page if not authenticated or role is wrong
 *   3. The children (protected content) if authenticated as admin
 *
 * Strategy:
 *   Mocks only AdminAuthContext (not the page-level mocks), since this
 *   component is tested in isolation. The wrapper uses MemoryRouter with
 *   initialEntries so we can test redirect behavior.
 *
 * Structure:
 *   - Shared wrapper with configurable initial route entries
 *   - TestChild: a simple element rendered inside ProtectedRoute for assertion
 *   - Tests for: loading state, unauthenticated redirect, authenticated
 *     admin render, non-admin role redirect, custom redirect path
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminProtectedRoute } from '../components/AdminProtectedRoute';
import { useAdminAuth } from '../components/AdminAuthContext';

// Mock AdminAuthContext to control auth state per test
vi.mock('../components/AdminAuthContext', () => ({
  useAdminAuth: vi.fn(),
}));

/**
 * AdminProtectedRoute test suite.
 * Tests route guarding logic for admin-only pages: loading, auth gates,
 * role verification, and redirect behavior.
 */
describe('AdminProtectedRoute', () => {
  // Get a typed reference to the mocked useAdminAuth function
  const mockUseAdminAuth = vi.mocked(useAdminAuth);

  /**
   * Shared router wrapper.
   * @param {Object} props
   * @param {React.ReactNode} props.children - elements to render inside the router
   * @param {string[]} props.initialEntries - starting route paths for MemoryRouter
   */
  const wrapper = ({ children, initialEntries = ['/admin'] }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );

  // A simple test component rendered inside the protected route to verify
  // whether children are rendered or not
  const TestChild = () => <div data-testid="child">Admin Content</div>;

  it('renders loading spinner when loading is true', () => {
    // While loading, the component should show a spinner and not render children
    mockUseAdminAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: true,
    });

    const { container } = render(
      wrapper({
        children: <AdminProtectedRoute><TestChild /></AdminProtectedRoute>,
      })
    );

    // The loading spinner uses Tailwind's animate-spin class
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    // Children should NOT be rendered while loading
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('redirects to /admin/login when not authenticated', () => {
    // Not authenticated and not loading — should redirect to admin login page
    mockUseAdminAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    render(
      wrapper({
        children: <AdminProtectedRoute><TestChild /></AdminProtectedRoute>,
      })
    );

    // After redirect, the child content should not be present
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('renders children when authenticated as admin', () => {
    // Authenticated with admin role — should render the protected content
    mockUseAdminAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'admin' },
      loading: false,
    });

    render(
      wrapper({
        children: <AdminProtectedRoute><TestChild /></AdminProtectedRoute>,
      })
    );

    // Child content should be visible
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects when authenticated but role is not admin', () => {
    // Authenticated as a regular customer — should redirect since only admins
    // are allowed to access admin pages
    mockUseAdminAuth.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'customer' },
      loading: false,
    });

    render(
      wrapper({
        children: <AdminProtectedRoute><TestChild /></AdminProtectedRoute>,
      })
    );

    // Non-admin users should be redirected away from admin routes
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('redirects to custom path when not authenticated', () => {
    // Not authenticated — the redirectTo prop allows customizing the login
    // path, useful for different app sections with different login pages
    mockUseAdminAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    render(
      wrapper({
        children: <AdminProtectedRoute redirectTo="/custom-login"><TestChild /></AdminProtectedRoute>,
      })
    );

    // When redirectTo is specified, the redirect goes to that path instead
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });
});
