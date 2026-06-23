import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Search, Eye, Loader2 } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { useAuth } from '../../components/AuthContext';
import { toast } from 'sonner';

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled'];

export function OrderManagement() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ordersAPI.getAll({ limit: 100 });
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const id = String(order._id || order.id || '').toLowerCase();
      const customer = (order.customer?.name || order.customer || '').toLowerCase();
      return id.includes(q) || customer.includes(q);
    });
  }, [orders, searchQuery]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-600';
      case 'Shipped':
        return 'bg-blue-600';
      case 'Processing':
        return 'bg-yellow-600';
      case 'Completed':
        return 'bg-green-600';
      case 'Cancelled':
        return 'bg-red-600';
      default:
        return 'bg-slate-600';
    }
  };

  const openStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  const updateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      await ordersAPI.updateStatus(selectedOrder._id, newStatus);
      toast.success('Order status updated');
      setStatusDialogOpen(false);
      loadOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const processing = orders.filter((o) => o.status === 'Processing').length;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;
    return { totalOrders, pending, processing, delivered };
  }, [orders]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Order Management</h1>
        <p className="text-slate-400">View and manage customer orders</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-blue-400">{stats.totalOrders.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.pending.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Processing</p>
          <p className="text-3xl font-bold text-blue-400">{stats.processing.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Delivered</p>
          <p className="text-3xl font-bold text-green-400">{stats.delivered.toLocaleString()}</p>
        </Card>
      </div>

      <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-700 border-slate-600 text-white" />
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Order ID</TableHead>
              <TableHead className="text-white">Customer</TableHead>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Items</TableHead>
              <TableHead className="text-white">Total</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-red-400">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-semibold text-white">#{String(order._id).slice(-6).toUpperCase()}</TableCell>
                  <TableCell className="text-white">{order.customer?.name || order.customer || 'Unknown'}</TableCell>
                  <TableCell className="text-white">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-white">{(order.items || []).length}</TableCell>
                  <TableCell className="font-semibold text-green-400">R{Number(order.totalAmount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog open={statusDialogOpen && selectedOrder?._id === order._id} onOpenChange={(open) => { setStatusDialogOpen(open); if (open) openStatusDialog(order); }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">
                            Update Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Update Order Status</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-slate-400">Order: #{String(selectedOrder?._id || '').slice(-6).toUpperCase()}</p>
<Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {statuses.map((s) => (
                  <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setStatusDialogOpen(false)} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
                            <Button onClick={updateStatus} className="bg-blue-600 hover:bg-blue-700">Update</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
