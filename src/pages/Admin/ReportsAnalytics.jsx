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
import { salesData, topProducts } from '../../data/mockData';

const categoryData = [
  { name: 'Electronics', value: 35, color: '#3b82f6' },
  { name: 'Accessories', value: 25, color: '#10b981' },
  { name: 'Repairs', value: 20, color: '#f59e0b' },
  { name: 'Designs', value: 15, color: '#8b5cf6' },
  { name: 'Other', value: 5, color: '#6b7280' },
];

export function ReportsAnalytics() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">Reports & Analytics</h1>
          <p className="text-slate-400">
            View business insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-green-400">R124,560</p>
          <p className="text-sm text-green-400 mt-2">+12.5% from last month</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-blue-400">1,245</p>
          <p className="text-sm text-green-400 mt-2">+8.2% from last month</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">New Customers</p>
          <p className="text-3xl font-bold text-green-400">89</p>
          <p className="text-sm text-green-400 mt-2">+15.3% from last month</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Avg. Order Value</p>
          <p className="text-3xl font-bold text-yellow-400">R100.05</p>
          <p className="text-sm text-slate-400 mt-2">
            -2.1% from last month
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Sales Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    color: 'white',
                  }}
                />
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    color: 'white',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Top Products</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={100} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    color: 'white',
                  }}
                />
                <Bar dataKey="sales" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Category Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    color: 'white',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}