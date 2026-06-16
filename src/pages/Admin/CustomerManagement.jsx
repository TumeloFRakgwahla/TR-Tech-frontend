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
import { Search, Eye, Mail, Phone } from 'lucide-react';
import { customers } from '../../data/mockData';
import { useState } from 'react';

export function CustomerManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Customer Management</h1>
        <p className="text-slate-400">
          View and manage customer information
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Customers</p>
          <p className="text-3xl font-bold text-blue-400">3,456</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Active</p>
          <p className="text-3xl font-bold text-green-400">3,234</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">New This Month</p>
          <p className="text-3xl font-bold text-purple-400">156</p>
        </Card>
      </div>

      <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">Filter</Button>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">Export</Button>
        </div>
      </Card>

      {/* Customers Table */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Customer</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Phone</TableHead>
              <TableHead className="text-white">Orders</TableHead>
              <TableHead className="text-white">Total Spent</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{customer.name}</p>
                      <p className="text-sm text-slate-400">
                        Since {customer.joinDate}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-white">{customer.email}</TableCell>
                <TableCell className="text-white">{customer.phone}</TableCell>
                <TableCell className="text-white">{customer.orders}</TableCell>
                <TableCell className="font-semibold text-green-400">
                  R{customer.totalSpent.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-600">{customer.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                      <Phone className="h-4 w-4" />
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