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
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { dashboardStats, salesData, topProducts, orders } from '../../data/mockData';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const stats = [
    {
      title: 'Total Revenue',
      value: `R${dashboardStats.totalRevenue.toLocaleString()}`,
      change: dashboardStats.revenueChange,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20',
    },
    {
      title: 'Total Orders',
      value: dashboardStats.totalOrders.toLocaleString(),
      change: dashboardStats.ordersChange,
      icon: ShoppingCart,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20',
    },
    {
      title: 'Total Customers',
      value: dashboardStats.totalCustomers.toLocaleString(),
      change: dashboardStats.customersChange,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20',
    },
    {
      title: 'Products Sold',
      value: dashboardStats.productsSold.toLocaleString(),
      change: dashboardStats.salesChange,
      icon: Package,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-600/20',
    },
  ];

  const lowStockProducts = [
    { name: 'iPhone 15 Pro Max', stock: 5, threshold: 10 },
    { name: 'MacBook Pro 16"', stock: 3, threshold: 5 },
    { name: 'Sony WH-1000XM5', stock: 8, threshold: 15 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Dashboard</h1>
        <p className="text-slate-400">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="p-6 bg-slate-800 border-slate-700 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {stat.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
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
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Revenue Analytics</h2>
            <select className="border border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-700 text-white">
              <option className="bg-slate-700">Last 6 Months</option>
              <option className="bg-slate-700">Last 3 Months</option>
              <option className="bg-slate-700">This Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 4 }}
                name="Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Products */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Top Products</h2>
            <Link to="/admin/products">
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={product.name} className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{product.name}</p>
                    <p className="text-xs text-slate-400">
                      {product.sales} sold
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-green-400">
                  R{product.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl"
              >
                <div>
                  <p className="font-semibold text-white">{order.id}</p>
                  <p className="text-sm text-slate-400">
                    {order.customer} • {order.date}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    className={
                      order.status === 'Delivered'
                        ? 'bg-green-600'
                        : order.status === 'Shipped'
                        ? 'bg-blue-600'
                        : order.status === 'Processing'
                        ? 'bg-yellow-600'
                        : 'bg-slate-600'
                    }
                  >
                    {order.status}
                  </Badge>
                  <p className="text-sm font-bold text-blue-400 mt-2">
                    R{order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Low Stock Alerts</h2>
            <Link to="/admin/inventory">
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">
                Manage
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {lowStockProducts.map((product) => (
              <div
                key={product.name}
                className="flex items-start gap-3 p-4 border-l-4 border-yellow-600 bg-yellow-600/5 rounded-lg"
              >
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{product.name}</p>
                  <p className="text-sm text-slate-400">
                    Only {product.stock} left in stock
                  </p>
                  <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{
                        width: `${(product.stock / product.threshold) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}