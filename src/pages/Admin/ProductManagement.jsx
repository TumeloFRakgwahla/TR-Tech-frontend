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
import { productsAPI, uploadAPI, categoriesAPI, brandsAPI } from '../../services/api';
import { getProductImageUrl } from '../../lib/imageUrl';
import { PRODUCT_PLACEHOLDER_IMAGE, PRODUCT_CONDITIONS, PRODUCT_CATEGORIES, PRODUCT_BRANDS } from '../../constants';
import { toast } from 'sonner';

const emptyProduct = {
  name: '',
  description: '',
  category: 'Smartphones',
  brand: 'Other',
  price: '',
  condition: 'New',
  stock: '',
  status: 'Active',
  images: [],
};

export function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [submitError, setSubmitError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const fileInputRef = useRef(null);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productsAPI.getAll({ limit: 100 });
      setProducts(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoriesAndBrands = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        categoriesAPI.getActive().catch(() => ({ data: PRODUCT_CATEGORIES })),
        brandsAPI.getActive().catch(() => ({ data: PRODUCT_BRANDS })),
      ]);
      const catNames = (catRes.data || []).map(c => c.name);
      const brandNames = (brandRes.data || []).map(b => b.name);
      setCategories([...new Set([...PRODUCT_CATEGORIES, ...catNames])]);
      setBrands([...new Set([...PRODUCT_BRANDS, ...brandNames])]);
    } catch {
      setCategories(PRODUCT_CATEGORIES);
      setBrands(PRODUCT_BRANDS);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategoriesAndBrands();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setSubmitError('');
    setDialogOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'Accessories',
      brand: product.brand || 'Other',
      price: product.price ?? '',
      condition: product.condition || 'New',
      stock: product.stock ?? '',
      status: product.status || 'Active',
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - form.images.length;
    if (remaining <= 0) {
      toast.error('Maximum of 5 images allowed');
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
        toast.error('Each image must be smaller than 5MB');
        return;
      }
    }

    setUploading(true);
    try {
       const res = await uploadAPI.uploadImages(toUpload);
       if (res.success && res.data) {
         setForm(prev => ({
           ...prev,
           images: [...prev.images, ...res.data.map(img => img.url)]
         }));
         toast.success(`${res.data.length} image(s) uploaded`);
       }
     } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images,
       image: form.images[0] || form.image || PRODUCT_PLACEHOLDER_IMAGE
     };

    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct._id, payload);
        toast.success('Product updated');
      } else {
        await productsAPI.create(payload);
        toast.success('Product created');
      }
      setDialogOpen(false);
      loadProducts();
    } catch (err) {
      let errorMessage = err.message || 'Save failed';
      if (err.status === 400) {
        try {
          const detail = typeof err.info === 'string' ? JSON.parse(err.info) : err.info;
          if (Array.isArray(detail)) {
            errorMessage = detail.map((e) => e.msg || e.message).join(', ');
          } else if (detail?.errors) {
            errorMessage = detail.errors.map((e) => e.msg || e.message).join(', ');
          } else if (detail?.message) {
            errorMessage = detail.message;
          }
        } catch {
          if (err.info) errorMessage = err.info;
        }
      }
      setSubmitError(errorMessage);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 py-4">
        <div>
          <p className="text-slate-400">Manage your product catalog and inventory</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
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
               <div className="grid grid-cols-3 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                   <select
                     value={showNewCat ? '__new__' : form.category}
                     onChange={(e) => {
                       if (e.target.value === '__new__') {
                         setShowNewCat(true);
                       } else {
                         setForm({ ...form, category: e.target.value });
                       }
                     }}
                     className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                   >
                     {categories.map((cat) => (
                       <option key={cat} value={cat}>{cat}</option>
                     ))}
                     <option value="__new__">+ Add new category</option>
                   </select>
                   {showNewCat && (
                     <div className="mt-2 flex gap-2">
                       <Input
                         value={newCatName}
                         onChange={(e) => setNewCatName(e.target.value)}
                         placeholder="New category name"
                         className="bg-slate-700 border-slate-600 text-white"
                       />
                       <Button
                         type="button"
                         size="sm"
                         className="bg-blue-600 hover:bg-blue-700"
                         onClick={async () => {
                           if (!newCatName.trim()) return;
                           try {
                             await categoriesAPI.create({ name: newCatName.trim() });
                             toast.success('Category created');
                             setForm({ ...form, category: newCatName.trim() });
                             setShowNewCat(false);
                             setNewCatName('');
                             loadCategoriesAndBrands();
                           } catch (err) {
                             toast.error(err.message || 'Failed to create category');
                           }
                         }}
                       >
                         Add
                       </Button>
                       <Button
                         type="button"
                         size="sm"
                         variant="outline"
                         onClick={() => { setShowNewCat(false); setNewCatName(''); }}
                         className="border-slate-600 text-white hover:bg-slate-700"
                       >
                         Cancel
                       </Button>
                     </div>
                   )}
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-1">Brand</label>
                   <select
                     value={showNewBrand ? '__new__' : form.brand}
                     onChange={(e) => {
                       if (e.target.value === '__new__') {
                         setShowNewBrand(true);
                       } else {
                         setForm({ ...form, brand: e.target.value });
                       }
                     }}
                     className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                   >
                     {brands.map((brand) => (
                       <option key={brand} value={brand}>{brand}</option>
                     ))}
                     <option value="__new__">+ Add new brand</option>
                   </select>
                   {showNewBrand && (
                     <div className="mt-2 flex gap-2">
                       <Input
                         value={newBrandName}
                         onChange={(e) => setNewBrandName(e.target.value)}
                         placeholder="New brand name"
                         className="bg-slate-700 border-slate-600 text-white"
                       />
                       <Button
                         type="button"
                         size="sm"
                         className="bg-blue-600 hover:bg-blue-700"
                         onClick={async () => {
                           if (!newBrandName.trim()) return;
                           try {
                             await brandsAPI.create({ name: newBrandName.trim() });
                             toast.success('Brand created');
                             setForm({ ...form, brand: newBrandName.trim() });
                             setShowNewBrand(false);
                             setNewBrandName('');
                             loadCategoriesAndBrands();
                           } catch (err) {
                             toast.error(err.message || 'Failed to create brand');
                           }
                         }}
                       >
                         Add
                       </Button>
                       <Button
                         type="button"
                         size="sm"
                         variant="outline"
                         onClick={() => { setShowNewBrand(false); setNewBrandName(''); }}
                         className="border-slate-600 text-white hover:bg-slate-700"
                       >
                         Cancel
                       </Button>
                     </div>
                   )}
                 </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Condition</label>
                  <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white">
                    {PRODUCT_CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Price (R)</label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Stock</label>
                  <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required min="0" className="bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Product Images (max 5)</label>
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || form.images.length >= 5}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="text-xs text-slate-400">{form.images.length}/5 images</span>
                </div>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-600">
                        <img src={getProductImageUrl(img)} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-700 border-slate-600 text-white" />
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Product</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Brand</TableHead>
              <TableHead className="text-white">Condition</TableHead>
              <TableHead className="text-white">Price</TableHead>
              <TableHead className="text-white">Stock</TableHead>
              <TableHead className="text-white">Status</TableHead>
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
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-red-400">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={getProductImageUrl(product.images?.[0] || product.image)}
                        alt={product.name}
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100/3b82f6/white?text=TR'; }}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-white">{product.name}</p>
                        <p className="text-sm text-slate-400">ID: {String(product._id).slice(-6)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{product.category}</TableCell>
                  <TableCell className="text-white">{product.brand}</TableCell>
                  <TableCell className="text-white">{product.condition}</TableCell>
                  <TableCell className="font-semibold text-green-400">R{Number(product.price).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={Number(product.stock) > 0 ? 'text-green-400' : 'text-red-400'}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={product.status === 'Active' ? 'bg-green-600' : product.status === 'Out of Stock' ? 'bg-red-600' : 'bg-slate-600'}>{product.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => openEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:bg-slate-700" onClick={() => handleDelete(product._id)}>
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

export default ProductManagement;
