import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { SectionCard } from '../../components/ui/dashboard-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { supportAPI } from '../../services/api';
import { useAdminAuth } from '../../components/AdminAuthContext';
import { Send, Loader2, MessageSquare, LifeBuoy, BookOpen } from 'lucide-react';
import { cn } from '../../lib/admin-utils';
import { Breadcrumbs } from '../../components/admin/Breadcrumbs';

const EMPTY_TICKET = {
  subject: '',
  category: 'General',
  priority: 'Medium',
  message: '',
};

const FAQ_ITEMS = [
  {
    question: 'How do I reset my admin password?',
    answer: 'Go to Admin Profile > Security and use the change password form. You will need your current password.',
  },
  {
    question: 'How do I manage user permissions?',
    answer: 'Navigate to User Management > Roles/Permissions to assign roles and toggle permissions for each user.',
  },
  {
    question: 'Where can I view system activity logs?',
    answer: 'Go to User Management > Activity Logs to see a history of admin actions, logins, and changes.',
  },
  {
    question: 'How do I export reports?',
    answer: 'Visit the Reports & Analytics page, select your date range and filters, then use the Export CSV or PDF buttons.',
  },
  {
    question: 'How do I configure payment methods?',
    answer: 'Payment methods are configured in Settings under the Payments section, or you can contact support for assistance.',
  },
];

export function AdminHelpSupportPage() {
  const { user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('submit');
  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_TICKET);

  useEffect(() => {
    if (activeTab === 'tickets') {
      loadTickets();
    }
  }, [activeTab]);

  const loadTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const data = await supportAPI.getTickets();
      setTickets(data.tickets || []);
    } catch {
      toast.error('Failed to load support tickets');
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await supportAPI.submitTicket({
        ...form,
        submittedBy: user?.email || 'admin',
      });
      toast.success('Support ticket submitted successfully');
      setForm(EMPTY_TICKET);
    } catch {
      toast.error('Failed to submit support ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between mb-4 py-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Help & Support</h1>
          <p className="text-slate-300">Get assistance, browse FAQs, and manage support tickets</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="submit" className="data-[state=active]:bg-blue-600">
            <Send className="h-4 w-4 mr-2" />
            Submit Request
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-blue-600">
            <MessageSquare className="h-4 w-4 mr-2" />
            My Tickets
          </TabsTrigger>
          <TabsTrigger value="faq" className="data-[state=active]:bg-blue-600">
            <BookOpen className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          <SectionCard title="Submit a Support Request" description="Our team will respond within 24 hours">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Subject</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Category</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="General">General</option>
                    <option value="Order">Order</option>
                    <option value="Repair">Repair</option>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Priority</Label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Message</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Please provide as much detail as possible..."
                  rows={6}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </>
                )}
              </Button>
            </form>
          </SectionCard>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <SectionCard title="Support Tickets" description="View and track your submitted requests">
            {isLoadingTickets ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <LifeBuoy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No support tickets yet</p>
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Ticket ID</TableHead>
                      <TableHead className="text-white">Subject</TableHead>
                      <TableHead className="text-white">Category</TableHead>
                      <TableHead className="text-white">Priority</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket._id}>
                        <TableCell className="text-white font-mono">#{String(ticket._id).slice(-6).toUpperCase()}</TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <SectionCard title="Frequently Asked Questions" description="Quick answers to common admin questions">
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <Card key={index} className="bg-slate-800 border-slate-700 p-4">
                  <h3 className="text-white font-semibold mb-2">{item.question}</h3>
                  <p className="text-slate-400 text-sm">{item.answer}</p>
                </Card>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminHelpSupportPage;
