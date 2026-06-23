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
import { Search, Eye, Mail, Phone, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { usersAPI } from '../../services/api';
import { toast } from 'sonner';

export function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await usersAPI.getAll({ role: 'customer', limit: 100 });
        if (isMounted) setCustomers(res.data || []);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load customers');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadCustomers();
    return () => { isMounted = false; };
  }, []);

  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.isActive !== false).length;
    const newThisMonth = customers.filter((c) => {
      if (!c.createdAt) return false;
      const created = new Date(c.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    return { total, active, newThisMonth };
  }, [customers]);

  const filteredCustomers = customers.filter((c) => {
    const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

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
        <h1 className="text-4xl font-bold mb-2 text-white">Customer Management</h1>
        <p className="text-slate-400">View and manage customer information</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Total Customers</p>
          <p className="text-3xl font-bold text-blue-400">{stats.total.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Active</p>
          <p className="text-3xl font-bold text-green-400">{stats.active.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <p className="text-slate-400 text-sm mb-1">New This Month</p>
          <p className="text-3xl font-bold text-purple-400">{stats.newThisMonth.toLocaleString()}</p>
        </Card>
      </div>

      <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-700 border-slate-600 text-white" />
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Customer</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Phone</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">No customers found</TableCell></TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer._id || customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {(customer.firstName || customer.name || '?').charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{customer.firstName} {customer.lastName}</p>
                        <p className="text-sm text-slate-400">Since {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{customer.email}</TableCell>
                  <TableCell className="text-white">{customer.phone}</TableCell>
                  <TableCell>
                    <Badge className={customer.isActive !== false ? 'bg-green-600' : 'bg-red-600'}>{customer.isActive !== false ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => toast.info('View customer details coming soon')}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => toast.info('Email client integration coming soon')}><Mail className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => toast.info('Call integration coming soon')}><Phone className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
