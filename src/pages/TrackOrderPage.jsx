import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import Seo from '../components/Seo';
import { Search, Package, Phone, ClipboardList, ArrowLeft } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const params = {};
      const trimmedOrderId = orderId.trim();
      const trimmedPhone = phone.trim();

      if (trimmedOrderId) {
        if (!/^[a-fA-F0-9]{24}$/.test(trimmedOrderId)) {
          setError('Invalid order ID format. Please enter a 24-character ID.');
          setLoading(false);
          return;
        }
        params.orderId = trimmedOrderId;
      }
      if (trimmedPhone) {
        params.phone = trimmedPhone;
      }

      if (!params.orderId && !params.phone) {
        setError('Please enter an order ID or phone number.');
        setLoading(false);
        return;
      }

      const response = await ordersAPI.track(params);

      if (response.success) {
        setOrder(response.data);
      } else {
        setError(response.message || 'Order not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to track order');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Seo
        title="Track Order"
        description="Track your TR-Tech order status by order ID or phone number. Enter your details to get real-time updates on your repair or product order."
      />
      <div className="flex-1 pt-16 md:pt-20 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground min-h-[44px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your order ID or phone number to check your order status</p>
          </div>

          <form onSubmit={handleTrack} className="bg-card text-card-foreground rounded-lg shadow-md p-6 md:p-8 mb-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium mb-2">
                  Order ID
                </label>
                <div className="relative">
                  <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="orderId"
                    type="text"
                    value={orderId}
                     onChange={(e) => setOrderId(e.target.value)}
                     placeholder="e.g., 65a1b2c3d4e5f6a7b8c9d0e1"
                     className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                     pattern="[a-fA-F0-9]{24}"
                     maxLength={24}
                     title="Enter a valid 24-character order ID"
                   />
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">or</div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., 064 510 4733"
                    className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (!orderId.trim() && !phone.trim())}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Track Order
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {order && (
            <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Order Found</h2>
                  <p className="text-sm text-muted-foreground">Order ID: {order._id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="text-sm font-medium text-foreground">{order.customer?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium text-foreground">{order.customer?.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground">{order.customer?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Payment</p>
                    <p className="text-sm font-medium text-foreground">{order.paymentMethod}</p>
                  </div>
                </div>

                {order.customer?.address && (
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery Address</p>
                    <p className="text-sm font-medium text-foreground">
                      {order.customer.address.street}, {order.customer.address.city}, {order.customer.address.province} {order.customer.address.postalCode}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <h3 className="font-semibold text-foreground mb-3">Order Items</h3>
                <div className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
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
                  <span className="text-lg font-bold text-primary">R{order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>

              {order.notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Order Notes</p>
                  <p className="text-sm text-foreground">{order.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
