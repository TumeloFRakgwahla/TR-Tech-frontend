/**
 * Integration Test Suite
 * ----------------------
 * Verifies that the HomePage component renders correctly when wrapped with
 * all of its real context providers (no mocks for context state).
 *
 * Unlike the page-level tests which mock every context, this suite uses the
 * actual provider components, ensuring that the providers, the page, and
 * React Router work together without conflicts.
 *
 * Structure:
 *   - renderWithProviders: a helper that wraps any element with BrowserRouter
 *     and all four context providers in the correct nesting order
 *   - A single integration test that renders the HomePage and asserts a
 *     key heading is present
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext';
import { CartProvider } from '../components/CartContext';
import { WishlistProvider } from '../components/WishlistContext';
import { AuthModalProvider } from '../components/AuthModalContext';
import Home from '../pages/HomePage';

/**
 * Helper that renders a UI element wrapped in all application context providers.
 * This mirrors the provider tree used in the real app entry point, ensuring
 * components receive real context values (not mocks) during integration tests.
 *
 * @param {React.ReactNode} ui - The element to render
 * @returns The RenderResult from @testing-library/react
 */
const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AuthModalProvider>
              {ui}
            </AuthModalProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

/**
 * Test suite for HomePage integration with real context providers.
 * Unlike the isolated page tests, this verifies that all providers can
 * coexist and the HomePage renders without context-related errors.
 */
describe('HomePage integration', () => {
  // Smoke test: render the full provider tree with the HomePage and verify
  // a key heading is present — this catches provider wiring issues
  it('renders the homepage', () => {
    renderWithProviders(<Home />);
    expect(screen.getByRole('heading', { name: /Why Choose TR-Tech/i })).toBeDefined();
  });
});
