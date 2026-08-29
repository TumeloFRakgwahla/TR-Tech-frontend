/**
 * OrdersPage.jsx
 *
 * Purpose: Display a searchable list of the authenticated user's order history.
 * Structure:
 *   - statusConfig: maps order status to Tailwind badge classes
 *   - OrdersPage component: main page with search and order cards
 *
 * Features:
 * - Pulls orders from AccountContext
 * - Searchable by order number
 * - Shows status badges, order date, item count, and total amount
 * - Links each order card to its detail page (/account/orders/:id)
 * - Loading state with spinner, empty state with CTA to shop
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from '../../components/AccountContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';

// Maps each order status to Tailwind CSS classes for badge styling
const statusConfig = {
  Pending: 'bg-muted text-muted-foreground',
  Processing: 'bg-primary text-primary-foreground',
  Shipped: 'bg-secondary text-foreground',
  Delivered: 'bg-green-100 text-green-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-destructive/10 text-destructive',
};

export function OrdersPage() {
  // Get orders array and loading flag from account context
  const { orders, loading } = useAccount();
  // Local state for the search input
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders by search query (matches order number)
  const filteredOrders = orders.filter((order) => {
    const orderNumber = (order.orderNumber || order._id || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return orderNumber.includes(q);
  });

  // Loading state: spinner while orders are being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Order History</h1>
          <p className="text-lg text-muted-foreground mt-1">Track and manage your orders</p>
        </div>

        {/* Search input for filtering orders */}
        <Card className="p-4 mb-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-border text-foreground"
            />
          </div>
        </Card>

        {filteredOrders.length === 0 ? (
          /* Empty state: no orders found for the current search / no orders at all */
          <Card className="p-12 text-center bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try adjusting your search' : "You haven't placed any orders yet"}
            </p>
            {/* CTA only shown when there is no active search */}
            {!searchQuery && (
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/shop">Start Shopping</Link>
              </Button>
            )}
          </Card>
        ) : (
          /* Order list: one card per order */
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order._id} className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Shopping bag icon in a muted rounded box */}
                    <div className="p-3 bg-muted rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      {/* Order number: uses human-friendly orderNumber or falls back to last 6 chars of _id */}
                      <h3 className="font-semibold text-foreground">
                        Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </h3>
                      {/* Order date formatted for South Africa locale */}
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {/* Item count with pluralization */}
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {/* Right column: status badge and total amount */}
                  <div className="text-right">
                    <Badge className={statusConfig[order.orderStatus] || 'bg-muted text-muted-foreground'}>
                      {order.orderStatus}
                    </Badge>
                    <p className="text-lg font-bold text-foreground mt-2">R{(order.totalAmount || 0).toFixed(2)}</p>
                  </div>
                </div>
                {/* Footer with link to order detail page */}
                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                  <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                    <Link to={`/account/orders/${order._id}`} className="flex items-center gap-1">
                      View Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
