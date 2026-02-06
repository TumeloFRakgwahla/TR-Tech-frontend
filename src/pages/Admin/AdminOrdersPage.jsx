import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '../../components/Sidebar';
import { Button } from '../../components/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/badge';
import { Textarea } from '../../components/ui/textarea';
import { Search, Eye, Phone, Mail, MapPin, Plus } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { Separator } from '../../components/ui/separator';
import { CreateOrderForm } from '../../components/admin/CreateOrderForm';

const statusColors = {
  Pending: 'bg-yellow-600',
  Processing: 'bg-blue-600',
  Shipped: 'bg-purple-600',
  Delivered: 'bg-green-600',
  Completed: 'bg-green-600',
  Cancelled: 'bg-red-600',
};

const paymentStatusColors = {
  Cash: 'bg-blue-600',
  Card: 'bg-green-600',
  Transfer: 'bg-purple-600',
  Other: 'bg-gray-600',
};

export function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getAll();
        if (response.success) {
          setOrders(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order._id?.slice(-6) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.paymentMethod === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await ordersAPI.updateStatus(orderId, newStatus);
      if (response.success) {
        setOrders(
          orders.map((order) =>
            (order._id || order.id) === orderId
              ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
              : order
          )
        );
        alert('Order status updated');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    processing: orders.filter((o) => o.status === 'Processing').length,
    shipped: orders.filter((o) => o.status === 'Shipped').length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
    totalRevenue: orders
      .filter((o) => o.status === 'Completed')
      .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0),
  };

  const handleAddOrder = async (newOrder) => {
    try {
      const response = await ordersAPI.create(newOrder);
      if (response.success) {
        setOrders([response.data, ...orders]);
        setIsAddOrderOpen(false);
        alert('Order created successfully');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order');
    }
  };

  const handleLogout = () => {
    navigate('/admin/login');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-900">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 h-full z-40">
          <Sidebar className="!bg-slate-950">
            <SidebarHeader>
              <div className="flex items-center space-x-2 px-4 py-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TR</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">TR Tech Admin</h2>
                  <p className="text-sm text-slate-400">Management Portal</p>
                </div>
              </div>
            </SidebarHeader>
            <div className="border-b border-slate-600 mx-4"></div>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate('/admin')}>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                    Dashboard
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate('/admin/products')}>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Products
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate('/admin/repairs')}>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Repairs
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={true}>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Orders
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </SidebarFooter>
          </Sidebar>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <header className="fixed bg-slate-950 top-0 left-64 right-0 z-30">
            <div className="flex justify-between items-center px-6 py-4">
              <div className="flex items-center">
                <SidebarTrigger />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-white">Orders</h1>
                  <p className="text-sm text-slate-400">Track and manage customer orders</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-slate-400">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">A</span>
                </div>
              </div>
            </div>
          </header>

          <main className="pt-20 bg-slate-900 min-h-screen p-6 overflow-auto">
            <div className="space-y-6 p-6">
              {/* Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div></div>
                <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Create New Order</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Add a new order to the system
                      </DialogDescription>
                    </DialogHeader>
                    <CreateOrderForm
                      key={formKey}
                      onSubmit={handleAddOrder}
                      onCancel={() => {
                        setIsAddOrderOpen(false);
                        setFormKey(prev => prev + 1);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-yellow-600/30">
                  <p className="text-slate-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-500 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-blue-600/30">
                  <p className="text-slate-400 text-sm">Processing</p>
                  <p className="text-2xl font-bold text-blue-500 mt-1">{stats.processing}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-purple-600/30">
                  <p className="text-slate-400 text-sm">Shipped</p>
                  <p className="text-2xl font-bold text-purple-500 mt-1">{stats.shipped}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-green-600/30">
                  <p className="text-slate-400 text-sm">Delivered</p>
                  <p className="text-2xl font-bold text-green-500 mt-1">{stats.delivered}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-green-600/30">
                  <p className="text-slate-400 text-sm">Revenue</p>
                  <p className="text-2xl font-bold text-green-500 mt-1">
                    R {stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-slate-800 rounded-lg p-4 space-y-4 border border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPayment} onValueChange={setFilterPayment}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="All Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment Methods</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Transfer">Transfer</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700/50 bg-slate-900">
                      <TableHead className="text-slate-300">Order Number</TableHead>
                      <TableHead className="text-slate-300">Customer</TableHead>
                      <TableHead className="text-slate-300">Items</TableHead>
                      <TableHead className="text-slate-300">Total</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Payment</TableHead>
                      <TableHead className="text-slate-300">Date</TableHead>
                      <TableHead className="text-slate-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="font-mono text-slate-300">#{order._id?.slice(-6).toUpperCase() || 'N/A'}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{order.customer?.name || 'N/A'}</p>
                            <p className="text-sm text-slate-400">{order.customer?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          R {(order.totalAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[order.status] || 'bg-gray-600'} text-white`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${paymentStatusColors[order.paymentMethod] || 'bg-gray-600'} text-white`}>
                            {order.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredOrders.length === 0 && (
                  <div className="text-center py-12 text-slate-400">No orders found</div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Order {selectedOrder.orderNumber}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  View and update order details
                </DialogDescription>
              </DialogHeader>
              <OrderDetailsView
                order={selectedOrder}
                onUpdateStatus={(status) => {
                  updateOrderStatus(selectedOrder._id, status);
                  setSelectedOrder({ ...selectedOrder, status });
                }}
                onClose={() => setSelectedOrder(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </SidebarProvider>
  );
}

function OrderDetailsView({ order, onUpdateStatus, onClose }) {
  return (
    <div className="space-y-6">
      {/* Customer & Shipping Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-white">Customer Information</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-slate-400">Name</p>
              <p className="font-medium text-white">{order.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <p className="font-medium text-white">{order.email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400">Phone</p>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <p className="font-medium text-white">{order.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-white">Shipping Address</h3>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 mt-1" />
            <p className="text-white">{order.shippingAddress}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white">Order Items</h3>
        <div className="bg-slate-900 rounded-lg overflow-hidden">
          <div className="divide-y divide-slate-700">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4">
                <img
                  src={item.image || 'https://placehold.co/100x100/3b82f6/white?text=Item'}
                  alt={item.productName}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-white">{item.productName}</p>
                  <p className="text-sm text-slate-400">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">
                    R {(item.price * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400">R {item.price.toLocaleString()} each</p>
                </div>
              </div>
            ))}
          </div>
          <Separator className="bg-slate-700" />
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-white">
              <span>Subtotal</span>
              <span>R {(order.totalAmount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-white">
              <span>Total</span>
              <span>R {(order.totalAmount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-white">Order Status</Label>
          <Select value={order.status} onValueChange={onUpdateStatus}>
            <SelectTrigger id="status" className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Payment Status</Label>
          <div className="flex items-center h-10 px-3 rounded-md border border-slate-700 bg-slate-900">
            <Badge className={`${paymentStatusColors[order.paymentMethod] || 'bg-gray-600'} text-white`}>
              {order.paymentMethod}
            </Badge>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-400">Order Date</p>
          <p className="text-white">
            {new Date(order.createdAt).toLocaleString('en-ZA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div>
          <p className="text-slate-400">Last Updated</p>
          <p className="text-white">
            {new Date(order.updatedAt).toLocaleString('en-ZA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="border-slate-600 text-white hover:bg-slate-700">
          Close
        </Button>
      </div>
    </div>
  );
}

export default AdminOrdersPage;
