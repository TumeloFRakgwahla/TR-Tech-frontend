import { BrowserRouter as Router } from 'react-router-dom';
import { AdminPermissionsProvider } from '../contexts/AdminPermissionsContext';
import { AuthProvider } from './AuthContext';
import { AccountProvider } from './AccountContext';
import { CartProvider } from './CartContext';
import { AuthModalProvider } from './AuthModalContext';
import { WishlistProvider } from './WishlistContext';
import { Toaster } from 'sonner';

export function Providers({ children }) {
  return (
    <Router>
      <AuthProvider>
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
      </AuthProvider>
    </Router>
  );
}
