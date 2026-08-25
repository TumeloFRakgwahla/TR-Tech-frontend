import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { AdminAuthProvider } from './AdminAuthContext';
import { AccountProvider } from './AccountContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { AuthModalProvider } from './AuthModalContext';
import { Toaster } from 'sonner';

export function Providers({ children }) {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
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
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}
