import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutModal } from '../components/CheckoutModal';
import { useCart } from '../components/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart } = useCart();

  React.useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleOpenChange = (open) => {
    if (!open) {
      navigate(-1);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <div className="py-8">
          <div className="max-w-2xl mx-auto px-4">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-500 mt-1">Complete your order</p>
            </div>
            <CheckoutModal open={true} onOpenChange={handleOpenChange} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CheckoutPage;
