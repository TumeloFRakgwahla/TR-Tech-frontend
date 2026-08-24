import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount } from '../../components/AccountContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, Download, Loader2 } from 'lucide-react';

const statusConfig = {
  Pending: { color: 'bg-muted text-muted-foreground', label: 'Pending' },
  Processing: { color: 'bg-primary text-primary-foreground', label: 'Processing' },
  Shipped: { color: 'bg-secondary text-foreground', label: 'Shipped' },
  Delivered: { color: 'bg-green-100 text-green-700', label: 'Delivered' },
  Completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
  Cancelled: { color: 'bg-destructive/10 text-destructive', label: 'Cancelled' },
};

export function OrderDetailPage() {
  const { id } = useParams();
  const { orders, loading } = useAccount();
  const order = orders.find((o) => o._id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl text-center py-16">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/account/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.orderStatus] || statusConfig['Pending'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl">
        <div className="mb-6">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground mb-4">
            <Link to="/account/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
              </h1>
              <p className="text-muted-foreground mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Badge className={`${status.color} text-sm font-medium px-3 py-1`}>
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.condition || 'N/A'} x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-foreground">R{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">R{(order.subtotal || order.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-green-600">{(order.shippingCost || 0) === 0 ? 'Free' : `R${(order.shippingCost || 0).toFixed(2)}`}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">-R{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>R{(order.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {order.trackingNumber && (
              <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Tracking Information
                </h2>
                <p className="text-muted-foreground">Tracking Number: <span className="font-mono font-medium">{order.trackingNumber}</span></p>
                {order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm mt-2 inline-block">
                    Track Package
                  </a>
                )}
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Address
              </h2>
              {order.shippingAddress ? (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{order.customer?.name || ''}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                  <p>{order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No address information</p>
              )}
            </Card>

            <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Information
              </h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Method: <span className="font-medium text-foreground capitalize">{order.paymentMethod || 'N/A'}</span></p>
                <p>Status: <span className="font-medium text-foreground capitalize">{order.paymentStatus || 'N/A'}</span></p>
              </div>
            </Card>

            {order.notes && (
              <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold text-foreground mb-2">Order Notes</h2>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </Card>
            )}

            <Button
              variant="outline"
              className="w-full border-border text-foreground hover:bg-accent"
              onClick={() => toast.info('Invoice download coming soon')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;
