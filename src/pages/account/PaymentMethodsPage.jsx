import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { paymentMethodsAPI } from '../../services/api';
import { toast } from 'sonner';
import { CreditCard, Plus, Trash2, Star, Loader2 } from 'lucide-react';

const gatewayOptions = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'paystack', label: 'Paystack' },
  { value: 'flutterwave', label: 'Flutterwave' },
  { value: 'manual', label: 'Manual' },
];

export function PaymentMethodsPage() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    gateway: 'stripe',
    gatewayToken: '',
    brand: '',
    last4: '',
    expMonth: '',
    expYear: '',
  });
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentMethodsAPI.getAll();
      setMethods(res.data || []);
    } catch {
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm({ gateway: 'stripe', gatewayToken: '', brand: '', last4: '', expMonth: '', expYear: '' });
    setError(null);
  };

  const handleAdd = async () => {
    if (!form.gatewayToken.trim()) {
      setError('A gateway token is required');
      return;
    }
    if (!/^\d{2,4}$/.test(form.last4.trim())) {
      setError('Last 4 digits must be 2-4 numbers');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await paymentMethodsAPI.add({
        gateway: form.gateway,
        gatewayToken: form.gatewayToken.trim(),
        brand: form.brand.trim() || undefined,
        last4: form.last4.trim(),
        expMonth: form.expMonth ? Number(form.expMonth) : undefined,
        expYear: form.expYear ? Number(form.expYear) : undefined,
      });
      toast.success('Payment method added');
      setDialogOpen(false);
      resetForm();
      load();
    } catch (e) {
      setError(e.message || 'Failed to add payment method');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await paymentMethodsAPI.setDefault(id);
      setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m._id === id })));
      toast.success('Default payment method updated');
    } catch {
      toast.error('Failed to update default');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this payment method?')) return;
    try {
      await paymentMethodsAPI.remove(id);
      setMethods((prev) => prev.filter((m) => m._id !== id));
      toast.success('Payment method removed');
    } catch {
      toast.error('Failed to remove payment method');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Payment Methods</h1>
            <p className="text-lg text-muted-foreground mt-1">Manage your saved cards securely</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Add Method
          </Button>
        </div>

        {methods.length === 0 ? (
          <Card className="p-12 text-center bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No payment methods</h2>
            <p className="text-muted-foreground mb-6">You haven't saved any payment methods yet.</p>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Add Method
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {methods.map((m) => (
              <Card key={m._id} className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {m.brand || m.gateway} {m.last4 ? `•••• ${m.last4}` : ''}
                        </h3>
                        {m.isDefault && <Badge className="bg-primary text-primary-foreground">Default</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {m.gateway}
                        {m.expMonth && m.expYear ? ` · Expires ${String(m.expMonth).padStart(2, '0')}/${m.expYear}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!m.isDefault && (
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={() => handleSetDefault(m._id)}>
                        <Star className="h-4 w-4 mr-1" /> Set default
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(m._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white rounded-lg">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Gateway</Label>
                <select
                  value={form.gateway}
                  onChange={(e) => setForm({ ...form, gateway: e.target.value })}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-foreground"
                >
                  {gatewayOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              {/*
                In production the gatewayToken is obtained client-side from the payment
                gateway's JS SDK (e.g. Stripe Elements / Paystack Inline) after the user
                enters their card. We never receive or store raw card numbers or CVV.
              */}
              <div>
                <Label className="text-foreground">Gateway token</Label>
                <Input
                  value={form.gatewayToken}
                  onChange={(e) => setForm({ ...form, gatewayToken: e.target.value })}
                  placeholder="tok_xxx from gateway"
                  className="bg-white border-border text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Brand (optional)</Label>
                  <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Visa" className="bg-white border-border text-foreground" />
                </div>
                <div>
                  <Label className="text-foreground">Last 4 digits</Label>
                  <Input value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value })} placeholder="4242" className="bg-white border-border text-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Expiry month</Label>
                  <Input value={form.expMonth} onChange={(e) => setForm({ ...form, expMonth: e.target.value })} placeholder="12" className="bg-white border-border text-foreground" />
                </div>
                <div>
                  <Label className="text-foreground">Expiry year</Label>
                  <Input value={form.expYear} onChange={(e) => setForm({ ...form, expYear: e.target.value })} placeholder="2027" className="bg-white border-border text-foreground" />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground hover:bg-accent">Cancel</Button>
              <Button onClick={handleAdd} disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {submitting ? 'Saving…' : 'Add method'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default PaymentMethodsPage;
