/**
 * AdminBrandsPage
 *
 * Purpose:
 *   Provides CRUD (Create, Read, Update, Delete) operations for product brands
 *   in the TR-Tech admin portal. Displays brands in a searchable data table and
 *   opens a dialog form for creating or editing a brand.
 *
 * Structure:
 *   - State management for brands list, search query, loading/error states,
 *     dialog visibility, editing context, and form data.
 *   - `loadBrands` fetches all brands via the brands API.
 *   - `openCreate` / `openEdit` prepare the dialog and form state.
 *   - `handleDelete` removes a brand with confirmation and dispatches a global
 *     event so other components can refresh their brand/category lists.
 *   - `handleSubmit` creates or updates a brand depending on `editingBrand`,
 *     and parses API validation errors into user-friendly messages.
 *   - Filtered brands are derived from the search query against name and slug.
 *   - The table renders brand logo images, status badges, and action buttons.
 */
import { useState, useEffect, useCallback } from 'react';
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
  DialogTrigger,
} from '../../components/ui/dialog';
import { Plus, Search, Edit, Trash2, Loader2, X } from 'lucide-react';
import { brandsAPI } from '../../services/api';
import { toast } from 'sonner';

const emptyBrand = { name: '', slug: '', status: 'Active', logo: '' };

export function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [form, setForm] = useState(emptyBrand);
  const [submitError, setSubmitError] = useState('');

  const loadBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await brandsAPI.getAll({ limit: 100 });
      setBrands(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      slug: brand.slug || '',
      status: brand.status || 'Active',
      logo: brand.logo || '',
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    try {
      await brandsAPI.delete(id);
      toast.success('Brand deleted');
      loadBrands();
      window.dispatchEvent(new CustomEvent('admin-data-changed', { detail: { type: 'brands' } }));
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      if (editingBrand) {
        await brandsAPI.update(editingBrand._id, form);
        toast.success('Brand updated');
      } else {
        await brandsAPI.create(form);
        toast.success('Brand created');
      }
      setDialogOpen(false);
      loadBrands();
      window.dispatchEvent(new CustomEvent('admin-data-changed', { detail: { type: 'brands' } }));
    } catch (err) {
      let errorMessage = err.message || 'Save failed';
      if (err.info) {
        try {
          const detail = typeof err.info === 'string' ? JSON.parse(err.info) : err.info;
          if (detail?.errors) {
            errorMessage = detail.errors.map((e) => e.msg || e.message).join(', ');
          } else if (detail?.message) {
            errorMessage = detail.message;
          } else if (typeof detail === 'string') {
            errorMessage = detail;
          }
        } catch {
          errorMessage = err.info;
        }
      }
      setSubmitError(errorMessage);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brands</h1>
          <p className="text-slate-400">Manage product brands</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  maxLength={100}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  maxLength={100}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Auto-generated from name if left blank"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Logo URL (optional)</label>
                <Input
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  maxLength={500}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., /uploads/logo.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingBrand ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </Card>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Brand</TableHead>
              <TableHead className="text-white">Slug</TableHead>
              <TableHead className="text-white">Logo</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Created</TableHead>
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
                <TableCell colSpan={6} className="text-center py-8 text-red-400">{error}</TableCell>
              </TableRow>
            ) : filteredBrands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  No brands found
                </TableCell>
              </TableRow>
            ) : (
              filteredBrands.map((brand) => (
                <TableRow key={brand._id}>
                  <TableCell className="text-white font-medium">{brand.name}</TableCell>
                  <TableCell className="text-slate-300">{brand.slug || '-'}</TableCell>
                  <TableCell className="text-slate-300">
                    {brand.logo ? (
                      <img
                        src={brand.logo.startsWith('http') ? brand.logo : `/uploads/${brand.logo}`}
                        alt={brand.name}
                        className="h-6 w-6 rounded object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={brand.status === 'Active' ? 'bg-green-600' : 'bg-slate-600'}>
                      {brand.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-slate-700"
                        onClick={() => openEdit(brand)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:bg-slate-700"
                        onClick={() => handleDelete(brand._id)}
                      >
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

export default AdminBrandsPage;
