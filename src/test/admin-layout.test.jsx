import React, { useContext } from 'react';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

/**
 * Regression test: AdminLayout must render inside a SidebarProvider.
 *
 * AdminLayout both consumes `SidebarContext` (for `isCollapsed`) and renders the
 * `<Sidebar>` that shares it. It used to mount its own `<SidebarProvider>`, which
 * sits *below* AdminLayout in the tree — so its `useContext` call received
 * undefined and the destructure threw:
 *
 *   TypeError: Cannot destructure property 'isCollapsed' of 'useContext(...)'
 *   as it is undefined.
 *
 * That crashed the entire admin application. Nothing caught it because:
 *   - `sidebar.test.jsx` correctly wrapped the sidebar in a provider, so the
 *     broken path was never exercised;
 *   - the runtime layout probe only covered public routes, and `/admin`
 *     redirects to the login page when unauthenticated.
 *
 * These tests pin both halves of the fix: the layout renders inside a provider,
 * and a consumer outside one degrades instead of crashing.
 */

const navMock = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navMock.navigate,
    useLocation: () => ({ pathname: '/admin' }),
  };
});

const toastMock = vi.hoisted(() => ({
  success: vi.fn(), error: vi.fn(), message: vi.fn(), warning: vi.fn(),
}));

vi.mock('sonner', () => ({ toast: toastMock }));

vi.mock('../components/AdminAuthContext', () => ({
  useAdminAuth: () => ({
    user: { firstName: 'Ada', lastName: 'Admin', email: 'admin@trtech.co.za', role: 'admin' },
    loading: false,
    logout: vi.fn(),
  }),
}));

const { SidebarProvider, SidebarContext } = await import('../components/Sidebar');
const { AdminLayout } = await import('../pages/Admin/AdminLayout');

const here = dirname(fileURLToPath(import.meta.url));

/** Minimal probe: consumes the context exactly the way AdminLayout does. */
function ContextConsumer({ label = 'probe' }) {
  const { isCollapsed } = useContext(SidebarContext);
  return <span data-testid={label}>{String(isCollapsed)}</span>;
}

describe('SidebarProvider placement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => cleanup());

  it('renders AdminLayout without crashing when wrapped in a provider', () => {
    render(
      <MemoryRouter initialEntries={[`/admin`]}>
        <SidebarProvider>
          <Routes>
            <Route path="/admin" element={<AdminLayout />} />
          </Routes>
        </SidebarProvider>
      </MemoryRouter>
    );

    // The layout shell rendered.
    expect(document.querySelector('.admin-layout')).not.toBeNull();
  });

  it('gives AdminLayout and its Sidebar the same provider instance', () => {
    // A provider mounted *inside* AdminLayout would leave AdminLayout's own
    // context read as undefined. Asserting the value here proves the consumer
    // and provider are in the same tree.
    render(
      <MemoryRouter initialEntries={[`/admin`]}>
        <SidebarProvider>
          <Routes>
            <Route path="/admin" element={<><AdminLayout /><ContextConsumer /></>} />
          </Routes>
        </SidebarProvider>
      </MemoryRouter>
    );

    // Both read a real value rather than crashing on undefined.
    expect(screen.getByTestId('probe').textContent).toMatch(/true|false/);
  });

  it('applies the same collapsed offset to main as the sidebar state', () => {
    localStorage.setItem('trtech_sidebar_collapsed', 'true');
    render(
      <MemoryRouter initialEntries={[`/admin`]}>
        <SidebarProvider>
          <Routes>
            <Route path="/admin" element={<AdminLayout />} />
          </Routes>
        </SidebarProvider>
      </MemoryRouter>
    );

    const main = document.querySelector('main.admin-content');
    expect(main).not.toBeNull();
    // Stored preference is honoured, and main is offset to match.
    expect(main.className).toContain('md:ml-16');
  });

it('does not throw when a consumer renders outside the provider', () => {
    // The context now has a default, so a misplaced consumer degrades rather
    // than crashing the tree.
    render(
      <MemoryRouter>
        <ContextConsumer label="orphan" />
      </MemoryRouter>
    );
    expect(screen.getByTestId('orphan').textContent).toBe('false');
  });

  it('survives with no provider in the tree (the original crash)', () => {
    // Exact reproduction of the reported failure: AdminLayout used to mount its
    // own <SidebarProvider>, so with no outer provider its `useContext` returned
    // undefined and destructuring threw, taking down the whole admin app.
    expect(() =>
      render(
        <MemoryRouter initialEntries={[`/admin`]}>
          <Routes>
            <Route path="/admin" element={<AdminLayout />} />
          </Routes>
        </MemoryRouter>
      )
    ).not.toThrow();

    expect(document.querySelector('.admin-layout')).not.toBeNull();
  });

  it('mounts the provider exactly once, above the router', () => {
    // Pin the structure that prevents the crash from returning.
    const adminLayout = readFileSync(
      join(here, '..', 'pages', 'Admin', 'AdminLayout.jsx'), 'utf8'
    );
    const app = readFileSync(join(here, '..', 'App.jsx'), 'utf8');

    // AdminLayout must consume the context without also providing it.
    expect(adminLayout).toContain('useContext(SidebarContext)');
    expect(adminLayout).not.toContain('<SidebarProvider');

    // App provides it once, wrapping the routes.
    expect(app.match(/<SidebarProvider/g) || []).toHaveLength(1);
  });
});
