import { useState } from 'react';
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
} from '../../components/Sidebar';
import { Button } from '../../components/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/badge';
import { Textarea } from '../../components/ui/textarea';
import { Search, Eye, Phone, Mail, Plus } from 'lucide-react';
import { repairRequests as initialRepairs } from '../../data/repairs';

const statusColors = {
  Pending: 'bg-yellow-600',
  'In Progress': 'bg-blue-600',
  Completed: 'bg-green-600',
  Cancelled: 'bg-red-600',
};

export function AdminRepairsPage() {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState(initialRepairs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDevice, setFilterDevice] = useState('all');
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [isAddRepairOpen, setIsAddRepairOpen] = useState(false);

  const deviceTypes = Array.from(new Set(repairs.map((r) => r.deviceType)));

  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch =
      repair.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || repair.status === filterStatus;
    const matchesDevice = filterDevice === 'all' || repair.deviceType === filterDevice;
    return matchesSearch && matchesStatus && matchesDevice;
  });

  const updateRepairStatus = (repairId, newStatus) => {
    setRepairs(
      repairs.map((repair) =>
        repair.id === repairId
          ? {
              ...repair,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : repair
      )
    );
    alert('Repair status updated');
  };

  const updateRepairNotes = (repairId, notes) => {
    setRepairs(
      repairs.map((repair) =>
        repair.id === repairId
          ? {
              ...repair,
              notes,
              updatedAt: new Date().toISOString(),
            }
          : repair
      )
    );
    alert('Notes updated successfully');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: repairs.length,
    pending: repairs.filter((r) => r.status === 'Pending').length,
    inProgress: repairs.filter((r) => r.status === 'In Progress').length,
    completed: repairs.filter((r) => r.status === 'Completed').length,
  };

  const handleAddRepair = (newRepair) => {
    const now = new Date().toISOString();
    const repair = {
      ...newRepair,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    setRepairs([repair, ...repairs]);
    setIsAddRepairOpen(false);
    alert('Repair request created successfully');
  };

  const handleLogout = () => {
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
                  <SidebarMenuButton onClick={() => navigate('/admin')}>
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
                  <SidebarMenuButton isActive={true}>
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

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <header className="fixed bg-slate-950 top-0 left-64 right-0 z-30">
            <div className="flex justify-between items-center px-6 py-4">
              <div className="flex items-center">
                <SidebarTrigger />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-white">Repair Requests</h1>
                  <p className="text-sm text-slate-400">Manage repair requests and track progress</p>
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
              {/* Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div></div>
                <Dialog open={isAddRepairOpen} onOpenChange={setIsAddRepairOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Repair
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Repair Request</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Enter details for the new repair request
                      </DialogDescription>
                    </DialogHeader>
                    <AddRepairForm onSubmit={handleAddRepair} onClose={() => setIsAddRepairOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm">Total Requests</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-yellow-600/30">
                  <p className="text-slate-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-500 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-blue-600/30">
                  <p className="text-slate-400 text-sm">In Progress</p>
                  <p className="text-2xl font-bold text-blue-500 mt-1">{stats.inProgress}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-green-600/30">
                  <p className="text-slate-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-green-500 mt-1">{stats.completed}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-slate-800 rounded-lg p-4 space-y-4 border border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search repairs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterDevice} onValueChange={setFilterDevice}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="All Devices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Devices</SelectItem>
                      {deviceTypes.map((device) => (
                        <SelectItem key={device} value={device}>
                          {device}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Repairs Table */}
              <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700/50 bg-slate-900">
                      <TableHead className="text-slate-300">Request ID</TableHead>
                      <TableHead className="text-slate-300">Customer</TableHead>
                      <TableHead className="text-slate-300">Device</TableHead>
                      <TableHead className="text-slate-300">Issue</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Created</TableHead>
                      <TableHead className="text-slate-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRepairs.map((repair) => (
                      <TableRow key={repair.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="font-mono text-slate-300">#{repair.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{repair.customerName}</p>
                            <p className="text-sm text-slate-400">{repair.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white">{repair.brand} {repair.model}</p>
                            <p className="text-sm text-slate-400">{repair.deviceType}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300 max-w-xs truncate">
                          {repair.issue}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[repair.status] || 'bg-gray-600'} text-white`}>
                            {repair.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-sm">
                          {formatDate(repair.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRepair(repair)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredRepairs.length === 0 && (
                  <div className="text-center py-12 text-slate-400">No repair requests found</div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Repair Details Dialog */}
        {selectedRepair && (
          <Dialog open={!!selectedRepair} onOpenChange={() => setSelectedRepair(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Repair Request #{selectedRepair.id}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  View and update repair request details
                </DialogDescription>
              </DialogHeader>
              <RepairDetailsForm
                repair={selectedRepair}
                onUpdateStatus={(status) => {
                  updateRepairStatus(selectedRepair.id, status);
                  setSelectedRepair({ ...selectedRepair, status });
                }}
                onUpdateNotes={(notes) => {
                  updateRepairNotes(selectedRepair.id, notes);
                  setSelectedRepair({ ...selectedRepair, notes });
                }}
                onClose={() => setSelectedRepair(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </SidebarProvider>
  );
}

function RepairDetailsForm({ repair, onUpdateStatus, onUpdateNotes, onClose }) {
  const [notes, setNotes] = useState(repair.notes || '');

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <div className="bg-slate-900 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-white">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-slate-400">Name</p>
            <p className="font-medium text-white">{repair.customerName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <p className="font-medium text-white">{repair.email}</p>
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-slate-400">Phone</p>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <p className="font-medium text-white">{repair.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Device Information */}
      <div className="bg-slate-900 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-white">Device Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-slate-400">Device Type</p>
            <p className="font-medium text-white">{repair.deviceType}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Brand</p>
            <p className="font-medium text-white">{repair.brand}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-slate-400">Model</p>
            <p className="font-medium text-white">{repair.model}</p>
          </div>
        </div>
      </div>

      {/* Issue Description */}
      <div className="space-y-2">
        <Label className="text-white">Issue Description</Label>
        <div className="bg-slate-900 rounded-lg p-4">
          <p className="text-white">{repair.issue}</p>
        </div>
      </div>

      {/* Status Update */}
      <div className="space-y-2">
        <Label htmlFor="status" className="text-white">Status</Label>
        <Select value={repair.status} onValueChange={onUpdateStatus}>
          <SelectTrigger id="status" className="bg-slate-900 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-white">Internal Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about repair progress, parts needed, etc."
          rows={4}
          className="bg-slate-900 border-slate-700 text-white"
        />
      </div>

      {/* Timestamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-400">Created</p>
          <p className="text-white">
            {new Date(repair.createdAt).toLocaleString('en-ZA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div>
          <p className="text-slate-400">Last Updated</p>
          <p className="text-white">
            {new Date(repair.updatedAt).toLocaleString('en-ZA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="border-slate-600 text-white hover:bg-slate-700">
          Close
        </Button>
        <Button
          onClick={() => {
            onUpdateNotes(notes);
            onClose();
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function AddRepairForm({ onSubmit, onClose }) {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [issue, setIssue] = useState('');
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      customerName,
      email,
      phone,
      deviceType,
      brand,
      model,
      issue,
      status,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="bg-slate-900 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-white">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-white">Name</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Customer Email"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-white">Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Customer Phone"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>
      </div>

      {/* Device Information */}
      <div className="bg-slate-900 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-white">Device Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-white">Device Type</Label>
            <Input
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              placeholder="Device Type"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Brand</Label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Brand"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-white">Model</Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Model"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>
      </div>

      {/* Issue Description */}
      <div className="space-y-2">
        <Label className="text-white">Issue Description</Label>
        <Textarea
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          placeholder="Describe the issue"
          rows={4}
          className="bg-slate-900 border-slate-700 text-white"
        />
      </div>

      {/* Status Update */}
      <div className="space-y-2">
        <Label htmlFor="status" className="text-white">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status" className="bg-slate-900 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-white">Internal Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about repair progress, parts needed, etc."
          rows={4}
          className="bg-slate-900 border-slate-700 text-white"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="border-slate-600 text-white hover:bg-slate-700">
          Close
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Repair
        </Button>
      </div>
    </form>
  );
}

export default AdminRepairsPage;
