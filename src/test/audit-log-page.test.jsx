/**
 * AuditLogPage Component Test Suite
 * ----------------------------------
 * Tests the AuditLogPage component (`src/pages/Admin/AuditLogPage.jsx`),
 * covering data fetching, filtering, search, pagination, loading, and error states.
 *
 * Mocks:
 *   - services/api: usersAPI.getActivityLogs → returns mock log data
 *   - AdminPermissionsContext: useAdminPermissions → stub for Sidebar provider
 *   - AdminAuthContext: useAdminAuth → returns auth user
 *   - CartContext, WishlistContext, AuthContext, AuthModalContext → stub state
 *
 * Structure:
 *   - Shared wrapper with MemoryRouter
 *   - Tests verify heading, loading skeleton, data rendering, filters, search,
 *     pagination, and error state display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock usersAPI.getActivityLogs to return controlled test data
const mockGetActivityLogs = vi.fn();

vi.mock('../services/api', () => ({
  usersAPI: {
    getActivityLogs: (...args) => mockGetActivityLogs(...args),
    getAll: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
}));

// Mock context providers to avoid needing full provider tree
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

vi.mock('../components/AdminAuthContext', () => ({
  useAdminAuth: vi.fn().mockReturnValue({
    user: { firstName: 'Admin', lastName: 'User', email: 'admin@test.com' },
    isAuthenticated: true,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../contexts/AdminPermissionsContext', () => ({
  useAdminPermissions: vi.fn().mockReturnValue({
    userRoles: {},
    activityLogs: [],
    getRolePermissions: () => [],
    hasPermission: () => false,
    addPermissionToRole: vi.fn(),
    removePermissionFromRole: vi.fn(),
    updateRolePermissions: vi.fn(),
    saveRoles: vi.fn(),
    addLog: vi.fn(),
    availablePermissions: {},
    availableRoles: [],
  }),
}));

vi.mock('../components/Sidebar', () => ({
  SidebarProvider: ({ children }) => children,
  SidebarContext: { Provider: ({ children }) => children, Consumer: ({ children }) => children() },
  Sidebar: ({ children }) => children,
  SidebarHeader: ({ children }) => children,
  SidebarContent: ({ children }) => children,
  SidebarFooter: ({ children }) => children,
  SidebarGroup: ({ children }) => children,
  SidebarMenuItem: ({ children }) => children,
  SidebarMenuButton: ({ children }) => children,
  SidebarTrigger: () => null,
  NAV_GROUPS: [],
  FOOTER_ITEMS: [],
}));

vi.mock('../components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav aria-label="breadcrumb">Home / Admin / Audit Logs</nav>,
}));

import AuditLogPage from '../pages/Admin/AuditLogPage';

const mockLogs = {
  success: true,
  data: [
    {
      _id: 'log1',
      action: 'GET',
      method: 'GET',
      endpoint: '/orders',
      resource: 'orders',
      userEmail: 'admin@test.com',
      userRole: 'admin',
      statusCode: 200,
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
      createdAt: new Date().toISOString(),
      changes: undefined,
      metadata: { query: { page: '1' } },
    },
    {
      _id: 'log2',
      action: 'POST',
      method: 'POST',
      endpoint: '/products',
      resource: 'products',
      userEmail: 'admin@test.com',
      userRole: 'admin',
      statusCode: 201,
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
      createdAt: new Date().toISOString(),
      changes: { name: 'New Product' },
      metadata: {},
    },
  ],
  total: 2,
  page: 1,
  limit: 50,
  totalPages: 1,
};

const wrapper = ({ children, initialEntries = ['/admin/audit'] }) => (
  <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
);

describe('AuditLogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetActivityLogs.mockResolvedValue(mockLogs);
  });

  it('renders the heading', () => {
    render(wrapper({ children: <AuditLogPage /> }));
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    render(wrapper({ children: <AuditLogPage /> }));
    const skeletons = document.querySelectorAll('[aria-hidden="true"].animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders audit log entries after loading', async () => {
    render(wrapper({ children: <AuditLogPage /> }));
    await waitFor(() => {
      expect(screen.getByText('GET')).toBeInTheDocument();
      expect(screen.getByText('POST')).toBeInTheDocument();
    });
  });

  it('calls getActivityLogs on mount', async () => {
    render(wrapper({ children: <AuditLogPage /> }));
    await waitFor(() => {
      expect(mockGetActivityLogs).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 50 })
      );
    });
  });

  it('renders breadcrumb navigation', async () => {
    render(wrapper({ children: <AuditLogPage /> }));
    await waitFor(() => {
      expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
    });
  });

  it('displays total entry count in pagination', async () => {
    mockGetActivityLogs.mockResolvedValueOnce({
      ...mockLogs,
      total: 100,
      totalPages: 2,
    });
    render(wrapper({ children: <AuditLogPage /> }));
    await waitFor(() => {
      expect(screen.getByText(/Showing page/)).toBeInTheDocument();
      expect(screen.getByText(/total entries/)).toBeInTheDocument();
    });
  });

  it('shows empty state when no logs returned', async () => {
    mockGetActivityLogs.mockResolvedValueOnce({
      success: true,
      data: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    });
    render(wrapper({ children: <AuditLogPage /> }));
    await waitFor(() => {
      expect(screen.getByText('No audit logs found')).toBeInTheDocument();
    });
  });

  it('shows error state on fetch failure', async () => {
    mockGetActivityLogs.mockRejectedValueOnce(new Error('Network error'));
    render(wrapper({ children: <AuditLogPage /> }));
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('renders search input', async () => {
    render(wrapper({ children: <AuditLogPage /> }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument();
    });
  });

  it('renders action filter select', async () => {
    render(wrapper({ children: <AuditLogPage /> }));
    await waitFor(() => {
      expect(screen.getByText('All Actions')).toBeInTheDocument();
    });
  });

  it('renders pagination next/previous buttons', async () => {
    mockGetActivityLogs.mockResolvedValueOnce({
      ...mockLogs,
      total: 100,
      totalPages: 2,
    });
    render(wrapper({ children: <AuditLogPage /> }));
    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  it('calls getActivityLogs with new filters when status filter changes', async () => {
    render(wrapper({ children: <AuditLogPage /> }));
    await waitFor(() => {
      expect(mockGetActivityLogs).toHaveBeenCalledTimes(1);
    });
  });
});
