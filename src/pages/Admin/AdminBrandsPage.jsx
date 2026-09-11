import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { SectionCard } from '../../components/ui/dashboard-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { brandsAPI } from '../../services/api';
import { toast } from 'sonner';
import { ConfirmationDialog } from '../../components/admin/ConfirmationDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Breadcrumbs } from '../../components/admin/Breadcrumbs';

const emptyBrand = {
  name: '',
  logo: '',
};

export function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [form, setForm] = useState(emptyBrand);
  const [submitError, setSubmitError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const loadBrands = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await brandsAPI.getAll();
      setBrands(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openCreate = () => {
    setEditingBrand(null);
    setForm(emptyBrand);
    setSubmitError('');
    setDialogOpen(true);
  };

  const openEdit = (brand) => {
    setEditingBrand(brand);
    setForm({
      name: brand.name || '',
      logo: brand.logo || '',
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await brandsAPI.delete(id);
      toast.success('Brand deleted');
      loadBrands();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const confirmDelete = (id) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const payload = { ...form };

    try {
      if (editingBrand) {
        await brandsAPI.update(editingBrand._id, payload);
        toast.success('Brand updated');
      } else {
        await brandsAPI.create(payload);
        toast.success('Brand created');
      }
      setDialogOpen(false);
      loadBrands();
    } catch (err) {
      setSubmitError(err.message || 'Save failed');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between mb-4 py-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Brands</h1>
          <p className="text-slate-300">Manage product brands</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden table-responsive">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Logo</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-400">
                  No brands found
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand._id || brand.id}>
                  <TableCell className="text-white font-medium">{brand.name}</TableCell>
                  <TableCell className="text-slate-400">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="h-8 w-8 rounded object-cover" />
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => openEdit(brand)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:bg-slate-700" onClick={() => confirmDelete(brand._id || brand.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Logo URL</label>
              <Input
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="https://..."
              />
            </div>
            {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Brand"
        description="Are you sure you want to delete this brand? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => handleDelete(deleteTargetId)}
        variant="destructive"
      />
    </div>
  );
}

export default AdminBrandsPage;
