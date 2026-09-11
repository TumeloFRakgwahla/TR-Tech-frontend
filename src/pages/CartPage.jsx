/**
 * TR-Tech — Shopping Cart Page
 *
 * Displays the user's cart items with full management capabilities:
 * - Empty state with CTA to continue shopping
 * - Cart items list with image, name, condition badge, quantity controls, and price
 * - Order summary sidebar (desktop) and sticky bottom bar (mobile)
 * - Clear cart functionality with confirmation dialog
 *
 * Cart state is managed via CartContext which provides:
 * - cart: array of cart items
 * - totalItems: total count of items
 * - totalPrice: sum of all item prices * quantities
 * - removeFromCart, updateQuantity, clearCart: mutation functions
 *
 * Features:
 * - Responsive layout: stacked on mobile, sidebar on desktop
 * - Image fallback to logo on error
 * - Condition badges color-coded by product condition
 * - Quantity controls with min/max constraints
 * - Sticky mobile checkout bar positioned above BottomNav
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../components/CartContext';
import { Button } from '../components/button.jsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import Seo from '../components/Seo';
import { getProductImageUrl } from '../lib/imageUrl';
import { formatPrice } from '../lib/format';

// Color-coded badge styles for product condition (new/refurbished/used)
const conditionStyles = {
  new: 'bg-emerald-100 text-emerald-700',
  refurbished: 'bg-blue-100 text-blue-700',
  used: 'bg-amber-100 text-amber-700',
};

function CartPage() {
  const { cart, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const getShippingCost = () => {
    if (totalPrice >= 500) return 0;
    return totalPrice > 0 ? 50 : 0;
  };

  const shippingCost = getShippingCost();
  const orderTotal = totalPrice + shippingCost;

  const handleClearCart = () => {
    setClearDialogOpen(true);
  };

  const confirmClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
    setClearDialogOpen(false);
  };

  // Empty state: show message and CTA to browse products
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Seo title="Cart" description="Your shopping cart. Review items, update quantities, and proceed to a secure checkout." noindex />
        <div className="flex-1 flex items-center justify-center pt-16 md:pt-20 bg-muted/30 pb-20 md:pb-0">
          <div className="text-center p-8">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 mx-auto">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any products yet.</p>
            <Button asChild className="bg-primary-foreground text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary-foreground font-semibold transition-all min-h-[48px]">
              <Link to="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <Seo title="Cart" description="Your shopping cart. Review items, update quantities, and proceed to a secure checkout." noindex />
      <div className="flex-1 pt-16 md:pt-20 py-4 md:py-8 pb-32 md:pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Shopping Cart</h1>
            <span className="text-muted-foreground">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Two-column layout: items list (2/3) + order summary (1/3) on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {cart.map((item) => (
                <div
                  key={item._id || item.id}
                  className="bg-background rounded-lg shadow-sm border border-border p-3 md:p-4 flex gap-3"
                >
                  <Link
                    to={`/products/${item._id || item.id}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden"
                  >
                    {item.image ? (
                      <img
                         src={getProductImageUrl(item.image, { width: 300, quality: 80 })}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/TR_Tech_logo.png';
                        }}
                      />
                    ) : (
                      <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/products/${item._id || item.id}`}
                          className="font-semibold text-foreground line-clamp-2 text-sm md:text-base hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${conditionStyles[item.condition] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {item.condition}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all flex-shrink-0 -mr-2 -mt-2"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                      {/* Quantity controls + line total price */}
                      <div className="flex items-center justify-between mt-3 md:mt-4">
                        <div className="flex items-center border border-border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-1 hover:bg-muted rounded-l-md transition-all"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 text-sm font-medium min-w-[40px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-1 hover:bg-muted rounded-r-md transition-all"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(item.price)} each
                            </p>
                          )}
                        </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <button
                  onClick={handleClearCart}
                  className="text-destructive hover:text-destructive/80 text-sm font-medium flex items-center gap-2 min-h-[44px] px-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Desktop-only order summary sidebar, sticky on scroll */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-background rounded-lg shadow-sm border border-border p-6 sticky top-24">
                <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={`font-medium ${shippingCost === 0 ? 'text-emerald-600' : 'text-foreground'}`}>
                      {shippingCost === 0 ? (totalPrice > 0 ? 'Free' : '—') : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Free shipping on orders over R500
                    </p>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <span className="text-lg font-bold text-foreground">
                      {formatPrice(orderTotal)}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full bg-primary text-primary-foreground text-center py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors min-h-[48px] flex items-center justify-center"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/shop"
                  className="block w-full mt-3 bg-primary-foreground text-primary border border-border text-center py-3 rounded-md font-medium hover:bg-muted transition-colors min-h-[48px] flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Taxes calculated at checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Sticky bottom summary - positioned above bottom nav */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 bg-background border-t border-border p-3 z-30 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-foreground">{formatPrice(orderTotal)}</p>
            {shippingCost > 0 && (
              <p className="text-xs text-muted-foreground">incl. shipping</p>
            )}
          </div>
          <Link
            to="/checkout"
            className="flex-1 max-w-[200px] bg-primary text-primary-foreground text-center py-3 rounded-md font-semibold min-h-[48px] flex items-center justify-center"
          >
            Checkout
          </Link>
        </div>
      </div>

      <Footer />
      <BottomNav />

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Clear Cart</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)} className="border-slate-600 text-white hover:bg-slate-700">
              Cancel
            </Button>
            <Button onClick={confirmClearCart} className="bg-red-600 hover:bg-red-700">
              Clear Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CartPage;
