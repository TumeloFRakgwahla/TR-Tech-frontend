import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, MapPin, CreditCard, ShoppingBag, ShieldCheck, Truck, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../components/CartContext';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { CheckoutModal } from '../components/CheckoutModal';

const steps = [
  { key: 'review', label: 'Review', icon: ShoppingBag },
  { key: 'details', label: 'Details', icon: MapPin },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'confirm', label: 'Confirm', icon: Check },
];

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

function OrderSummary({ compact = false }) {
  const { cart, totalPrice } = useCart();

  return (
    <div className={`bg-white rounded-xl border border-border ${compact ? 'p-4' : 'p-6'}`}>
      <h3 className={`font-semibold text-foreground mb-4 ${compact ? 'text-base' : 'text-lg'}`}>
        Order Summary
      </h3>

      <div className={`space-y-3 ${compact ? 'max-h-40' : 'max-h-60'} overflow-y-auto`}>
        {cart.map((item) => (
          <div key={item._id || item.id} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              R{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-border mt-4 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">R{totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-green-600">Calculated at checkout</span>
        </div>
        <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-primary">R{totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

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

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

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

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
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

            <OrderSummary />

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-3 bg-white rounded-lg border border-border">
                <ShieldCheck className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs font-medium">Secure</span>
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
