import { useState, useEffect, useRef } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Plus, Search, Edit, Trash2, Loader2, Upload, X } from 'lucide-react';
import { servicesAPI, uploadAPI } from '../../services/api';
import { getProductImageUrl } from '../../lib/imageUrl';
import { PRODUCT_PLACEHOLDER_IMAGE, SERVICE_CATEGORIES } from '../../constants';
import { toast } from 'sonner';

const emptyService = {
  name: '',
  description: '',
  category: 'Phone Repair',
  price: '',
  estimatedTime: '1-2 hours',
  image: '',
  icon: 'Wrench',
  features: [],
  status: 'Active',
};

export function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(emptyService);
  const [submitError, setSubmitError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await servicesAPI.getAll({ limit: 100 });
      setServices(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreate = () => {
    setEditingService(null);
    setForm(emptyService);
    setSubmitError('');
    setDialogOpen(true);
  };

  const openEdit = (service) => {
    setEditingService(service);
    setForm({
      name: service.name || '',
      description: service.description || '',
      category: service.category || 'Phone Repair',
      price: service.price ?? '',
      estimatedTime: service.estimatedTime || '1-2 hours',
      image: service.image || '',
      icon: service.icon || 'Wrench',
      features: Array.isArray(service.features) ? service.features : [],
      status: service.status || 'Active',
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await servicesAPI.delete(id);
      toast.success('Service deleted');
      loadServices();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 1 - (form.image ? 1 : 0);
    if (remaining <= 0) {
      toast.error('Only one image allowed per service');
      return;
    }
    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) return;

    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be smaller than 5MB');
        return;
      }
    }

    setUploading(true);
    try {
      const res = await uploadAPI.uploadImages(toUpload);
      if (res.success && res.images) {
        setForm(prev => ({
          ...prev,
          image: res.images[0].url,
        }));
        toast.success('Image uploaded');
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const payload = {
      ...form,
      price: Number(form.price),
      features: Array.isArray(form.features) ? form.features : [],
    };

    try {
      if (editingService) {
        await servicesAPI.update(editingService._id, payload);
        toast.success('Service updated');
      } else {
        await servicesAPI.create(payload);
        toast.success('Service created');
      }
      setDialogOpen(false);
      loadServices();
    } catch (err) {
      setSubmitError(err.message || 'Save failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 py-4">
        <div>
          <p className="text-slate-400">Manage your service catalog and pricing</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-slate-700 border-slate-600 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="bg-slate-700 border-slate-600 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white">
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Price (R)</label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" className="bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Estimated Time</label>
                  <Input value={form.estimatedTime} onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Icon</label>
                  <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Service Image</label>
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !!form.image}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                {form.image && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-600">
                    <img src={getProductImageUrl(form.image)} alt="Service" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Features (one per line)</label>
                <textarea
                  value={form.features.join('\n')}
                  onChange={(e) => setForm({ ...form, features: e.target.value.split('\n').filter(Boolean) })}
                  rows={4}
                  className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  placeholder="Screen replacement\nBattery replacement\nSoftware troubleshooting"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-700 border-slate-600 text-white" />
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Service</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Price</TableHead>
              <TableHead className="text-white">Est. Time</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-red-400">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  No services found
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow key={service._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={getProductImageUrl(service.image)}
                        alt={service.name}
                        onError={(e) => { e.target.src = PRODUCT_PLACEHOLDER_IMAGE; }}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-white">{service.name}</p>
                        <p className="text-sm text-slate-400">ID: {String(service._id).slice(-6)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{service.category}</TableCell>
                  <TableCell className="font-semibold text-green-400">R{Number(service.price).toLocaleString()}</TableCell>
                  <TableCell className="text-white">{service.estimatedTime}</TableCell>
                  <TableCell>
                    <Badge className={service.status === 'Active' ? 'bg-green-600' : 'bg-slate-600'}>{service.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => openEdit(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:bg-slate-700" onClick={() => handleDelete(service._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default ServicesManagement;
