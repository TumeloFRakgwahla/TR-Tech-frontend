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
import { Search, Eye, Printer, Download } from 'lucide-react';
import { orders } from '../../data/mockData';
import { useState } from 'react';

export function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-600';
      case 'Shipped':
        return 'bg-blue-600';
      case 'Processing':
        return 'bg-yellow-600';
      case 'Pending':
        return 'bg-slate-600';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Order Management</h1>
        <p className="text-slate-400">
          View and manage customer orders
        </p>
      </div>

      {/* Search and Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-blue-400">1,245</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-400">45</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Processing</p>
          <p className="text-3xl font-bold text-blue-400">128</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Delivered</p>
          <p className="text-3xl font-bold text-green-400">1,072</p>
        </Card>
      </div>

      <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">Filter</Button>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Orders Table */}
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
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-semibold text-white">{order.id}</TableCell>
                <TableCell className="text-white">{order.customer}</TableCell>
                <TableCell className="text-white">{order.date}</TableCell>
                <TableCell className="text-white">{order.items}</TableCell>
                <TableCell className="font-semibold text-green-400">
                  R{order.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}