import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { toast } from 'sonner';

const categoryData = [
  { name: 'Electronics', value: 35, color: '#3b82f6' },
  { name: 'Accessories', value: 25, color: '#10b981' },
  { name: 'Repairs', value: 20, color: '#f59e0b' },
  { name: 'Designs', value: 15, color: '#8b5cf6' },
  { name: 'Other', value: 5, color: '#6b7280' },
];

export function ReportsAnalytics() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsRes, ordersRes] = await Promise.all([
          ordersAPI.getStats(),
          ordersAPI.getAll({ limit: 100 }),
        ]);
        if (!isMounted) return;
        setStats(statsRes.data);
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
        setError(err.message || 'Failed to load reports');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Calendar className="h-8 w-8 animate-spin text-white" />
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

  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const totalCustomers = stats?.totalCustomers ?? 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">Reports & Analytics</h1>
          <p className="text-slate-400">View business insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('Date range selector coming soon')} className="border-slate-600 text-white hover:bg-slate-700">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button onClick={() => toast.info('Export feature coming soon')} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-green-400">R{totalRevenue.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-blue-400">{totalOrders.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">New Customers</p>
          <p className="text-3xl font-bold text-green-400">{totalCustomers.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Avg. Order Value</p>
          <p className="text-3xl font-bold text-yellow-400">R{avgOrderValue.toFixed(2)}</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Sales Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px', color: 'white' }} />
                <Bar dataKey="sales" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Sales Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px', color: 'white' }} />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Category Distribution</h3>
          <div className="h-64">
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
          </div>
        </Card>
      </div>
    </div>
  );
}
