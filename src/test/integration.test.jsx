import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext';
import { CartProvider } from '../components/CartContext';
import { WishlistProvider } from '../components/WishlistContext';
import { AuthModalProvider } from '../components/AuthModalContext';
import Home from '../pages/HomePage';

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

describe('HomePage integration', () => {
  it('renders the homepage', () => {
    renderWithProviders(<Home />);
    expect(screen.getByRole('heading', { name: /Why Choose TR-Tech/i })).toBeDefined();
  });
});
