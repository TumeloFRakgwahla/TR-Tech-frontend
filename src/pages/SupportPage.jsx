import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import Seo from '../components/Seo';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { supportAPI } from '../services/api';
import { Send, Loader2, LifeBuoy, Search } from 'lucide-react';

const EMPTY_TICKET = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  subject: '',
  category: 'General',
  priority: 'Medium',
  message: '',
};

export default function SupportPage() {
  const [form, setForm] = useState(EMPTY_TICKET);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await supportAPI.submitTicket(form);
      toast.success('Support ticket submitted successfully');
      setForm(EMPTY_TICKET);
      setLookupId(res.data?.ticketNumber || '');
      setLookupResult(res.data);
    } catch {
      toast.error('Failed to submit support ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupId.trim()) {
      toast.error('Please enter a ticket number');
      return;
    }
    setIsLookingUp(true);
    try {
      const res = await supportAPI.getTicket(lookupId.trim());
      setLookupResult(res.data);
    } catch {
      setLookupResult(null);
      toast.error('Ticket not found');
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo title="Support" description="Submit and track support tickets" />
      <Navbar />
      <div className="pt-24 md:pt-32 pb-20 md:pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LifeBuoy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Support</h1>
              <p className="text-muted-foreground mt-1">Submit a support request or track an existing ticket</p>
            </div>
          </div>

          <div className="space-y-8">
            <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Track a Ticket</h2>
              <div className="flex gap-3">
                <Input
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="Enter ticket number (e.g., TK-ABC123)"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button onClick={handleLookup} disabled={isLookingUp} className="bg-blue-600 hover:bg-blue-700">
                  {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              {lookupResult && (
                <div className="mt-4 p-4 bg-slate-800 border border-slate-700 rounded-lg space-y-2">
                  <p className="text-white font-medium">Ticket #{lookupResult.ticketNumber}</p>
                  <p className="text-slate-400 text-sm">Subject: {lookupResult.subject}</p>
                  <p className="text-slate-400 text-sm">Status: {lookupResult.status}</p>
                  <p className="text-slate-400 text-sm">Priority: {lookupResult.priority}</p>
                  <p className="text-slate-400 text-sm">Category: {lookupResult.category}</p>
                  <p className="text-slate-400 text-sm">Messages: {lookupResult.messages?.length || 0}</p>
                </div>
              )}
            </Card>

            <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Submit a Support Request</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white">Full Name</Label>
                    <Input
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      placeholder="Your full name"
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Email</Label>
                    <Input
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      placeholder="you@example.com"
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Phone (optional)</Label>
                  <Input
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="+27 00 000 0000"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </Card>
          </div>
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
