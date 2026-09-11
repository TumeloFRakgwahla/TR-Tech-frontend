import { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus, Edit, Trash2, Loader2, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsAPI, uploadAPI, categoriesAPI, brandsAPI } from '../../services/api';
import { getProductImageUrl } from '../../lib/imageUrl';
import { PRODUCT_PLACEHOLDER_IMAGE, PRODUCT_CONDITIONS } from '../../constants';
import { toast } from 'sonner';
import { getStatusConfig } from '../../lib/admin-utils';
import { formatPriceWithDecimals } from '../../lib/format';
import { FilterBar } from '../../components/admin/FilterBar';
import { ConfirmationDialog } from '../../components/admin/ConfirmationDialog';
import { AdminEmptyState, AdminErrorState } from '../../components/admin/AdminEmptyState';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminPageHeader } from '../../components/admin/Breadcrumbs';
import { useSearchParams } from 'react-router-dom';

const emptyProduct = {
  name: '',
  sku: '',
  description: '',
  category: 'Smartphones',
  brand: 'Other',
  price: '',
  condition: 'New',
  stock: '',
  status: 'Active',
  images: [],
};

const LOW_STOCK_THRESHOLD = 10;
const PAGE_SIZE = 20;

const generateSku = (name) => {
  const slug = (name || 'PROD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase()
    .slice(0, 24);
  const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${slug}-${stamp}-${rand}`;
};

export function ProductManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [brandFilter, setBrandFilter] = useState(searchParams.get('brand') || 'all');
  const [conditionFilter, setConditionFilter] = useState(searchParams.get('condition') || 'all');
  const [stockFilter, setStockFilter] = useState(searchParams.get('stock') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
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
        categoriesAPI.getActive().catch(() => ({ data: [] })),
        brandsAPI.getActive().catch(() => ({ data: [] })),
      ]);
      const catNames = (catRes.data || []).map(c => c.name);
      const brandNames = (brandRes.data || []).map(b => b.name);
      setCategories(catNames.length ? catNames : []);
      setBrands(brandNames.length ? brandNames : []);
    } catch {
      setCategories([]);
      setBrands([]);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategoriesAndBrands();
  }, []);

  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter !== 'all') params.category = categoryFilter;
    if (brandFilter !== 'all') params.brand = brandFilter;
    if (conditionFilter !== 'all') params.condition = conditionFilter;
    if (stockFilter !== 'all') params.stock = stockFilter;
    setSearchParams(params, { replace: true });
  }, [searchQuery, categoryFilter, brandFilter, conditionFilter, stockFilter, setSearchParams]);

  const handleFilterChange = (key, value) => {
    switch (key) {
      case 'text': setSearchQuery(value); break;
      case 'category': setCategoryFilter(value); break;
      case 'brand': setBrandFilter(value); break;
      case 'condition': setConditionFilter(value); break;
      case 'stock': setStockFilter(value); break;
      default: break;
    }
  };

  const filterValues = {
    text: searchQuery,
    category: categoryFilter,
    brand: brandFilter,
    condition: conditionFilter,
    stock: stockFilter,
  };

  const filters = [
    {
      key: 'category',
      label: 'Category',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'All Categories' },
        ...categories.map(cat => ({ value: cat, label: cat })),
      ],
    },
    {
      key: 'brand',
      label: 'Brand',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'All Brands' },
        ...brands.map(brand => ({ value: brand, label: brand })),
      ],
    },
    {
      key: 'condition',
      label: 'Condition',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'All Conditions' },
        ...PRODUCT_CONDITIONS.map(cond => ({ value: cond, label: cond })),
      ],
    },
    {
      key: 'stock',
      label: 'Stock Status',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'All Stock' },
        { value: 'in-stock', label: 'In Stock' },
        { value: 'low-stock', label: 'Low Stock' },
        { value: 'out-of-stock', label: 'Out of Stock' },
      ],
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(product.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesBrand = brandFilter === 'all' || product.brand === brandFilter;
    const matchesCondition = conditionFilter === 'all' || product.condition === conditionFilter;
    const matchesStock = stockFilter === 'all' || (stockFilter === 'in-stock' && Number(product.stock) > 10) || (stockFilter === 'low-stock' && Number(product.stock) <= 10 && Number(product.stock) > 0) || (stockFilter === 'out-of-stock' && Number(product.stock) === 0);
    return matchesSearch && matchesCategory && matchesBrand && matchesCondition && matchesStock;
  });

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

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
      sku: product.sku || '',
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
    if (payload.sku) {
      payload.sku = payload.sku.toUpperCase();
    } else {
      payload.sku = generateSku(form.name);
    }

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

  const getStockStatus = (stock) => {
    const count = Number(stock) || 0;
    if (count === 0) return { label: 'Out of Stock', config: getStatusConfig('Out of Stock', 'inventory') };
    if (count <= LOW_STOCK_THRESHOLD) return { label: 'Low Stock', config: getStatusConfig('Low Stock', 'inventory') };
    return { label: 'In Stock', config: getStatusConfig('In Stock', 'inventory') };
  };

  if (error) {
    return <AdminErrorState error={error} onRetry={loadProducts} />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage your product catalog and inventory"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="product-name" className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
                    <Input id="product-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                  <div>
                    <label htmlFor="product-sku" className="block text-sm font-medium text-slate-300 mb-1">SKU *</label>
                    <Input id="product-sku" value={form.sku || ''} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} required className="bg-slate-700 border-slate-600 text-white" placeholder="SKU-XXXXX" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="product-category" className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
                    <Select
                      value={showNewCat ? '__new__' : form.category}
                      onValueChange={(val) => {
                        if (val === '__new__') { setShowNewCat(true); } else { setForm({ ...form, category: val }); }
                      }}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                        <SelectItem value="__new__">+ Add new category</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <label htmlFor="product-brand" className="block text-sm font-medium text-slate-300 mb-1">Brand *</label>
                    <Select
                      value={showNewBrand ? '__new__' : form.brand}
                      onValueChange={(val) => {
                        if (val === '__new__') { setShowNewBrand(true); } else { setForm({ ...form, brand: val }); }
                      }}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                        <SelectItem value="__new__">+ Add new brand</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <label htmlFor="product-condition" className="block text-sm font-medium text-slate-300 mb-1">Condition *</label>
                    <Select
                      value={form.condition}
                      onValueChange={(val) => setForm({ ...form, condition: val })}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {PRODUCT_CONDITIONS.map((cond) => (
                          <SelectItem key={cond} value={cond}>
                            {cond}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="product-price" className="block text-sm font-medium text-slate-300 mb-1">Price (R) *</label>
                    <Input id="product-price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                  <div>
                    <label htmlFor="product-stock" className="block text-sm font-medium text-slate-300 mb-1">Stock *</label>
                    <Input id="product-stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required min="0" className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                </div>

                <div>
                  <label htmlFor="product-status" className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <Select
                    value={form.status}
                    onValueChange={(val) => setForm({ ...form, status: val })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="product-images" className="block text-sm font-medium text-slate-300 mb-1">Product Images (max 5)</label>
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
                      id="product-images"
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
        }
      />

      <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
        <FilterBar filters={filters} values={filterValues} onChange={handleFilterChange} />
      </Card>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden table-responsive">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Product</TableHead>
              <TableHead className="text-white">SKU</TableHead>
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
                <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="p-0">
                  <AdminEmptyState
                    iconType="product"
                    title="No products found"
                    description={filteredProducts.length === 0 && searchQuery ? 'Try adjusting your search or filters' : 'Add your first product to get started'}
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                           src={getProductImageUrl(product.images?.[0] || product.image, { width: 200, quality: 75 })}
                          alt={product.name}
                          onError={(e) => { e.target.src = PRODUCT_PLACEHOLDER_IMAGE; }}
                          className="h-12 w-12 rounded-lg object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        <div>
                          <p className="font-semibold text-white">{product.name}</p>
                          <p className="text-sm text-slate-400">ID: {String(product._id).slice(-6)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-mono">{product.sku}</TableCell>
                    <TableCell className="text-white">{product.category}</TableCell>
                    <TableCell className="text-white">{product.brand}</TableCell>
                    <TableCell className="text-white">{product.condition}</TableCell>
                    <TableCell className="font-semibold text-green-400">{formatPriceWithDecimals(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={stockStatus.config.textColor}>{product.stock} units</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.config.color.replace('text-', 'bg-')}`} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} type="product" size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={() => openEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmationDialog
                          trigger={<Button variant="ghost" size="icon" className="text-red-400 hover:bg-slate-700"><Trash2 className="h-4 w-4" /></Button>}
                          title="Delete Product?"
                          description={`This will permanently remove "${product.name}". This action cannot be undone.`}
                          confirmLabel="Delete"
                          onConfirm={() => handleDelete(product._id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-300">
          <p>Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredProducts.length)}-{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length}</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2">Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;