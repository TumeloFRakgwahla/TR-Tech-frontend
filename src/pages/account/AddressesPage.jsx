import React, { useState } from 'react';
import { useAccount } from '../../components/AccountContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { MapPin, Plus, Edit, Trash2, Check, Loader2 } from 'lucide-react';

const provinceOptions = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

export function AddressesPage() {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, loading } = useAccount();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'delivery',
    street: '',
    city: '',
    postalCode: '',
    province: 'Gauteng',
    country: 'South Africa',
    isDefault: false,
    deliveryInstructions: '',
  });

  const resetForm = () => {
    setFormData({
      type: 'delivery',
      street: '',
      city: '',
      postalCode: '',
      province: 'Gauteng',
      country: 'South Africa',
      isDefault: false,
      deliveryInstructions: '',
    });
    setEditingId(null);
  };

  const handleEdit = (address) => {
    setFormData({
      type: address.type || 'delivery',
      street: address.street || '',
      city: address.city || '',
      postalCode: address.postalCode || '',
      province: address.province || 'Gauteng',
      country: address.country || 'South Africa',
      isDefault: address.isDefault || false,
      deliveryInstructions: address.deliveryInstructions || '',
    });
    setEditingId(address._id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = editingId
      ? await updateAddress(editingId, formData)
      : await addAddress(formData);

    setIsLoading(false);
    if (result.success) {
      resetForm();
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(id);
    }
  };

  const handleSetDefault = async (id) => {
    await setDefaultAddress(id);
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
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Address Book</h1>
            <p className="text-lg text-muted-foreground mt-1">Manage your delivery and billing addresses</p>
          </div>
          {!isFormOpen && (
            <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          )}
        </div>

        {isFormOpen && (
          <Card className="p-6 mb-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-foreground">Address Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white text-foreground focus:border-primary focus:ring-primary"
                >
                  <option value="delivery">Delivery</option>
                  <option value="billing">Billing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street" className="text-foreground">Street Address</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="bg-white border-border text-foreground"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-white border-border text-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-foreground">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="bg-white border-border text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province" className="text-foreground">Province</Label>
                  <select
                    id="province"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-white text-foreground focus:border-primary focus:ring-primary"
                  >
                    {provinceOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-foreground">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="bg-white border-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryInstructions" className="text-foreground">Delivery Instructions (Optional)</Label>
                <textarea
                  id="deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white text-foreground focus:border-primary focus:ring-primary resize-none"
                  placeholder="Any special delivery instructions..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="isDefault" className="text-sm text-foreground">Set as default address</Label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsFormOpen(false); resetForm(); }}
                  className="flex-1 border-border text-foreground hover:bg-accent"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? 'Update Address' : 'Add Address'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {addresses.length === 0 ? (
            <Card className="p-8 text-center bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No addresses saved yet</p>
              <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </Card>
          ) : (
            addresses.map((address) => (
              <Card key={address._id} className={`p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow ${address.isDefault ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize">{address.type}</Badge>
                      {address.isDefault && <Badge className="bg-primary text-primary-foreground">Default</Badge>}
                    </div>
                    <p className="font-medium text-foreground">{address.street}</p>
                    <p className="text-muted-foreground">
                      {address.city}, {address.province} {address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.country}</p>
                    {address.deliveryInstructions && (
                      <p className="text-sm text-muted-foreground mt-2 italic">"{address.deliveryInstructions}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!address.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(address._id)}
                        className="text-muted-foreground hover:text-primary"
                        title="Set as default"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(address)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address._id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AddressesPage;
