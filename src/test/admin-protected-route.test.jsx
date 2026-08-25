import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminProtectedRoute } from '../components/AdminProtectedRoute';
import { useAdminAuth } from '../components/AdminAuthContext';

vi.mock('../components/AdminAuthContext', () => ({
  useAdminAuth: vi.fn(),
}));

describe('AdminProtectedRoute', () => {
  const mockUseAdminAuth = vi.mocked(useAdminAuth);

  const wrapper = ({ children, initialEntries = ['/admin'] }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );

  const TestChild = () => <div data-testid="child">Admin Content</div>;

  it('renders loading spinner when loading is true', () => {
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

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('redirects to /admin/login when not authenticated', () => {
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

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('renders children when authenticated as admin', () => {
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

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects when authenticated but role is not admin', () => {
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

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('redirects to custom path when not authenticated', () => {
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

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });
});
