import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ordersAPI, productsAPI } from '../../services/api';
import { useAuth } from '../../components/AuthContext';
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsRes, ordersRes, lowStockRes, productsRes] = await Promise.all([
          ordersAPI.getStats(),
          ordersAPI.getAll({ limit: 5 }),
          productsAPI.getLowStock(10),
          productsAPI.getAll({ limit: 5, status: 'Active' }),
        ]);

        if (!isMounted) return;

        setStats(statsRes.data);
        setRecentOrders(ordersRes.data || []);
        setLowStockProducts(lowStockRes.data || []);
        setTopProducts(productsRes.data || []);

        const monthMap = {};
        (ordersRes.data || []).forEach((order) => {
          const date = new Date(order.createdAt);
          const key = date.toLocaleString('default', { month: 'short' });
          if (!monthMap[key]) monthMap[key] = { month: key, revenue: 0, sales: 0 };
          monthMap[key].revenue += Number(order.totalAmount) || 0;
          monthMap[key].sales += (order.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        });
        const sortedMonths = Object.values(monthMap).sort((a, b) => {
          const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return order.indexOf(a.month) - order.indexOf(b.month);
        });
        setSalesData(sortedMonths);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      { title: 'Total Revenue', value: `R${(stats.totalRevenue || 0).toLocaleString()}`, change: stats.revenueChange || 0, icon: DollarSign, color: 'text-green-400', bgColor: 'bg-green-600/20' },
      { title: 'Total Orders', value: (stats.totalOrders || 0).toLocaleString(), change: stats.ordersChange || 0, icon: ShoppingCart, color: 'text-blue-400', bgColor: 'bg-blue-600/20' },
      { title: 'Total Customers', value: (stats.totalCustomers || 0).toLocaleString(), change: stats.customersChange || 0, icon: Users, color: 'text-purple-400', bgColor: 'bg-purple-600/20' },
      { title: 'Products Sold', value: (stats.productsSold || 0).toLocaleString(), change: stats.salesChange || 0, icon: Package, color: 'text-yellow-400', bgColor: 'bg-yellow-600/20' },
    ];
  }, [stats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-red-400">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Dashboard</h1>
        <p className="text-slate-400">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! Here's what's happening with your store today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6 bg-slate-800 border-slate-700 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-semibold">{Math.abs(stat.change)}%</span>
                </div>
              </div>
              <h3 className="text-slate-400 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-2 p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Revenue Analytics</h2>
          </div>
          <div className="h-[300px]">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px', color: 'white' }} formatter={(value) => [`R${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Revenue" />
                  <Line type="monotone" dataKey="sales" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4 }} name="Sales" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No revenue data yet</div>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Top Products</h2>
            <Link to="/admin/products">
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">View All <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </Link>
          </div>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-slate-400 text-sm">No products to display</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={product._id || product.name} className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-400">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{product.name}</p>
                      <p className="text-xs text-slate-400">Stock: {product.stock}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-green-400">R{Number(product.price).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">View All <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length === 0 && <p className="text-slate-400 text-sm">No orders yet</p>}
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                <div>
                  <p className="font-semibold text-white">#{String(order._id).slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-slate-400">{order.customer?.name || 'Unknown'} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <Badge className={order.status === 'Delivered' ? 'bg-green-600' : order.status === 'Shipped' ? 'bg-blue-600' : order.status === 'Processing' ? 'bg-yellow-600' : 'bg-slate-600'}>{order.status}</Badge>
                  <p className="text-sm font-bold text-blue-400 mt-2">R{Number(order.totalAmount).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Low Stock Alerts</h2>
            <Link to="/admin/inventory">
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">Manage <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </Link>
          </div>
          <div className="space-y-4">
            {lowStockProducts.length > 0 ? lowStockProducts.map((product) => {
              const percent = product.threshold > 0 ? Math.max((Number(product.stock) / product.threshold) * 100, 0) : 0;
              return (
                <div key={product._id} className="flex items-start gap-3 p-4 border-l-4 border-yellow-600 bg-yellow-600/5 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">{product.name}</p>
                    <p className="text-sm text-slate-400">Only {product.stock} left in stock</p>
                    <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              );
            }) : <p className="text-slate-400 text-sm">All products are well stocked</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
