import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { ordersAPI, productsAPI } from '../../services/api';
import { toast } from 'sonner';
import { filterOrdersByPeriod, aggregateOrdersByMonth } from '../../utils/analytics';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

export function ReportsAnalytics() {
  const [orders, setOrders] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [, ordersRes, productsRes] = await Promise.all([
          ordersAPI.getStats(),
          ordersAPI.getAll({ limit: 100 }),
          productsAPI.getAll({ limit: 100 }),
        ]);
        if (!isMounted) return;
        setOrders(ordersRes.data || []);

        const categoryMap = {};
        (productsRes.data || []).forEach((product) => {
          const cat = product.category || 'Other';
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
        setCategoryData(
          Object.entries(categoryMap)
            .map(([name, value], index) => ({
              name,
              value,
              color: CHART_COLORS[index % CHART_COLORS.length],
            }))
            .sort((a, b) => b.value - a.value)
        );
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load reports');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const filteredOrders = useMemo(() => filterOrdersByPeriod(orders, period), [orders, period]);
  const filteredSalesData = useMemo(() => aggregateOrdersByMonth(filteredOrders), [filteredOrders]);

  const periodData = useMemo(() => {
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStart = new Date(currentStart.getTime() - days * 24 * 60 * 60 * 1000);

    const currentOrders = filteredOrders;
    const previousOrders = orders.filter((o) => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d >= previousStart && d < currentStart;
    });

    const currentRevenue = currentOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const previousRevenue = previousOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const currentOrdersCount = currentOrders.length;
    const previousOrdersCount = previousOrders.length;
    const ordersChange = previousOrdersCount > 0 ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100 : 0;

    const currentCustomers = new Set(currentOrders.map((o) => o.customer?._id || o.customer)).size;
    const previousCustomers = new Set(previousOrders.map((o) => o.customer?._id || o.customer)).size;
    const customersChange = previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 : 0;

    const avgOrderValue = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;
    const previousAvgOrderValue = previousOrdersCount > 0 ? previousRevenue / previousOrdersCount : 0;
    const aovChange = previousAvgOrderValue > 0 ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100 : 0;

    const previousLabel = period === '7d' ? 'Previous 7 days' : period === '30d' ? 'Previous 30 days' : period === '90d' ? 'Previous 90 days' : 'Previous 12 months';

    return {
      currentRevenue,
      previousRevenue,
      revenueChange,
      currentOrdersCount,
      previousOrdersCount,
      ordersChange,
      currentCustomers,
      previousCustomers,
      customersChange,
      avgOrderValue,
      previousAvgOrderValue,
      aovChange,
      previousLabel,
    };
  }, [orders, filteredOrders, period]);

  const exportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status'];
    const rows = filteredOrders.map((o) => [
      String(o._id).slice(-6).toUpperCase(),
      o.customer?.name || 'Unknown',
      new Date(o.createdAt).toLocaleDateString(),
      (o.items || []).length,
      Number(o.totalAmount || 0).toFixed(2),
      o.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 bg-slate-800/80 border-slate-700">
              <div className="h-3 w-20 bg-slate-700 rounded mb-3" />
              <div className="h-7 w-24 bg-slate-700 rounded" />
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-slate-800/80 border-slate-700">
            <div className="h-5 w-32 bg-slate-700 rounded mb-4" />
            <div className="h-64 w-full bg-slate-700/50 rounded" />
          </Card>
          <Card className="p-6 bg-slate-800/80 border-slate-700">
            <div className="h-5 w-32 bg-slate-700 rounded mb-4" />
            <div className="h-64 w-full bg-slate-700/50 rounded" />
          </Card>
        </div>
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
      <div className="flex items-center justify-between mb-4 py-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-300">View business insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last 12 months</option>
          </select>
          <Button onClick={exportCSV} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 bg-slate-800/80 border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-xs">Total Revenue</p>
            <div className={`flex items-center gap-1 text-xs ${periodData.revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {periodData.revenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(periodData.revenueChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-green-400">R{periodData.currentRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">vs {periodData.previousLabel}: R{periodData.previousRevenue.toLocaleString()}</p>
        </Card>
        <Card className="p-5 bg-slate-800/80 border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-xs">Total Orders</p>
            <div className={`flex items-center gap-1 text-xs ${periodData.ordersChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {periodData.ordersChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(periodData.ordersChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-400">{periodData.currentOrdersCount.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">vs {periodData.previousLabel}: {periodData.previousOrdersCount.toLocaleString()}</p>
        </Card>
        <Card className="p-5 bg-slate-800/80 border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-xs">New Customers</p>
            <div className={`flex items-center gap-1 text-xs ${periodData.customersChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {periodData.customersChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(periodData.customersChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-green-400">{periodData.currentCustomers.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">vs {periodData.previousLabel}: {periodData.previousCustomers.toLocaleString()}</p>
        </Card>
        <Card className="p-5 bg-slate-800/80 border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-xs">Avg. Order Value</p>
            <div className={`flex items-center gap-1 text-xs ${periodData.aovChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {periodData.aovChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(periodData.aovChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-400">R{periodData.avgOrderValue.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">vs {periodData.previousLabel}: R{periodData.previousAvgOrderValue.toFixed(2)}</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-slate-800/80 border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Sales Overview</h3>
          <div className="h-64 chart-container">
            {filteredSalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px', color: 'white' }} />
                  <Legend />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Units Sold" />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue (R)" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No sales data available</div>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-slate-800/80 border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Category Distribution</h3>
          <div className="h-64 chart-container">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px', color: 'white' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No category data available</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ReportsAnalytics;
