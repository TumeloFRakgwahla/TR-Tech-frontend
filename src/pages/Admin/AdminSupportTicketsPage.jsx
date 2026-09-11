import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
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
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import { supportAPI } from '../../services/api';
import {
  Search,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  Eye,
} from 'lucide-react';
import { cn } from '../../lib/admin-utils';
import { Breadcrumbs } from '../../components/admin/Breadcrumbs';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];
const CATEGORY_OPTIONS = ['General', 'Order', 'Repair', 'Technical', 'Billing', 'Other'];

export function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const data = await supportAPI.getTickets(params);
      setTickets(data.tickets || []);
    } catch {
      toast.error('Failed to load support tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const handleView = async (ticket) => {
    try {
      const data = await supportAPI.getTicket(ticket._id);
      setSelectedTicket(data.data);
    } catch {
      toast.error('Failed to load ticket details');
    }
  };

  const handleStatusUpdate = async (ticketId, status) => {
    try {
      const data = await supportAPI.updateTicket(ticketId, { status });
      setSelectedTicket(data.data);
      setTickets((prev) => prev.map((t) => (t._id === ticketId ? data.data : t)));
      toast.success('Ticket updated');
    } catch {
      toast.error('Failed to update ticket');
    }
  };

  const handlePriorityUpdate = async (ticketId, priority) => {
    try {
      const data = await supportAPI.updateTicket(ticketId, { priority });
      setSelectedTicket(data.data);
      setTickets((prev) => prev.map((t) => (t._id === ticketId ? data.data : t)));
      toast.success('Ticket updated');
    } catch {
      toast.error('Failed to update ticket');
    }
  };

  const handleCategoryUpdate = async (ticketId, category) => {
    try {
      const data = await supportAPI.updateTicket(ticketId, { category });
      setSelectedTicket(data.data);
      setTickets((prev) => prev.map((t) => (t._id === ticketId ? data.data : t)));
      toast.success('Ticket updated');
    } catch {
      toast.error('Failed to update ticket');
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    setIsSubmitting(true);
    try {
      const data = await supportAPI.updateTicket(selectedTicket._id, {
        message: replyMessage.trim(),
      });
      setSelectedTicket(data.data);
      setTickets((prev) => prev.map((t) => (t._id === selectedTicket._id ? data.data : t)));
      setReplyMessage('');
      toast.success('Reply added');
    } catch {
      toast.error('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTicket) return;
    setIsDeleting(true);
    try {
      await supportAPI.deleteTicket(selectedTicket._id);
      setTickets((prev) => prev.filter((t) => t._id !== selectedTicket._id));
      setSelectedTicket(null);
      toast.success('Ticket deleted');
    } catch {
      toast.error('Failed to delete ticket');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--tr-text-muted))' }}>
            Manage customer support requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="bg-slate-800 border-slate-700 text-white pl-9 w-64"
              onKeyDown={(e) => e.key === 'Enter' && loadTickets()}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button onClick={loadTickets} className="bg-blue-600 hover:bg-blue-700">
            Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Ticket</TableHead>
              <TableHead className="text-white">Customer</TableHead>
              <TableHead className="text-white">Subject</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Priority</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No support tickets found</p>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell className="text-white font-mono">#{ticket.ticketNumber}</TableCell>
                  <TableCell className="text-slate-400">{ticket.customerName}</TableCell>
                  <TableCell className="text-white">{ticket.subject}</TableCell>
                  <TableCell className="text-slate-400 capitalize">{ticket.category}</TableCell>
                  <TableCell className="text-slate-400 capitalize">{ticket.priority}</TableCell>
                  <TableCell>
                    <span className={cn(
                      'admin-badge',
                      ticket.status === 'Open' ? 'admin-badge-warning' :
                      ticket.status === 'In Progress' ? 'admin-badge-info' :
                      ticket.status === 'Resolved' ? 'admin-badge-success' : 'admin-badge-neutral'
                    )}>
                      {ticket.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-slate-700"
                        onClick={() => handleView(ticket)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>Ticket #{selectedTicket.ticketNumber}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {selectedTicket.subject} — {selectedTicket.customerName} ({selectedTicket.customerEmail})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Status</Label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusUpdate(selectedTicket._id, e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Priority</Label>
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handlePriorityUpdate(selectedTicket._id, e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Category</Label>
                    <select
                      value={selectedTicket.category}
                      onChange={(e) => handleCategoryUpdate(selectedTicket._id, e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Conversation</Label>
                  <div className="space-y-3 max-h-64 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg p-4">
                    {(selectedTicket.messages || []).map((msg, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-white font-medium">{msg.senderName}</span>
                        <span className="text-slate-500 text-xs ml-2">{new Date(msg.createdAt).toLocaleString()}</span>
                        <p className="text-slate-300 mt-1">{msg.message}</p>
                      </div>
                    ))}
                    {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                      <p className="text-slate-500 text-sm">No messages yet.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Reply</Label>
                  <div className="flex gap-3">
                    <Textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="bg-slate-800 border-slate-700 text-white flex-1"
                      rows={3}
                    />
                    <Button onClick={handleReply} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 self-end">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="gap-2"
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete Ticket
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminSupportTicketsPage;
