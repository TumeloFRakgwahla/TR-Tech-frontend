import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import Seo from '../components/Seo';
import { Check, Package, Phone, MapPin, CreditCard, Copy, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ordersAPI, paymentsAPI } from '../services/api';
import { toast } from 'sonner';

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reference = searchParams.get('reference');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentChecking, setPaymentChecking] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (reference && !orderId) {
        setPaymentChecking(true);
        try {
          const verifyResponse = await paymentsAPI.verifyPaystack(reference);
          if (verifyResponse.success && verifyResponse.data?.paid) {
            setPaymentVerified(true);
            toast.success('Payment verified successfully!');
            const verifiedOrderId = verifyResponse.data?.order?._id;
            if (verifiedOrderId) {
              const trackResponse = await ordersAPI.track({ orderId: verifiedOrderId });
              if (trackResponse.success) {
                setOrder(trackResponse.data);
              } else {
                setError(trackResponse.message || 'Order not found after verification');
              }
            }
          } else {
            setError(verifyResponse.message || 'Payment verification failed');
          }
        } catch (err) {
          setError(err.message || 'Failed to verify payment');
        } finally {
          setPaymentChecking(false);
          setLoading(false);
        }
        return;
      }

      if (!orderId) {
        setError('Order ID is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await ordersAPI.track({ orderId });
        if (response.success) {
          setOrder(response.data);
        } else {
          setError(response.message || 'Order not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, reference]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Order ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || paymentChecking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16 md:pt-20">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">
              {paymentChecking ? 'Verifying your payment...' : 'Loading order details...'}
            </p>
          </div>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16 md:pt-20 px-4">
          <div className="text-center max-w-md">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${reference && !paymentVerified ? 'bg-red-50' : 'bg-red-50'}`}>
              {reference && !paymentVerified ? (
                <XCircle className="h-8 w-8 text-red-500" />
              ) : (
                <Package className="h-8 w-8 text-red-500" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {reference && !paymentVerified ? 'Payment Failed' : 'Order Not Found'}
            </h1>
            <p className="text-gray-500 mb-6">
              {error || 'We could not find the order you are looking for.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {reference && !paymentVerified ? (
                <Link to="/checkout" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors min-h-[48px]">
                  Try Again
                </Link>
              ) : (
                <Link to="/track-order" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors min-h-[48px]">
                  Track Another Order
                </Link>
              )}
              <Link to="/shop" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors min-h-[48px]">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Seo
        title="Order Confirmation"
        description="Your TR-Tech order is confirmed. Track your order status and delivery progress in real time."
        noindex
      />
      <div className="flex-1 pt-16 md:pt-20 pb-20 md:pb-0 pb-safe">
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {reference && paymentVerified ? 'Payment Successful!' : 'Order Confirmed!'}
            </h1>
            <p className="text-muted-foreground">
              {reference && paymentVerified
                ? 'Your payment has been received and your order is being processed.'
                : 'Thank you for your order. Here are your order details.'}
            </p>
          </div>

          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 md:p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Order #{order._id}</h2>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="border-t border-border pt-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Order Items</h3>
              </div>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {item.condition} x{item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">
                      R{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">R{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Delivery Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Customer Name</p>
                  <p className="text-sm font-medium text-foreground">{order.customer?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="text-sm font-medium text-foreground">{order.customer?.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{order.customer?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="text-sm font-medium text-foreground capitalize">{order.paymentMethod}</p>
                </div>
              </div>
              {order.customer?.address && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Delivery Address</p>
                  <p className="text-sm text-foreground">
                    {order.customer.address.street}, {order.customer.address.city}, {order.customer.address.province} {order.customer.address.postalCode}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Payment & Delivery</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                  <p className="text-sm font-medium text-foreground capitalize">{order.paymentStatus}</p>
                  {paymentVerified && (
                    <p className="text-xs text-green-600 mt-1">Payment verified via Paystack</p>
                  )}
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Estimated Delivery</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-xs text-muted-foreground mb-1">Order Notes</p>
                <p className="text-sm text-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Save your order ID for tracking</p>
                <p className="text-xs text-blue-700 mb-2">
                  Use this ID to track your order status at any time.
                </p>
                <button
                  onClick={() => copyToClipboard(order._id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 rounded text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied!' : `Copy Order ID: ${order._id}`}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/track-order"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors min-h-[48px]"
            >
              <Package className="h-4 w-4" />
              Track Order
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors min-h-[48px]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
