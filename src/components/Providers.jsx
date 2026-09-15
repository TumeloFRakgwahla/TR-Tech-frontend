import { BrowserRouter as Router } from 'react-router-dom';
import { AdminPermissionsProvider } from '../contexts/AdminPermissionsContext';
import { AccountProvider } from './AccountContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { AuthModalProvider } from './AuthModalContext';
import { Toaster } from 'sonner';

export function Providers({ children }) {
  return (
    <Router>
      <AdminPermissionsProvider>
        <AccountProvider>
          <CartProvider>
            <AuthModalProvider>
              <WishlistProvider>
                <Toaster
                  position="top-right"
                  richColors
                  closeButton
                  toastOptions={{
                    class: 'sonner-toast',
                    duration: 4000,
                  }}
                />
                {children}
              </WishlistProvider>
            </AuthModalProvider>
          </CartProvider>
        </AccountProvider>
      </AdminPermissionsProvider>
    </Router>
  );
}
