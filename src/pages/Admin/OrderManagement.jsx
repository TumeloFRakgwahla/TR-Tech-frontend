import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { KPICard, SectionCard } from '../../components/ui/dashboard-card';
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
  DialogDescription,
  DialogClose,
} from '../../components/ui/dialog';
import {
  Search,
  Loader2,
  CheckSquare,
  Square,
  Package,
  User,
  CreditCard,
  Truck,
  ChevronRight,
  Printer,
  Mail,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { ordersAPI, notificationsAPI } from '../../services/api';
import { useAdminAuth } from '../../components/AdminAuthContext';
import { toast } from 'sonner';
import { getStatusConfig } from '../../lib/admin-utils';
import { ORDER_STATUSES } from '../../constants';
import { formatPriceWithDecimals } from '../../lib/format';
import { Skeleton } from '../../components/Skeleton';
import { StatusBadge, StatusDot } from '../../components/admin/StatusBadge';
import { AdminEmptyState, AdminErrorState } from '../../components/admin/AdminEmptyState';
import { AdminPageHeader } from '../../components/admin/Breadcrumbs';

const PAGE_SIZE = 20;

const STATUS_PIPELINE = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Completed'];

export function OrderManagement() {
  useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [viewMode, setViewMode] = useState('table');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const lastClickedRef = useRef(null);

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
      const customer = String(typeof order.customer === 'string' ? order.customer : (order.customer?.name || order.customer || '')).toLowerCase();
      return id.includes(q) || customer.includes(q);
    });
  }, [orders, searchQuery]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const toggleSelect = useCallback((id) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedOrders(prev => {
      if (prev.size === filteredOrders.length) {
        return new Set();
      }
      return new Set(filteredOrders.map(o => o._id));
    });
  }, [filteredOrders]);

  const handleRowClick = useCallback((orderId, e) => {
    if (e.shiftKey && lastClickedRef.current) {
      const ids = filteredOrders.map(o => o._id);
      const lastIdx = ids.indexOf(lastClickedRef.current);
      const currentIdx = ids.indexOf(orderId);
      if (lastIdx !== -1 && currentIdx !== -1) {
        const [start, end] = [Math.min(lastIdx, currentIdx), Math.max(lastIdx, currentIdx)];
        setSelectedOrders(prev => {
          const next = new Set(prev);
          for (let i = start; i <= end; i++) {
            next.add(ids[i]);
          }
          return next;
        });
        return;
      }
    }
    toggleSelect(orderId);
    lastClickedRef.current = orderId;
  }, [filteredOrders, toggleSelect]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    const previousOrders = orders;
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      toast.success('Order status updated', {
        action: {
          label: 'Undo',
          onClick: () => {
            setOrders(previousOrders);
            toast.info('Status reverted');
          },
        },
      });
    } catch (err) {
      setOrders(previousOrders);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const bulkUpdateStatus = async (status) => {
    if (selectedOrders.size === 0) return;
    const previousOrders = orders;
    const selectedIds = [...selectedOrders];
    try {
      await Promise.all(selectedIds.map(id => ordersAPI.updateStatus(id, status)));
      setOrders(prev => prev.map(o => selectedIds.includes(o._id) ? { ...o, status } : o));
      setSelectedOrders(new Set());
      toast.success(`${selectedIds.length} orders updated to ${status}`, {
        action: {
          label: 'Undo',
          onClick: () => {
            setOrders(previousOrders);
            toast.info('Bulk update reverted');
          },
        },
      });
    } catch (err) {
      setOrders(previousOrders);
      toast.error(err.message || 'Bulk update failed');
    }
  };

  const bulkPrintInvoice = () => {
    if (selectedOrders.size === 0) return;
    const selectedIds = [...selectedOrders];
    const selectedOrdersData = orders.filter(o => selectedIds.includes(o._id));
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Print Invoices</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .order { border: 1px solid #ccc; margin-bottom: 20px; padding: 15px; page-break-inside: avoid; }
          .header { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .meta { color: #666; font-size: 12px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        ${selectedOrdersData.map(order => `
          <div class="order">
            <div class="header">Order #${String(order._id).slice(-6).toUpperCase()}</div>
            <div class="meta">Customer: ${order.customer?.name || 'Unknown'} | Date: ${new Date(order.createdAt).toLocaleDateString()} | Status: ${order.status}</div>
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
              <tbody>
                ${(order.items || []).map(item => `<tr><td>${item.name || 'Item'}</td><td>${item.quantity || 1}</td><td>${formatPriceWithDecimals(item.price || 0)}</td></tr>`).join('')}
              </tbody>
            </table>
            <div style="text-align: right; font-weight: bold; margin-top: 10px;">Total: ${formatPriceWithDecimals(order.totalAmount)}</div>
          </div>
        `).join('')}
      </body>
    </html>
    `);
    printWindow.document.close();
    printWindow.print();
    toast.success(`Printing ${selectedIds.length} invoices`);
  };

  const bulkSendNotification = async () => {
    if (selectedOrders.size === 0) return;
    const selectedIds = [...selectedOrders];
    const selectedOrdersData = orders.filter(o => selectedIds.includes(o._id));
    let sent = 0;
    for (const order of selectedOrdersData) {
      if (order.userId) {
        try {
          await notificationsAPI.send({
            userId: order.userId,
            type: 'order',
            title: 'Order Update',
            message: `There is an update on your order #${String(order._id).slice(-6).toUpperCase()}.`,
            data: { orderId: order._id },
          });
          sent++;
        } catch {
          // continue sending to other orders
        }
      }
    }
    toast.success(`Notification sent for ${sent} of ${selectedIds.length} orders`);
    setSelectedOrders(new Set());
  };

  const openDialog = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const processing = orders.filter((o) => o.status === 'Processing').length;
    const delivered = orders.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length;
    const shipped = orders.filter((o) => o.status === 'Shipped').length;
    return { totalOrders, pending, processing, delivered, shipped };
  }, [orders]);

  const pipelineData = useMemo(() => {
    const max = STATUS_PIPELINE.reduce((m, s) => Math.max(m, orders.filter(o => o.status === s).length), 1);
    return STATUS_PIPELINE.map(status => ({
      status,
      count: orders.filter(o => o.status === status).length,
      max,
    }));
  }, [orders]);

  const kanbanColumns = useMemo(() => {
    const cols = {};
    STATUS_PIPELINE.forEach(s => { cols[s] = []; });
    orders.forEach(order => {
      if (cols[order.status]) cols[order.status].push(order);
    });
    return cols;
  }, [orders]);

  const orderStatsKpis = [
    { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: Package, color: 'text-blue-400', bgColor: 'bg-blue-600/20' },
    { title: 'Pending', value: stats.pending.toLocaleString(), icon: Package, color: 'text-yellow-400', bgColor: 'bg-yellow-600/20' },
    { title: 'Processing', value: stats.processing.toLocaleString(), icon: Package, color: 'text-blue-400', bgColor: 'bg-blue-600/20' },
    { title: 'Delivered', value: stats.delivered.toLocaleString(), icon: Package, color: 'text-green-400', bgColor: 'bg-green-600/20' },
  ];

  if (error) {
    return (
      <AdminErrorState error={error} onRetry={loadOrders} />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="View and manage customer orders"
        action={
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="flex rounded-lg bg-slate-700/50 p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'table' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'kanban' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Kanban
              </button>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {orderStatsKpis.map((stat) => (
          <KPICard key={stat.title} {...stat} />
        ))}
      </div>

      <SectionCard
        title="Fulfillment Pipeline"
        description="Order distribution across fulfillment stages"
      >
        <div className="space-y-4">
          {pipelineData.map((segment) => (
            <div key={segment.status} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot status={segment.status} type="order" />
                  <span className="text-sm text-slate-300">{segment.status}</span>
                </div>
                <span className="text-sm font-semibold text-white">{segment.count}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-700/50 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${getStatusConfig(segment.status, 'order').color}`}
                  style={{ width: `${(segment.count / segment.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {selectedOrders.size > 0 && (
        <Card className="p-4 bg-blue-600/10 border-blue-600/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-sm text-blue-400 font-medium">{selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected</span>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant="outline"
                  onClick={() => bulkUpdateStatus(status)}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  Mark as {status}
                </Button>
              ))}
              <Button size="sm" variant="outline" onClick={bulkPrintInvoice} className="border-slate-600 text-white hover:bg-slate-700">
                <Printer className="h-4 w-4 mr-1" /> Print Invoice
              </Button>
              <Button size="sm" variant="outline" onClick={bulkSendNotification} className="border-slate-600 text-white hover:bg-slate-700">
                <Mail className="h-4 w-4 mr-1" /> Send Notification
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setSelectedOrders(new Set()); lastClickedRef.current = null; }} className="text-slate-400 hover:text-white">Clear</Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4 mb-6 bg-slate-800 border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>
      </Card>

      {viewMode === 'table' ? (
        <Card className="bg-slate-800 border-slate-700 overflow-hidden table-responsive">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {selectedOrders.size === filteredOrders.length && filteredOrders.length > 0 ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
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
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <AdminErrorState error={error} onRetry={loadOrders} />
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <AdminEmptyState
                      iconType="order"
                      title="No orders found"
                      description={searchQuery ? 'Try adjusting your search query' : 'Orders will appear here once customers place them.'}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow
                    key={order._id}
                    className={`hover:bg-slate-700/20 transition-colors cursor-pointer ${selectedOrders.has(order._id) ? 'bg-blue-600/10' : ''}`}
                    onClick={(e) => handleRowClick(order._id, e)}
                  >
                    <TableCell>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(order._id); }}
                        className={`transition-colors ${selectedOrders.has(order._id) ? 'text-blue-400' : 'text-slate-500 hover:text-blue-400'}`}
                      >
                        {selectedOrders.has(order._id) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                      </button>
                    </TableCell>
                    <TableCell className="font-semibold text-white">#{String(order._id).slice(-6).toUpperCase()}</TableCell>
                    <TableCell className="text-white">{typeof order.customer === 'string' ? order.customer : (order.customer?.name || 'Unknown')}</TableCell>
                    <TableCell className="text-white">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-white">{(order.items || []).length}</TableCell>
                    <TableCell className="font-semibold text-green-400">{formatPriceWithDecimals(order.totalAmount)}</TableCell>
                    <TableCell>
                      {updatingId === order._id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      ) : (
                        <StatusBadge status={order.status} type="order" size="sm" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); openDialog(order); }}
                          className="text-white hover:bg-slate-700"
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUS_PIPELINE.map((status) => {
            const statusOrders = kanbanColumns[status] || [];
            return (
              <div key={status} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <StatusDot status={status} type="order" />
                    <h3 className="font-semibold text-white text-sm">{status}</h3>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">{statusOrders.length}</span>
                </div>
                <div className="space-y-3">
                  {statusOrders.map((order) => (
                    <Card
                      key={order._id}
                      className="p-4 bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                      onClick={() => openDialog(order)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-white text-sm">#{String(order._id).slice(-6).toUpperCase()}</p>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{order.customer?.name || 'Unknown'}</p>
                      <p className="text-sm font-bold text-green-400">{formatPriceWithDecimals(order.totalAmount)}</p>
                      <p className="text-xs text-slate-500 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </Card>
                  ))}
                  {statusOrders.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">No orders</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && viewMode === 'table' && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-300">
          <p>
            Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredOrders.length)}-{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2">Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white w-full sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              Order #{selectedOrder ? String(selectedOrder._id).slice(-6).toUpperCase() : ''}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Order details and management
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-2">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  {updatingId === selectedOrder._id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  ) : (
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(val) => updateStatus(selectedOrder._id, val)}
                    >
                      <SelectTrigger className={`w-40 h-9 text-sm border-0 ${getStatusConfig(selectedOrder.status, 'order').color} text-white`}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="text-white">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1">Total</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatPriceWithDecimals(selectedOrder.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <p className="text-xs text-slate-400">Customer</p>
                  </div>
                  <p className="text-sm font-medium text-white">
                    {selectedOrder.customer?.name || 'Unknown'}
                  </p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <p className="text-xs text-slate-400">Payment</p>
                  </div>
                  <p className="text-sm font-medium text-white">
                    {selectedOrder.paymentMethod || 'Card'}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-slate-400" />
                  <p className="text-xs text-slate-400">
                    Items ({selectedOrder.items?.length || 0})
                  </p>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center">
                          <Package className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {item.name || `Item ${idx + 1}`}
                          </p>
                          <p className="text-xs text-slate-400">Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-green-400">
                        {formatPriceWithDecimals(item.price || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 flex gap-3">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      window.location.origin + '/track-order?id=' + selectedOrder._id
                    );
                    toast.success('Tracking link copied');
                  }}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Copy Tracking Link
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderManagement;
