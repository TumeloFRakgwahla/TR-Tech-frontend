/**
 * Sidebar Mobile Overlay Regression Suite
 * ---------------------------------------
 * Guards the admin-panel lockup that shipped in the responsive fix pass:
 *
 *   - `isOpen` defaulted to true, so the drawer rendered open on load.
 *   - The overlay render condition was flipped from `!isOpen` to `isOpen`,
 *     which combined with the open default meant a full-viewport
 *     `position: fixed; inset: 0; z-index: 40` backdrop on every page load.
 *   - The drawer referenced `admin-z-sidebar`, a class defined nowhere, so it
 *     sat at `z-index: auto` and was painted underneath its own backdrop.
 *
 * Net effect: the admin panel was unclickable at every viewport.
 *
 * NOTE: jsdom does not evaluate media queries or CSS cascade layers, so these
 * tests cover the render logic and the z-index token. The overlay's below-md
 * media scoping in index.css is covered by the Playwright assertion noted in
 * the audit report and cannot be asserted here.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarProvider, Sidebar, SidebarTrigger } from '../components/Sidebar';

const overlay = () => document.querySelector('.admin-mobile-overlay');

const renderSidebar = () =>
  render(
    <SidebarProvider>
      <Sidebar>
        <a href="/admin/products">Products</a>
      </Sidebar>
      <SidebarTrigger />
    </SidebarProvider>,
  );

const trigger = () => screen.getByRole('button', { name: /toggle sidebar/i });

describe('Sidebar mobile overlay', () => {
  it('renders no blocking overlay on initial load', () => {
    renderSidebar();
    // Guards against the isOpen default reverting to true.
    expect(overlay()).toBeNull();
  });

  it('keeps the drawer content reachable on load', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
  });

  it('shows the overlay only while the drawer is open', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(trigger());
    expect(overlay()).toBeInTheDocument();

    await user.click(overlay());
    expect(overlay()).toBeNull();
  });

  it('stacks the drawer above the overlay', () => {
    const { container } = renderSidebar();
    const drawer = container.querySelector('.admin-sidebar-container, div.fixed');

    // The overlay is z-40 (index.css). The drawer must outrank it explicitly;
    // an undefined class here silently drops the drawer behind the backdrop.
    expect(drawer.className).toContain('z-50');
    expect(drawer.className).not.toContain('admin-z-sidebar');
  });
});
