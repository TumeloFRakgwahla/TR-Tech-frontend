import { products } from '../../data/products';
import { repairRequests } from '../../data/repairs';
import { orders } from '../../data/orders';
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
  SidebarInset,
} from '../../components/Sidebar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/card';

export function AdminDashboardPage() {
  const navigate = useNavigate();

  // Calculate metrics
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.total, 0);
    
  const totalOrders = orders.length;
  const activeRepairs = repairRequests.filter(
    (r) => r.status === 'Pending' || r.status === 'In Progress'
  ).length;
  const totalProducts = products.length;

  // Sales trend data - Last 7 days revenue performance
  const salesData = [
    { day: 'Mon', sales: 12000 },
    { day: 'Tue', sales: 18000 },
    { day: 'Wed', sales: 15000 },
    { day: 'Thu', sales: 22000 },
    { day: 'Fri', sales: 28000 },
    { day: 'Sat', sales: 36000 },
    { day: 'Sun', sales: 24000 },
  ];

  const COLORS = {
    Pending: '#ca8a04',
    Processing: '#2563eb',
    'In Progress': '#2563eb',
    Shipped: '#9333ea',
    Delivered: '#16a34a',
    Completed: '#16a34a',
    Cancelled: '#dc2626',
  };


  // Order status distribution - Current order status breakdown
  const orderStatusData = [
    { name: 'Delivered', value: 4, percentage: 33 },
    { name: 'Processing', value: 2, percentage: 17 },
    { name: 'Pending', value: 2, percentage: 17 },
    { name: 'Shipped', value: 2, percentage: 17 },
    { name: 'Cancelled', value: 2, percentage: 17 },
  ];

  // Repair status distribution - Current repair request status
  const repairStatusData = [
    { name: 'Pending', value: 2 },
    { name: 'In Progress', value: 3 },
    { name: 'Completed', value: 2 },
    { name: 'Cancelled', value: 1 },
  ];

  // Recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Recent repairs
  const recentRepairs = [...repairRequests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = () => {
    // Handle logout logic here
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
                  <SidebarMenuButton isActive={true}>
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
                  <SidebarMenuButton onClick={() => navigate('/admin/orders')}>
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

        {/* Main Content with Fixed Header */}
        <div className="flex-1 ml-64">
          <header className="fixed bg-slate-950 top-0 left-64 right-0  z-30">
            <div className="flex justify-between items-center px-6 py-4">
              <div className="flex items-center">
                <SidebarTrigger />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                  <p className="text-sm text-slate-400">Welcome to TR-Tech Admin Portal</p>
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

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Total Revenue</h3>
                    <svg className="w-6 h-6 opacity-75" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold">R{totalRevenue.toLocaleString()}</div>
                  <p className="text-xs opacity-75 mt-1">+12% from last month</p>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Total Orders</h3>
                    <svg className="w-6 h-6 opacity-75" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <p className="text-xs opacity-75 mt-1">+8% from last month</p>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Active Repairs</h3>
                    <svg className="w-6 h-6 opacity-75" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold">{activeRepairs}</div>
                  <p className="text-xs opacity-75 mt-1">Currently in progress</p>
                </div>

                <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Total Products</h3>
                    <svg className="w-6 h-6 opacity-75" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs opacity-75 mt-1">In inventory</p>
                </div>
              </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Sales Trend</CardTitle>
            <CardDescription className="text-slate-400">
              Last 7 days revenue performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-80 p-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-400">
                {[40, 30, 20, 10, 0].map((level) => (
                  <span key={level}>R{(level)}k</span>
                ))}
              </div>

              {/* Chart area */}
              <div className="ml-8 mr-8 h-full relative">
                {/* Grid lines */}
                <div className="absolute inset-0">
                  {[0, 1, 2, 3, 4].map((line) => (
                    <div
                      key={line}
                      className="absolute w-full border-t border-slate-600 opacity-30"
                      style={{ top: `${line * 25}%` }}
                    ></div>
                  ))}
                </div>

                {/* SVG Line Chart */}
                <svg width="100%" height="100%" viewBox="0 0 350 200" style={{ background: 'transparent' }}>
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((line) => (
                    <line
                      key={line}
                      x1="30"
                      y1={line * 40}
                      x2="320"
                      y2={line * 40}
                      stroke="#374151"
                      strokeWidth="1"
                      opacity="0.2"
                    />
                  ))}

                  {/* Vertical grid lines for each day */}
                  {salesData.map((_, index) => (
                    <line
                      key={`v-${index}`}
                      x1={30 + (index / (salesData.length - 1)) * 290}
                      y1="0"
                      x2={30 + (index / (salesData.length - 1)) * 290}
                      y2="200"
                      stroke="#374151"
                      strokeWidth="1"
                      opacity="0.15"
                    />
                  ))}

                  {/* Area under the line */}
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  <polygon
                    fill="url(#areaGradient)"
                    points={`30,200 ${salesData.map((item, index) => {
                      const x = 30 + (index / (salesData.length - 1)) * 290;
                      const maxSales = 40000;
                      const y = 200 - (item.sales / maxSales) * 160;
                      return `${x},${y}`;
                    }).join(' ')} 320,200`}
                  />

                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={salesData.map((item, index) => {
                      const x = 30 + (index / (salesData.length - 1)) * 290;
                      const maxSales = 40000;
                      const y = 200 - (item.sales / maxSales) * 160;
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Data points with labels */}
                  {salesData.map((item, index) => {
                    const x = 30 + (index / (salesData.length - 1)) * 290;
                    const maxSales = 40000;
                    const y = 200 - (item.sales / maxSales) * 160;

                    return (
                      <g key={`point-${index}`}>
                        {/* Data point circle */}
                        <circle
                          cx={x}
                          cy={y}
                          r="7"
                          fill="#3b82f6"
                          stroke="#ffffff"
                          strokeWidth="3"
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                        />

                        {/* Day label above point */}
                        <text
                          x={x}
                          y={y - 15}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="12"
                          fontWeight="700"
                          style={{
                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                            fontFamily: 'system-ui, sans-serif'
                          }}
                        >
                          {item.day}
                        </text>

                        {/* Value label below point */}
                        <text
                          x={x}
                          y={y + 22}
                          textAnchor="middle"
                          fill="#60a5fa"
                          fontSize="11"
                          fontWeight="800"
                          style={{
                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                            fontFamily: 'system-ui, sans-serif'
                          }}
                        >
                          R{(item.sales / 1000).toFixed(0)}k
                        </text>

                        {/* Small connecting line */}
                        <line
                          x1={x}
                          y1={y + 8}
                          x2={x}
                          y2={y + 18}
                          stroke="#60a5fa"
                          strokeWidth="1.5"
                          opacity="0.8"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltips on hover */}
                {salesData.map((item, index) => {
                  const x = (index / (salesData.length - 1)) * 100;
                  const maxSales = 40000;
                  const y = 100 - (item.sales / maxSales) * 80;

                  return (
                    <div
                      key={index}
                      className="absolute transform -translate-x-1/2 -translate-y-full opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                      style={{
                        left: `${10 + x}%`,
                        top: `${y}%`,
                      }}
                    >
                      <div className="bg-slate-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-slate-600">
                        {item.day}: R{item.sales.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-8 right-8 flex justify-between text-xs text-slate-400">
                {salesData.map((item, index) => (
                  <span key={index} className="text-center">{item.day}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Order Status Distribution</CardTitle>
            <CardDescription className="text-slate-400">
              Current order status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {/* Larger SVG Pie Chart */}
              <svg width="400" height="400" viewBox="0 0 400 400" className="mb-6">
                {/* Pie slices */}
                {(() => {
                  let cumulativePercentage = 0;
                  return orderStatusData.map((item, index) => {
                    const startAngle = (cumulativePercentage / 100) * 360;
                    const endAngle = ((cumulativePercentage + item.percentage) / 100) * 360;
                    cumulativePercentage += item.percentage;

                    // Convert angles to radians
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;

                    // Calculate path for larger pie (radius 150)
                    const x1 = 200 + 150 * Math.cos(startRad);
                    const y1 = 200 + 150 * Math.sin(startRad);
                    const x2 = 200 + 150 * Math.cos(endRad);
                    const y2 = 200 + 150 * Math.sin(endRad);

                    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                    const pathData = [
                      `M 200 200`,
                      `L ${x1} ${y1}`,
                      `A 150 150 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      `Z`
                    ].join(' ');

                    // Calculate label position (closer to center for text)
                    const labelAngle = startAngle + (endAngle - startAngle) / 2;
                    const labelRad = (labelAngle * Math.PI) / 180;
                    const labelX = 200 + 90 * Math.cos(labelRad);
                    const labelY = 200 + 90 * Math.sin(labelRad);

                    // Calculate percentage position (further out)
                    const percentX = 200 + 120 * Math.cos(labelRad);
                    const percentY = 200 + 120 * Math.sin(labelRad);

                    return (
                      <g key={`slice-${index}`}>
                        {/* Pie slice */}
                        <path
                          d={pathData}
                          fill={COLORS[item.name]}
                          stroke="#1e293b"
                          strokeWidth="3"
                          style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))' }}
                        />

                        {/* Combined name and percentage label inside slice */}
                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#ffffff"
                          fontSize="13"
                          fontWeight="700"
                          style={{
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))'
                          }}
                        >
                          {item.name}
                        </text>
                        <text
                          x={labelX}
                          y={labelY + 16}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#ffffff"
                          fontSize="15"
                          fontWeight="800"
                          style={{
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))'
                          }}
                        >
                          {item.percentage}%
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repair Status Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Repair Requests Overview</CardTitle>
          <CardDescription className="text-slate-400">
            Current repair request status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-full flex flex-col">
            {/* Full-size SVG Bar Chart filling the card */}
            <svg width="100%" height="350" viewBox="0 0 600 350" className="flex-1">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((line) => (
                <line
                  key={line}
                  x1="70"
                  y1={320 - line * 64}
                  x2="550"
                  y2={320 - line * 64}
                  stroke="#374151"
                  strokeWidth="1"
                  opacity="0.3"
                />
              ))}

              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4].map((level) => (
                <text
                  key={level}
                  x="60"
                  y={325 - level * 64}
                  textAnchor="end"
                  fill="#9ca3af"
                  fontSize="14"
                  fontWeight="500"
                >
                  {level}
                </text>
              ))}

              {/* Bars */}
              {repairStatusData.map((item, index) => {
                const barWidth = 80;
                const barSpacing = 40;
                const startX = 100 + index * (barWidth + barSpacing);
                const barHeight = (item.value / 4) * 256; // Max value is 4, chart area height is 256
                const barY = 320 - barHeight;

                return (
                  <g key={`bar-${index}`}>
                    {/* Bar */}
                    <rect
                      x={startX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={COLORS[item.name]}
                      stroke="#1e293b"
                      strokeWidth="2"
                      rx="4"
                      style={{
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                        transition: 'all 1s ease'
                      }}
                    />

                    {/* Value label on top of bar */}
                    <text
                      x={startX + barWidth / 2}
                      y={barY - 12}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="18"
                      fontWeight="700"
                      style={{
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))'
                      }}
                    >
                      {item.value}
                    </text>

                    {/* X-axis label */}
                    <text
                      x={startX + barWidth / 2}
                      y="340"
                      textAnchor="middle"
                      fill="#9ca3af"
                      fontSize="14"
                      fontWeight="500"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {item.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg">
                  <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                        <p className="text-sm text-slate-400">Latest customer orders</p>
                      </div>
                      <button
                        onClick={() => navigate('/admin/orders')}
                        className="text-blue-400 hover:text-blue-300 hover:bg-slate-700 px-3 py-1 rounded text-sm"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-slate-900 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-white">{order.orderNumber}</p>
                            <p className="text-sm text-slate-400">{order.customerName}</p>
                            <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">R {order.total.toLocaleString()}</p>
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                                  style={{ backgroundColor: COLORS[order.status] || COLORS.Pending }}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Repairs */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg">
                  <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Recent Repairs</h3>
                        <p className="text-sm text-slate-400">Latest repair requests</p>
                      </div>
                      <button
                        onClick={() => navigate('/admin/repairs')}
                        className="text-blue-400 hover:text-blue-300 hover:bg-slate-700 px-3 py-1 rounded text-sm"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentRepairs.map((repair) => (
                        <div
                          key={repair.id}
                          className="flex items-center justify-between p-3 bg-slate-900 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-white">
                              {repair.brand} {repair.model}
                            </p>
                            <p className="text-sm text-slate-400">{repair.customerName}</p>
                            <p className="text-xs text-slate-500">{formatDate(repair.createdAt)}</p>
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                                style={{ backgroundColor: COLORS[repair.status] || COLORS.Pending }}>
                            {repair.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AdminDashboardPage;
