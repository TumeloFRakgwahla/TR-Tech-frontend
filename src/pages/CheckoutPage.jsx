/**
 * TR-Tech — Checkout Page
 *
 * Multi-step checkout flow with progress indicator:
 * Step 1 (review) — Order summary with trust signals, proceed button
 * Step 2 (details) — Authentication modal (CheckoutModal) for collecting user details
 *
 * Features:
 * - Progress bar with step indicators (mobile: simplified, desktop: full)
 * - Redirects to cart if cart is empty
 * - Order summary component reusable in sidebar/compact modes
 * - Trust signals (secure, fast delivery, quality) for conversion confidence
 *
 * State management:
 * - currentStep tracks which step the user is on
 * - cart state from CartContext to validate checkout eligibility
 * - CheckoutModal handles auth/details collection
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, MapPin, CreditCard, ShoppingBag, ShieldCheck, Truck, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../components/CartContext';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { CheckoutModal } from '../components/CheckoutModal';

// Step definitions for the checkout progress bar
const steps = [
  { key: 'review', label: 'Review', icon: ShoppingBag },
  { key: 'details', label: 'Details', icon: MapPin },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'confirm', label: 'Confirm', icon: Check },
];

// Progress bar showing current checkout step (simplified on mobile, full steps on desktop)
function ProgressBar({ currentStep }) {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="bg-white border-b border-border sticky top-16 md:top-20 z-20">
      <div className="max-w-3xl mx-auto px-4 py-3">
        {/* Mobile: Simplified progress */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Step {currentIndex + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {steps[currentIndex].label}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop: Full step indicator */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs ${isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${index < currentIndex ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Shipping threshold constant (free shipping kick-in)
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 50;

// Computes shipping cost and grand total from a given subtotal
const usePriceBreakdown = (subtotal) => {
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const orderTotal = subtotal + shippingCost;
  return { shippingCost, orderTotal };
};

// Item list for the middle of the checkout page
function CartItemsList({ compact = false }) {
  const { cart, removeFromCart, updateQuantity } = useCart();

  return (
    <div className={`bg-white rounded-xl border border-border ${compact ? 'p-4' : 'p-6'}`}>
      <h3 className={`font-semibold text-foreground mb-4 ${compact ? 'text-base' : 'text-lg'}`}>
        Cart Items
      </h3>

      <div className={`space-y-3 ${compact ? 'max-h-48' : 'max-h-60'} overflow-y-auto`}>
        {cart.map((item) => (
          <div key={item._id || item.id} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                  className="h-5 w-5 rounded-full bg-muted hover:bg-accent flex items-center justify-center text-xs font-medium disabled:opacity-40"
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                  className="h-5 w-5 rounded-full bg-muted hover:bg-accent flex items-center justify-center text-xs font-medium"
                >
                  +
                </button>
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground">
              R{(item.price * item.quantity).toFixed(2)}
            </p>
            <button
              type="button"
              onClick={() => removeFromCart(item._id || item.id)}
              className="ml-1 text-muted-foreground hover:text-destructive text-xs"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
function OrderSummary({ compact = false }) {
  const { totalPrice } = useCart();
  const { shippingCost, orderTotal } = usePriceBreakdown(totalPrice);

  return (
    <div className={`bg-white rounded-xl border border-border ${compact ? 'p-4' : 'p-6'}`}>
      <h3 className={`font-semibold text-foreground mb-4 ${compact ? 'text-base' : 'text-lg'}`}>
        Order Summary
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">R{totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : 'text-foreground'}`}>
            {shippingCost === 0 ? (totalPrice > 0 ? 'Free' : '—') : `R${shippingCost.toFixed(2)}`}
          </span>
        </div>
        {shippingCost > 0 && (
          <p className="text-xs text-muted-foreground">
            Free shipping on orders over R500
          </p>
        )}
        <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-primary">R{orderTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// Checkout step wrapper that handles authentication modal
// If user is not authenticated, modal stays open and closing it triggers onBack
function CheckoutStep({ onBack }) {
  const { isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setModalOpen(true);
    }
  }, [isAuthenticated]);

  const handleModalClose = (open) => {
    setModalOpen(open);
    if (!open && onBack) {
      onBack();
    }
  };

  return (
    <div className="py-4">
      <CheckoutModal open={modalOpen} onOpenChange={handleModalClose} />
    </div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [currentStep, setCurrentStep] = useState('review');

  // Redirect to cart if no items present
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Don't render anything while redirecting
  if (cart.length === 0) {
    return null;
  }

  const handleProceed = () => {
    setCurrentStep('details');
  };

  const handleBack = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <ProgressBar currentStep={currentStep} />

      <main className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {currentStep === 'review' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Review Your Order</h1>
              <Link
                to="/cart"
                className="text-sm font-medium text-primary hover:text-primary/80 min-h-[44px] flex items-center"
              >
                Edit Cart
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items list — fills the middle on larger screens */}
              <div className="lg:col-span-2">
                <CartItemsList />
              </div>

              {/* Price summary + action buttons — sticky on the right */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-4">
                  <OrderSummary />
                  <div className="flex gap-3">
                    <button
                      onClick={handleBack}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-border rounded-lg font-medium text-foreground hover:bg-muted transition-colors min-h-[48px]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Cart
                    </button>
                    <button
                      onClick={handleProceed}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors min-h-[48px]"
                    >
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg border border-border">
                <ShieldCheck className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs font-medium">Secure Checkout</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg border border-border">
                <Truck className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs font-medium">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg border border-border">
                <Check className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs font-medium">Quality</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'details' && (
          <CheckoutStep
            step={currentStep}
            onBack={() => setCurrentStep('review')}
          />
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default CheckoutPage;
