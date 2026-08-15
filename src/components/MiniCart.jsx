import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from './CartContext';
import { Button } from './button.jsx';
import { getProductImageUrl } from '../lib/imageUrl';

export function MiniCart() {
  const { cart, totalItems, totalPrice, removeFromCart, updateQuantity } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative cursor-pointer bg-white text-primary hover:bg-gray-200 hover:shadow-md rounded-md px-4 py-2 inline-flex items-center justify-center transition-all">
          <ShoppingCart className="h-6 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </div>

      {isVisible && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden transition-all duration-200 origin-top-right">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({totalItems})
            </h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="p-6 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="p-2">
                {cart.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                       {item.image ? (
                         <img
                           src={getProductImageUrl(item.image)}
                           alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm font-bold text-gray-900">
                        R{item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-gray-700 hover:bg-gray-200 hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-gray-700 hover:bg-gray-200 hover:text-black transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.length > 5 && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    +{cart.length - 5} more item{cart.length - 5 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">
                  R{totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  className="w-full bg-white border-2 border-black hover:bg-black/90 hover:text-white text-black text-sm font-semibold h-10"
                >
                  <Link to="/cart" onClick={() => setIsVisible(false)}>
                    View Cart
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-black text-white hover:bg-black/90 text-sm font-semibold h-10"
                >
                  <Link to="/checkout" onClick={() => setIsVisible(false)}>
                    Checkout
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
