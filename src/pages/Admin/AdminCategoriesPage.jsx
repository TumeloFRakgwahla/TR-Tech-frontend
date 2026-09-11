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
import { categoriesAPI } from '../../services/api';
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

const emptyCategory = {
  name: '',
  slug: '',
  icon: 'MoreHorizontal',
  displayOrder: 0,
};

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(emptyCategory);
  const [submitError, setSubmitError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

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
      icon: category.icon || 'MoreHorizontal',
      displayOrder: category.displayOrder ?? 0,
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await categoriesAPI.delete(id);
      toast.success('Category deleted');
      loadCategories();
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
    const payload = {
      ...form,
      displayOrder: Number(form.displayOrder),
    };

    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, payload);
        toast.success('Category updated');
      } else {
        await categoriesAPI.create(payload);
        toast.success('Category created');
      }
      setDialogOpen(false);
      loadCategories();
    } catch (err) {
      setSubmitError(err.message || 'Save failed');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between mb-4 py-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-slate-300">Manage product categories</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden table-responsive">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Slug</TableHead>
              <TableHead className="text-white">Icon</TableHead>
              <TableHead className="text-white">Display Order</TableHead>
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
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category._id || category.id}>
                  <TableCell className="text-white font-medium">{category.name}</TableCell>
                  <TableCell className="text-slate-400">{category.slug}</TableCell>
                  <TableCell className="text-slate-400">{category.icon || 'N/A'}</TableCell>
                  <TableCell className="text-slate-400">{category.displayOrder ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => openEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:bg-slate-700" onClick={() => confirmDelete(category._id || category.id)}>
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
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
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
              <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Icon</label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Display Order</label>
                <Input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
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
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => handleDelete(deleteTargetId)}
        variant="destructive"
      />
    </div>
  );
}

export default AdminCategoriesPage;
