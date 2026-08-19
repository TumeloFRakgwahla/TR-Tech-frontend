import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { AuthModal } from './AuthModal';
import { toast } from 'sonner';
import { ShoppingBag, User, MapPin, CreditCard, Check, Banknote, ArrowLeftRight, MoreHorizontal, ShieldCheck, Truck, Loader2 } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { createWhatsAppUrl, sanitizeWhatsAppInput } from '../lib/sanitize';
import { WHATSAPP_NUMBER } from '../constants';

export function CheckoutModal({ open, onOpenChange }) {
  const { user, isAuthenticated } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [step, setStep] = useState(isAuthenticated ? 'details' : 'auth');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [deliveryDetails, setDeliveryDetails] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    province: user?.address?.province || '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  useEffect(() => {
    if (open) {
      if (isAuthenticated) {
        setStep('details');
        setDeliveryDetails({
          name: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
          email: user?.email || '',
          phone: user?.phone || '',
          street: user?.address?.street || '',
          city: user?.address?.city || '',
          postalCode: user?.address?.postalCode || '',
          province: user?.address?.province || '',
          notes: '',
        });
      } else {
        setStep('auth');
      }
      setErrors({});
    }
  }, [open, isAuthenticated, user]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Full name is required';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Valid email is required';
      case 'phone':
        return value.trim() ? '' : 'Phone number is required';
      case 'street':
        return value.trim() ? '' : 'Street address is required';
      case 'city':
        return value.trim() ? '' : 'City is required';
      default:
        return '';
    }
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails({ ...deliveryDetails, [name]: value });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const validateDetails = () => {
    const newErrors = {};
    ['name', 'email', 'phone', 'street', 'city'].forEach(field => {
      newErrors[field] = validateField(field, deliveryDetails[field]);
    });
    setErrors(newErrors);
    return !Object.values(newErrors).some(err => err);
  };

  const handleAuthClick = () => {
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    setStep('details');
  }, []);

  const handleAuthClose = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const handleSubmitOrder = async () => {
    if (!cart || cart.length === 0) {
      toast.error('Your cart is empty. Add items before checkout.');
      return;
    }

    if (!validateDetails()) {
      toast.error('Please fix the errors above');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          product: item._id || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          condition: item.condition
        })),
        customer: {
          name: deliveryDetails.name,
          email: deliveryDetails.email,
          phone: deliveryDetails.phone,
          address: {
            street: deliveryDetails.street,
            city: deliveryDetails.city,
            postalCode: deliveryDetails.postalCode,
            province: deliveryDetails.province
          }
        },
        totalAmount: totalPrice,
        paymentMethod: paymentMethod,
        status: 'Pending',
        paymentStatus: 'Pending',
        notes: deliveryDetails.notes
      };

      const response = await ordersAPI.create(orderData);

      if (response.success) {
        const orderDetails = cart
          .map((item) => `${item.name} (${item.condition}) x${item.quantity} - R${(item.price * item.quantity).toFixed(2)}`)
          .join('\n');

        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
        const deliveryDate = estimatedDelivery.toLocaleDateString('en-ZA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const message = [
          `Hi! I'd like to place an order:`,
          ``,
          `Order ID: ${response.data._id}`,
          ``,
          `Customer: ${sanitizeWhatsAppInput(deliveryDetails.name)}`,
          `Email: ${sanitizeWhatsAppInput(deliveryDetails.email)}`,
          `Phone: ${sanitizeWhatsAppInput(deliveryDetails.phone)}`,
          `Address: ${sanitizeWhatsAppInput(deliveryDetails.street)}, ${sanitizeWhatsAppInput(deliveryDetails.city)}, ${sanitizeWhatsAppInput(deliveryDetails.province)} ${sanitizeWhatsAppInput(deliveryDetails.postalCode)}`,
          ``,
          `ORDER DETAILS:`,
          orderDetails,
          ``,
          `Payment Method: ${sanitizeWhatsAppInput(paymentMethod)}`,
          `Total: R${totalPrice.toFixed(2)}`,
          ``,
          `Estimated Delivery: ${deliveryDate}`,
          ``,
          `Notes: ${sanitizeWhatsAppInput(deliveryDetails.notes) || 'None'}`
        ].join('\n');

        window.open(createWhatsAppUrl(message, WHATSAPP_NUMBER), '_blank');
        toast.success('Order submitted successfully! Redirecting to WhatsApp...');
        clearCart();
        onOpenChange(false);
      } else {
        toast.error(response.message || 'Failed to save order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      if (error.message && error.message.toLowerCase().includes('insufficient stock')) {
        toast.error(error.message);
      } else {
        toast.error('Failed to submit order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'auth', label: 'Account', icon: User },
    { key: 'details', label: 'Details', icon: MapPin },
    { key: 'payment', label: 'Payment', icon: CreditCard },
    { key: 'confirmation', label: 'Confirm', icon: Check },
  ];

  const stepIndex = steps.findIndex(s => s.key === step);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white text-gray-900 border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <ShoppingBag className="h-5 w-5" />
            Checkout
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Complete your order by following these steps
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, index) => {
            const isActive = stepIndex >= index;
            const isCurrent = stepIndex === index;
            const Icon = s.icon;

            return (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isActive ? <Icon className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={`text-xs transition-colors ${isCurrent ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${isActive ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Auth Step */}
        {step === 'auth' && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in to checkout</h3>
              <p className="text-gray-500 mb-6">
                Register or login to checkout faster and track your orders
              </p>
            </div>

            <Button onClick={handleAuthClick} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
              <User className="h-4 w-4 mr-2" />
              Register / Login
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">
                  Or continue as guest
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              size="lg"
              onClick={() => setStep('details')}
            >
              Continue as Guest
            </Button>
          </div>
        )}

        {/* Delivery Details Step */}
        {step === 'details' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Delivery Details</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name" className="text-gray-700">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={deliveryDetails.name}
                  onChange={handleDeliveryChange}
                  placeholder="John Doe"
                  required
                  className={`bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={deliveryDetails.email}
                  onChange={handleDeliveryChange}
                  placeholder="john@example.com"
                  required
                  className={`bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={deliveryDetails.phone}
                  onChange={handleDeliveryChange}
                  placeholder="+27 82 123 4567"
                  required
                  className={`bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="street" className="text-gray-700">Street Address *</Label>
                <Input
                  id="street"
                  name="street"
                  value={deliveryDetails.street}
                  onChange={handleDeliveryChange}
                  placeholder="123 Main Street"
                  required
                  className={`bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary ${errors.street ? 'border-red-500' : ''}`}
                />
                {errors.street && <p className="text-xs text-red-600">{errors.street}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={deliveryDetails.city}
                  onChange={handleDeliveryChange}
                  placeholder="Johannesburg"
                  required
                  className={`bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary ${errors.city ? 'border-red-500' : ''}`}
                />
                {errors.city && <p className="text-xs text-red-600">{errors.city}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-gray-700">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={deliveryDetails.postalCode}
                  onChange={handleDeliveryChange}
                  placeholder="2000"
                  className="bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="province" className="text-gray-700">Province</Label>
                <Input
                  id="province"
                  name="province"
                  value={deliveryDetails.province}
                  onChange={handleDeliveryChange}
                  placeholder="Gauteng"
                  className="bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes" className="text-gray-700">Order Notes (Optional)</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={deliveryDetails.notes}
                  onChange={handleDeliveryChange}
                  placeholder="Any special instructions..."
                  className="w-full p-3 border border-gray-200 rounded-md resize-none bg-white text-gray-900 focus:border-primary focus:ring-primary"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setStep('auth')}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  if (validateDetails()) {
                    setStep('payment');
                  } else {
                    toast.error('Please fill in all required fields correctly');
                  }
                }}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Payment Method Step */}
        {step === 'payment' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { key: 'Cash', label: 'Cash', icon: Banknote },
                { key: 'Card', label: 'Card', icon: CreditCard },
                { key: 'Transfer', label: 'Transfer', icon: ArrowLeftRight },
                { key: 'Other', label: 'Other', icon: MoreHorizontal },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPaymentMethod(key)}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                    paymentMethod === key
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${paymentMethod === key ? 'text-primary' : 'text-gray-400'}`} />
                    <span className={`font-medium ${paymentMethod === key ? 'text-gray-900' : 'text-gray-600'}`}>{label}</span>
                  </div>
                  {paymentMethod === key && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setStep('details')}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setStep('confirmation')}
              >
                Continue to Confirm
              </Button>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <Check className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
            </div>

            {/* Cart Items */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto bg-white">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {item.condition} x{item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm text-gray-900">R{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Delivery Info */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-white">
              <h4 className="font-semibold flex items-center gap-2 text-gray-900">
                <MapPin className="h-4 w-4 text-primary" />
                Delivery To:
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{deliveryDetails.name}</p>
                <p>{deliveryDetails.street}</p>
                <p>{deliveryDetails.city}, {deliveryDetails.province} {deliveryDetails.postalCode}</p>
                <p>{deliveryDetails.phone}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-white">
              <h4 className="font-semibold flex items-center gap-2 text-gray-900">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment Method:
              </h4>
              <p className="text-sm capitalize text-gray-600">{paymentMethod}</p>
            </div>

            {/* Estimated Delivery */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-gray-900">Estimated Delivery</p>
                <p className="text-xs text-gray-500">
                  {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">R{totalPrice.toFixed(2)}</span>
            </div>

            {/* Trust Signals */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Secure Checkout</span>
              </div>
              <span>|</span>
              <span>SSL Encrypted</span>
              <span>|</span>
              <span>WhatsApp Support</span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setStep('payment')}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSubmitOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order via WhatsApp'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={handleAuthClose} 
        onSuccess={handleAuthSuccess} 
      />
    </Dialog>
  );
}

export default CheckoutModal;
