import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/sheet';
import { Button } from './button.jsx';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from './CartContext';
import { toast } from 'sonner';
import { CheckoutModal } from './CheckoutModal';

export function CartDrawer({ children }) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <React.Fragment>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="fixed right-0 top-0 z-50 h-full w-[90vw] max-w-[380px] border-l bg-background shadow-lg duration-200 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right flex flex-col">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 pb-4 border-b !text-center">
            <DialogTitle className="text-xl font-semibold">Shopping Cart</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
            </DialogDescription>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {cart.length === 0 ? (
              // Empty Cart State
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mb-4">Looks like you haven't added any products yet.</p>
                <Button variant="outline" onClick={() => window.location.href = '/shop'}>
                  Browse Products
                </Button>
              </div>
            ) : (
              // Cart Items
              <>
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex gap-3 bg-muted/50 p-3 rounded-lg border border-muted"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-background rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm leading-tight line-clamp-2">{item.name}</h4>
                            <p className="text-xs text-muted-foreground capitalize">{item.condition}</p>
                            <p className="font-bold text-primary text-base">R{item.price.toFixed(2)}</p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 bg-background rounded-md p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-6 w-6 p-0 hover:bg-muted"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-6 w-6 p-0 hover:bg-muted"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 pt-4 border-t space-y-4 bg-background">
                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                    <span className="text-lg font-bold text-primary">R{totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2 p-3">
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-white border-2 border-black  hover:bg-black/90 hover:text-white text-black h-11"
                    >
                      Checkout
                    </Button>
                    <Button
                      onClick={clearCart}
                      variant="outline"
                      className="w-full bg-white border-2 border-black  hover:bg-black/90 hover:text-white text-black h-10"
                    >
                      Clear Cart
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
