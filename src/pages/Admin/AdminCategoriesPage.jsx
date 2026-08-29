/**
 * AdminCategoriesPage
 *
 * Purpose:
 *   CRUD interface for managing product categories. Similar in structure to
 *   AdminBrandsPage but without a logo field. Categories are searchable by
 *   name or slug and displayed in a table with create/edit/delete actions.
 *
 * Key Variables:
 *   - categories: list of all categories fetched from the API
 *   - editingCategory: tracks which category is being edited (null = create mode)
 *   - form: current form state bound to the dialog inputs
 *   - filteredCategories: derived list filtered by searchQuery
 *
 * Admin-specific Features:
 *   - Create/Edit dialog with name, slug, and status fields
 *   - Client-side search filtering
 *   - Delete confirmation via window.confirm
 *   - Global admin-data-changed event to refresh related components
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
import { categoriesAPI } from '../../services/api';
import { toast } from 'sonner';

const emptyCategory = { name: '', slug: '', status: 'Active' };

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(emptyCategory);
  const [submitError, setSubmitError] = useState('');

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await categoriesAPI.getAll({ limit: 100 });
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreate = () => {
    setEditingCategory(null);
    setForm(emptyCategory);
    setSubmitError('');
    setDialogOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      status: category.status || 'Active',
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesAPI.delete(id);
      toast.success('Category deleted');
      loadCategories();
      window.dispatchEvent(new CustomEvent('admin-data-changed', { detail: { type: 'categories' } }));
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, form);
        toast.success('Category updated');
      } else {
        await categoriesAPI.create(form);
        toast.success('Category created');
      }
      setDialogOpen(false);
      loadCategories();
      window.dispatchEvent(new CustomEvent('admin-data-changed', { detail: { type: 'categories' } }));
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
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-slate-400">Manage product categories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
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
                  {editingCategory ? 'Update' : 'Create'}
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
            placeholder="Search categories..."
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
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Slug</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Created</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-red-400">{error}</TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell className="text-white font-medium">{category.name}</TableCell>
                  <TableCell className="text-slate-300">{category.slug || '-'}</TableCell>
                  <TableCell>
                    <Badge className={category.status === 'Active' ? 'bg-green-600' : 'bg-slate-600'}>
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-slate-700"
                        onClick={() => openEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:bg-slate-700"
                        onClick={() => handleDelete(category._id)}
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

export default AdminCategoriesPage;
