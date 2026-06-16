import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Search, Plus, Edit, Trash2, Shield, User } from 'lucide-react';

const users = [
  {
    id: 'USR-001',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    joinDate: '2024-01-15',
  },
  {
    id: 'USR-002',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'Customer',
    status: 'Active',
    joinDate: '2024-02-20',
  },
  {
    id: 'USR-003',
    name: 'Mike Brown',
    email: 'mike@example.com',
    role: 'Customer',
    status: 'Inactive',
    joinDate: '2024-03-10',
  },
  {
    id: 'USR-004',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'Manager',
    status: 'Active',
    joinDate: '2024-01-25',
  },
  {
    id: 'USR-005',
    name: 'David Wilson',
    email: 'david@example.com',
    role: 'Customer',
    status: 'Active',
    joinDate: '2024-04-05',
  },
];

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-blue-600';
      case 'Manager':
        return 'bg-purple-600';
      default:
        return 'bg-slate-600';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-600' : 'bg-red-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">User Management</h1>
          <p className="text-slate-400">
            Manage user accounts and permissions
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">Filter</Button>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">Export</Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">User</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Role</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Join Date</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-sm text-slate-400">
                        {user.id}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-white">{user.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-white">{user.joinDate}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:bg-slate-700"
                    >
                      <Trash2 className="h-4 w-4" />
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