import { useState, useEffect } from 'react';
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
import { Search, Edit, Trash2, User, Loader2 } from 'lucide-react';
import { usersAPI } from '../../services/api';
import { toast } from 'sonner';

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await usersAPI.getAll({ limit: 100 });
        if (isMounted) setUsers(res.data || []);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load users');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadUsers();
    return () => { isMounted = false; };
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-blue-600';
      case 'manager': return 'bg-purple-600';
      case 'customer': return 'bg-slate-600';
      default: return 'bg-slate-600';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' || status === true ? 'bg-green-600' : 'bg-red-600';
  };

  const filteredUsers = users.filter((user) => {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">User Management</h1>
          <p className="text-slate-400">Manage user accounts and permissions</p>
        </div>
      </div>

      <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-700 border-slate-600 text-white" />
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">User</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Role</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Joined</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400">No users found</TableCell></TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id || user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-slate-400">
                          ID: {String(user._id || user.id).slice(-6)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.isActive)}>{user.isActive !== false ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell className="text-white">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => toast.info('Edit user form coming soon')}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:bg-slate-700" onClick={async () => {
                        if (!window.confirm('Delete this user?')) return;
                        try {
                          await usersAPI.delete(user._id || user.id);
                          toast.success('User deleted');
                          setUsers(users.filter((u) => (u._id || u.id) !== (user._id || user.id)));
                        } catch (e) { toast.error('Delete failed'); }
                      }}><Trash2 className="h-4 w-4" /></Button>
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
