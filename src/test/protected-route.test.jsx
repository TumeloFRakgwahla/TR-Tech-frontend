import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../components/AuthContext';

vi.mock('../components/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
  const mockUseAuth = vi.mocked(useAuth);

  const wrapper = ({ children, initialEntries = ['/'] }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );

  const TestChild = () => <div data-testid="child">Protected Content</div>;

  it('renders loading spinner when loading is true', () => {
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

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('renders children when authenticated with no required role', () => {
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

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('redirects to custom path when not authenticated', () => {
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

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('renders children when requiredRole matches user role', () => {
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

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('redirects when requiredRole does not match user role', () => {
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

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });
});
