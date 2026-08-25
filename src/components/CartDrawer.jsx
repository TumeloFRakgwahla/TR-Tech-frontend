import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/sheet';
import { Button } from './button.jsx';
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, Truck, Edit } from 'lucide-react';
import { useCartState } from './CartContext';
import { toast } from 'sonner';
import { CheckoutModal } from './CheckoutModal';
import { Link } from 'react-router-dom';
import { getProductImageUrl } from '../lib/imageUrl';

const conditionStyles = {
  new: 'bg-green-100 text-green-700',
  refurbished: 'bg-blue-100 text-blue-700',
  used: 'bg-amber-100 text-amber-700',
};

export function CartDrawer({ children }) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart, syncing } = useCartState();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setCheckoutOpen(true);
  };

  const handleClearCart = () => {
    if (clearConfirm) {
      clearCart();
      setClearConfirm(false);
      toast.success('Cart cleared');
    } else {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
    }
  };

  const subtotal = totalPrice;
  const shippingThreshold = 500;
  const remainingForFreeShipping = Math.max(0, shippingThreshold - subtotal);
  const progressPercentage = Math.min(100, (subtotal / shippingThreshold) * 100);

  return (
    <React.Fragment>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="fixed right-0 top-0 z-50 h-full w-full sm:w-[420px] border-l bg-background shadow-lg duration-200 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right flex flex-col">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 pb-4 border-b text-center">
            <DialogTitle className="text-xl font-bold tracking-tight">Shopping Cart</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
              {syncing && <span className="ml-2 text-xs text-primary">(Syncing...)</span>}
            </DialogDescription>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mb-6">Looks like you haven't added any products yet.</p>
                <Button variant="outline" asChild>
                  <Link to="/shop">Continue Shopping</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Free Shipping Banner */}
                {remainingForFreeShipping > 0 && (
                  <div className="flex-shrink-0 mx-4 mt-4 p-3 bg-muted/80 rounded-lg border border-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">
                        Add R{remainingForFreeShipping.toFixed(2)} more for <span className="text-green-600 font-semibold">FREE shipping</span>
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {remainingForFreeShipping === 0 && (
                  <div className="flex-shrink-0 mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-medium text-green-700">You qualify for FREE shipping!</p>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto py-4 px-4">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item._id || item.id}
                        className="flex gap-3 bg-muted/50 p-3 rounded-lg border border-muted"
                      >
                        {/* Product Image */}
                         <div className="w-20 h-20 bg-background rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.image ? (
                              <img
                                src={getProductImageUrl(item.image)}
                                alt={item.name}
                               className="w-full h-full object-cover"
                               onError={(e) => {
                                 e.target.onerror = null;
                                 e.target.src = '/TR_Tech_logo.png';
                               }}
                             />
                           ) : (
                             <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                           )}
                         </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm leading-tight line-clamp-2">{item.name}</h4>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize flex-shrink-0 ${conditionStyles[item.condition] || 'bg-gray-100 text-gray-700'}`}>
                                {item.condition}
                              </span>
                            </div>
                            <p className="font-bold text-primary text-base">R{item.price.toFixed(2)}</p>
                          </div>

                          {/* Quantity Controls & Actions */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 bg-background rounded-md p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 p-0 hover:bg-muted"
                                disabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 p-0 hover:bg-muted"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold mr-2">
                                R{(item.price * item.quantity).toFixed(2)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                aria-label="Edit item"
                              >
                                <Link to={`/products/${item._id || item.id}`} onClick={() => {}}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 pt-4 border-t space-y-4 bg-background">
                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 px-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Truck className="h-3 w-3" />
                      <span>Fast Delivery</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="px-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                      <span className="text-2xl font-bold text-primary">R{totalPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Shipping and taxes calculated at checkout</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 p-4 pt-0">
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-white border-2 border-black hover:bg-black/90 hover:text-white text-black h-12 text-base font-semibold"
                    >
                      Proceed to Checkout
                    </Button>
                    <Button
                      onClick={handleClearCart}
                      variant={clearConfirm ? "destructive" : "outline"}
                      className={`w-full h-10 ${clearConfirm ? '' : 'bg-white border-2 border-black hover:bg-black/90 hover:text-white text-black'}`}
                    >
                      {clearConfirm ? 'Confirm Clear Cart' : 'Clear Cart'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </React.Fragment>
  );
}

export default CartDrawer;
