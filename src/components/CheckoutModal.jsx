import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { AuthModal } from './AuthModal';
import { toast } from 'sonner';
import { ShoppingBag, User, MapPin, CreditCard, Check } from 'lucide-react';

export function CheckoutModal({ open, onOpenChange }) {
  const { user, isAuthenticated } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [step, setStep] = useState(isAuthenticated ? 'details' : 'auth'); // 'auth', 'details', 'payment', 'confirmation'
  const [loading, setLoading] = useState(false);

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

  React.useEffect(() => {
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
    }
  }, [open, isAuthenticated, user]);

  const handleAuthClick = () => {
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    setStep('details');
  };

  const handleDeliveryChange = (e) => {
    setDeliveryDetails({ ...deliveryDetails, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = () => {
    if (!deliveryDetails.name || !deliveryDetails.email || !deliveryDetails.phone || !deliveryDetails.street || !deliveryDetails.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    // Simulate order submission and redirect to WhatsApp
    setTimeout(() => {
      const orderDetails = cart
        .map((item) => `${item.name} (${item.condition}) x${item.quantity} - R${(item.price * item.quantity).toFixed(2)}`)
        .join('\n');

      const message = encodeURIComponent(
        `Hi! I'd like to place an order:\n\n` +
        `Customer: ${deliveryDetails.name}\n` +
        `Email: ${deliveryDetails.email}\n` +
        `Phone: ${deliveryDetails.phone}\n` +
        `Address: ${deliveryDetails.street}, ${deliveryDetails.city}, ${deliveryDetails.province} ${deliveryDetails.postalCode}\n\n` +
        `ORDER DETAILS:\n${orderDetails}\n\n` +
        `Total: R${totalPrice.toFixed(2)}\n\n` +
        `Notes: ${deliveryDetails.notes || 'None'}`
      );

      window.open(`https://wa.me/27791002552?text=${message}`, '_blank');
      toast.success('Order submitted! Redirecting to WhatsApp...');
      clearCart();
      setLoading(false);
      onOpenChange(false);
    }, 1500);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Checkout
            </DialogTitle>
            <DialogDescription>
              Complete your order by following these steps
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {['Auth', 'Details', 'Confirm'].map((s, index) => {
              const stepIndex = ['auth', 'details', 'confirmation'].indexOf(step);
              const isActive = stepIndex >= index;
              const isCurrent = stepIndex === index;

              return (
                <React.Fragment key={s}>
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isActive ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className={`ml-2 text-sm ${isCurrent ? 'font-medium' : ''}`}>
                      {s}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isActive ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Auth Step */}
          {step === 'auth' && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Sign in to checkout</h3>
                <p className="text-muted-foreground mb-6">
                  Register or login to checkout faster and track your orders
                </p>
              </div>

              <Button onClick={handleAuthClick} className="w-full" size="lg">
                <User className="h-4 w-4 mr-2" />
                Register / Login
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue as guest
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
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
                <h3 className="text-lg font-medium">Delivery Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={deliveryDetails.name}
                    onChange={handleDeliveryChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={deliveryDetails.email}
                    onChange={handleDeliveryChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={deliveryDetails.phone}
                    onChange={handleDeliveryChange}
                    placeholder="+27 82 123 4567"
                    required
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    name="street"
                    value={deliveryDetails.street}
                    onChange={handleDeliveryChange}
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={deliveryDetails.city}
                    onChange={handleDeliveryChange}
                    placeholder="Johannesburg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={deliveryDetails.postalCode}
                    onChange={handleDeliveryChange}
                    placeholder="2000"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    name="province"
                    value={deliveryDetails.province}
                    onChange={handleDeliveryChange}
                    placeholder="Gauteng"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={deliveryDetails.notes}
                    onChange={handleDeliveryChange}
                    placeholder="Any special instructions..."
                    className="w-full p-3 border rounded-md resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => setStep('confirmation')}
              >
                Continue to Confirm
              </Button>
            </div>
          )}

          {/* Confirmation Step */}
          {step === 'confirmation' && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Order Summary</h3>
              </div>

              {/* Cart Items */}
              <div className="border rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {item.condition} x{item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">R{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Delivery Info */}
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Delivery To:</h4>
                <p className="text-sm">{deliveryDetails.name}</p>
                <p className="text-sm">{deliveryDetails.street}</p>
                <p className="text-sm">
                  {deliveryDetails.city}, {deliveryDetails.province} {deliveryDetails.postalCode}
                </p>
                <p className="text-sm">{deliveryDetails.phone}</p>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">R{totalPrice.toFixed(2)}</span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('details')}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmitOrder}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place Order via WhatsApp'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}

export default CheckoutModal;
