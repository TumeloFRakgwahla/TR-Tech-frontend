import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Plus,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ordersAPI, productsAPI, repairsAPI } from '../../services/api';
import { useAdminAuth } from '../../components/AdminAuthContext';
import { formatPriceWithDecimals } from '../../lib/format';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import { cn, getStatusConfig } from '../../lib/admin-utils';
import { CHART_THEME } from '../../lib/chart-theme';
import { getProductImageUrl } from '../../lib/imageUrl';
import { Skeleton } from '../../components/Skeleton';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../constants';
import { filterOrdersByPeriod, aggregateOrdersByMonth, aggregateOrdersByWeek, aggregateOrdersByDay, aggregateOrdersByYear } from '../../utils/analytics';

const DATE_RANGES = ['Today', 'This Week', 'This Month', 'This Year', 'Custom'];
const CHART_TYPES = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'orders', label: 'Orders' },
];
const CHART_PERIODS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

export function AdminDashboard() {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentRepairs, setRecentRepairs] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [dateRange, setDateRange] = useState('This Month');
  const [chartType, setChartType] = useState('revenue');
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setError(null);
      try {
        const [statsRes, ordersRes, repairsRes, lowStockRes] = await Promise.all([
          ordersAPI.getStats(),
          ordersAPI.getAll({ limit: 100 }),
          repairsAPI.getAll({ limit: 100 }),
          productsAPI.getLowStock(10),
        ]);

        if (!isMounted) return;

        setStats(statsRes.data);
        setRecentOrders((ordersRes.data || []).slice(0, 5));
        setRecentRepairs((repairsRes.data || []).slice(0, 5));
        setLowStockProducts(lowStockRes.data || []);
        setAllOrders(ordersRes.data || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load dashboard data');
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => filterOrdersByPeriod(allOrders, dateRange), [allOrders, dateRange]);
  const salesData = useMemo(() => {
    switch (chartPeriod) {
      case 'daily': return aggregateOrdersByDay(filteredOrders);
      case 'weekly': return aggregateOrdersByWeek(filteredOrders);
      case 'yearly': return aggregateOrdersByYear(filteredOrders);
      default: return aggregateOrdersByMonth(filteredOrders);
    }
  }, [filteredOrders, chartPeriod]);

  const kpis = useMemo(() => {
    if (!stats) return [];
    const safeDiv = (current, change) => {
      if (change == null || change === 0) return current;
      const divisor = 1 + change / 100;
      if (divisor === 0) return 0;
      return current / divisor;
    };
    const prevRevenue = safeDiv(stats.totalRevenue || 0, stats.revenueChange);
    const prevOrders = safeDiv(stats.totalOrders || 0, stats.ordersChange);
    const prevCustomers = safeDiv(stats.totalCustomers || 0, stats.customersChange);
    const prevProducts = safeDiv(stats.productsSold || 0, stats.salesChange);
    return [
      { title: 'Total Sales', value: formatPriceWithDecimals(stats.totalRevenue || 0), current: stats.totalRevenue || 0, previous: prevRevenue, icon: DollarSign },
      { title: 'Total Orders', value: `${(stats.totalOrders || 0).toLocaleString()} Orders`, current: stats.totalOrders || 0, previous: prevOrders, icon: ShoppingCart },
      { title: 'Customers', value: `${(stats.totalCustomers || 0).toLocaleString()} Customers`, current: stats.totalCustomers || 0, previous: prevCustomers, icon: Users },
      { title: 'Products', value: `${(stats.productsSold || 0).toLocaleString()} Products`, current: stats.productsSold || 0, previous: prevProducts, icon: Package },
      { title: 'Pending Repairs', value: `${(stats.activeRepairs || 0).toLocaleString()} Repairs`, current: stats.activeRepairs || 0, previous: 0, icon: Wrench },
      { title: 'Low Stock', value: `${(stats.lowStockCount || lowStockProducts.length).toLocaleString()} Products`, current: stats.lowStockCount || lowStockProducts.length, previous: 0, icon: AlertTriangle },
    ].map((kpi) => {
      let percent = 0;
      let trend = null;
      if (kpi.previous > 0) {
        percent = ((kpi.current - kpi.previous) / kpi.previous) * 100;
        trend = percent >= 0 ? 'up' : 'down';
      } else if (kpi.current > 0 && kpi.previous === 0) {
        percent = 100;
        trend = 'up';
      }
      return {
        ...kpi,
        percent: Math.abs(Math.round(percent * 10) / 10),
        trend,
      };
    });
  }, [stats, lowStockProducts.length]);

  if (error) {
    return <AdminErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
            Welcome back, {user?.firstName || 'Admin'} 
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--tr-text-muted))' }}>
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="admin-date-tabs">
          {DATE_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                'admin-date-tab',
                dateRange === range ? 'admin-date-tab-active' : ''
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 overflow-x-auto">
        {kpis.map((kpi) => {
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <div key={kpi.title} className="admin-kpi-card" data-current={kpi.current} data-previous={kpi.previous}>
              <div className="admin-kpi-header">
                <span className="admin-kpi-label">{kpi.title}</span>
                <div className="admin-kpi-icon">
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="admin-kpi-value">{kpi.value}</p>
                {kpi.trend && (
                  <span className={`admin-kpi-change mt-2 ${kpi.trend === 'up' ? 'admin-kpi-change-up' : 'admin-kpi-change-down'}`}>
                    <TrendIcon className="w-3.5 h-3.5" />
                    <span className="admin-kpi-percentage-value">{kpi.percent}%</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-section-card">
        <div className="admin-section-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="admin-section-title">Sales Overview</h2>
              <p className="admin-section-description">Track your revenue, orders, and profit over time</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="admin-chart-tons">
                {CHART_TYPES.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setChartType(type.key)}
                    className={cn(
                      'admin-chart-tab',
                      chartType === type.key ? 'admin-chart-tab-active' : ''
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <div className="admin-date-tabs" style={{ marginLeft: '0.5rem' }}>
                {CHART_PERIODS.map((period) => (
                  <button
                    key={period.key}
                    onClick={() => setChartPeriod(period.key)}
                    className={cn(
                      'admin-date-tab',
                      chartPeriod === period.key ? 'admin-date-tab-active' : ''
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="admin-section-body" style={{ paddingTop: 0 }}>
          <div className="h-[320px] chart-container">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="month" stroke={CHART_THEME.text} />
                  <YAxis stroke={CHART_THEME.text} />
                  <Tooltip
                    contentStyle={{ backgroundColor: CHART_THEME.tooltip.bg, border: `1px solid ${CHART_THEME.tooltip.border}`, borderRadius: '8px', color: CHART_THEME.tooltip.text }}
                    formatter={(value, name) => [
                      name === 'revenue' ? formatPriceWithDecimals(value) : Number(value).toLocaleString(),
                      name === 'revenue' ? 'Revenue' : 'Units Sold'
                    ]}
                  />
                  <Bar dataKey={chartType === 'orders' ? 'orders' : 'sales'} fill={CHART_THEME.bar} radius={[4, 4, 0, 0]} name={chartType === 'orders' ? 'Orders' : 'Units Sold'} />
                  {chartType === 'revenue' && (
                    <Line type="monotone" dataKey="revenue" stroke={CHART_THEME.revenue} strokeWidth={3} dot={{ fill: CHART_THEME.revenue, r: 4 }} name="Revenue" />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: 'rgb(var(--tr-text-muted))' }}>No sales data yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="admin-section-card">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Recent Orders</h2>
            <Link to="/admin/orders">
              <button className="admin-quick-action-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
          <div className="admin-section-body" style={{ paddingTop: 0 }}>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8" style={{ color: 'rgb(var(--tr-text-muted))' }}>
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="font-medium text-white">#{String(order._id).slice(-6).toUpperCase()}</td>
                        <td>{typeof order.customer === 'string' ? order.customer : (order.customer?.name || 'Unknown')}</td>
                        <td>{(order.items || []).length} items</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="font-semibold" style={{ color: 'rgb(var(--tr-green))' }}>{formatPriceWithDecimals(order.totalAmount)}</td>
                        <td>
                          <span className={cn(
                            'admin-badge',
                            order.paymentStatus === 'Paid' ? 'admin-badge-success' : order.paymentStatus === 'Pending' ? 'admin-badge-warning' : 'admin-badge-danger'
                          )}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={order.status} type="order" size="sm" />
                        </td>
                        <td>
                          <button className="admin-header-btn" style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => navigate('/admin/orders')}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="admin-section-card">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Recent Repairs</h2>
            <Link to="/admin/repairs">
              <button className="admin-quick-action-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
          <div className="admin-section-body" style={{ paddingTop: 0 }}>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Repair ID</th>
                    <th>Customer</th>
                    <th>Device</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRepairs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8" style={{ color: 'rgb(var(--tr-text-muted))' }}>
                        No repairs yet
                      </td>
                    </tr>
                  ) : (
                    recentRepairs.map((repair) => (
                      <tr key={repair._id}>
                        <td className="font-medium text-white">#{String(repair._id).slice(-6).toUpperCase()}</td>
                        <td>{repair.customer?.name || repair.customerName || 'Unknown'}</td>
                        <td>{repair.deviceType || repair.device || 'N/A'}</td>
                        <td>
                          <span className={cn(
                            'admin-badge',
                            getStatusConfig(repair.status, 'repair').textColor === 'text-green-400' ? 'admin-badge-success' :
                            getStatusConfig(repair.status, 'repair').textColor === 'text-blue-400' ? 'admin-badge-info' :
                            getStatusConfig(repair.status, 'repair').textColor === 'text-yellow-400' ? 'admin-badge-warning' :
                            getStatusConfig(repair.status, 'repair').textColor === 'text-red-400' ? 'admin-badge-danger' : 'admin-badge-neutral'
                          )}>
                            {repair.status}
                          </span>
                        </td>
                        <td className="font-semibold" style={{ color: 'rgb(var(--tr-green))' }}>
                          {formatPriceWithDecimals(repair.estimatedCost || repair.cost || 0)}
                        </td>
                        <td>{new Date(repair.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="admin-header-btn" style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => navigate('/admin/repairs')}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </div>
        </div>
      </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">Low Stock Products</h2>
            <p className="admin-section-description">Products that need restocking soon</p>
          </div>
          <button className="admin-quick-action-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }} onClick={() => navigate('/admin/inventory')}>
            <Plus className="w-4 h-4" /> Restock Product
          </button>
        </div>
        <div className="admin-section-body" style={{ paddingTop: 0 }}>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Minimum Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8" style={{ color: 'rgb(var(--tr-text-muted))' }}>
                      All products are well stocked
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((product) => {
                    const stockCount = Number(product.stock) || 0;
                    const minStock = Number(product.minimumStock) || 10;
                    const status = stockCount === 0 ? 'Out of Stock' : stockCount <= minStock ? 'Low Stock' : 'In Stock';
                    return (
                      <tr key={product._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <img
                              src={getProductImageUrl(product.images?.[0] || product.image)}
                              alt={product.name}
                              onError={(e) => { e.target.src = PRODUCT_PLACEHOLDER_IMAGE; }}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                            <span className="font-medium text-white">{product.name}</span>
                          </div>
                        </td>
                         <td>{product.sku || `SKU-${String(product._id).slice(-6).toUpperCase()}`}</td>
                        <td>{product.category || 'N/A'}</td>
                        <td>{stockCount}</td>
                        <td>{minStock}</td>
                        <td>
                          <span className={cn(
                            'admin-badge',
                            status === 'Out of Stock' ? 'admin-badge-danger' : status === 'Low Stock' ? 'admin-badge-warning' : 'admin-badge-success'
                          )}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <button className="admin-quick-action-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }} onClick={() => navigate('/admin/inventory')}>
                            Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    <div className="admin-section-card">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Quick Actions</h2>
        </div>
        <div className="admin-section-body">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 max-w-5xl mx-auto">
            {[
              { label: 'Add Product', href: '/admin/products?add=true', primary: true },
              { label: 'Add Service', href: '/admin/services?add=true', primary: false },
              { label: 'New Repair', href: '/admin/repairs?add=true', primary: false },
              { label: 'Add Customer', href: '/admin/customers?add=true', primary: false },
              { label: 'View Orders', href: '/admin/orders', primary: false },
              { label: 'Generate Report', href: '/admin/reports', primary: false },
            ].map((action) => (
              <Link key={action.label} to={action.href}>
                <button className={cn(
                  'admin-quick-action',
                  action.primary ? 'admin-quick-action-primary' : 'admin-quick-action-secondary'
                )}>
                  <Plus className="w-4 h-4" />
                  {action.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
