import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '../../components/Sidebar';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/badge';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Plus, Pencil, Trash2, Search, Upload, X } from 'lucide-react';
import { productsAPI, uploadAPI } from '../../services/api';

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getImageUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  // Remove /api from base URL for image uploads
  return `${API_BASE_URL.replace('/api', '')}${url}`;
};

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['Accessories', 'Parts', 'Tools', 'Other'];
  const conditions = ['New', 'Used', 'Refurbished'];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        if (response.success) {
          setProducts(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ((product.description || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesCondition = filterCondition === 'all' || product.condition === filterCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const handleDeleteProduct = async (product) => {
    try {
      await productsAPI.delete(product._id || product.id);
      setProducts(products.filter((p) => (p._id || p.id) !== (product._id || product.id)));
      setDeleteProduct(null);
      alert('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const handleAddProduct = async (product) => {
    try {
      const response = await productsAPI.create(product);
      if (response.success) {
        setProducts([...products, response.data]);
        setIsAddDialogOpen(false);
        alert('Product added successfully');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product');
    }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const productId = editingProduct._id || editingProduct.id;
      const response = await productsAPI.update(productId, updatedProduct);
      if (response.success) {
        setProducts(
          products.map((p) =>
            (p._id || p.id) === productId ? response.data : p
          )
        );
        setEditingProduct(null);
        alert('Product updated successfully');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product');
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-900">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 h-full z-40">
          <Sidebar className="!bg-slate-950">
            <SidebarHeader>
              <div className="flex items-center space-x-2 px-4 py-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TR</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">TR Tech Admin</h2>
                  <p className="text-sm text-slate-400">Management Portal</p>
                </div>
              </div>
            </SidebarHeader>
            <div className="border-b border-slate-600 mx-4"></div>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate('/admin')}>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                    Dashboard
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={true}>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Products
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate('/admin/repairs')}>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Repairs
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate('/admin/orders')}>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Orders
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <button
                onClick={() => window.location.href = '/admin/login'}
                className="w-full flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </SidebarFooter>
          </Sidebar>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <header className="fixed bg-slate-950 top-0 left-64 right-0 z-30">
            <div className="flex justify-between items-center px-6 py-4">
              <div className="flex items-center">
                <SidebarTrigger />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-white">Products</h1>
                  <p className="text-sm text-slate-400">Manage your tech inventory</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-slate-400">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">A</span>
                </div>
              </div>
            </div>
          </header>

          <main className="pt-20 bg-slate-900 min-h-screen p-6 overflow-auto">
            <div className="space-y-6 p-6">
              {/* Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div></div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Product</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Add a new product to your inventory
                      </DialogDescription>
                    </DialogHeader>
                    <ProductForm
                      onSubmit={handleAddProduct}
                      onCancel={() => setIsAddDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters */}
              <div className="bg-slate-800 rounded-lg p-4 space-y-4 border border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterCondition} onValueChange={setFilterCondition}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="All Conditions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conditions</SelectItem>
                      {conditions.map((cond) => (
                        <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                {loading ? (
                  <div className="text-center py-12 text-slate-400">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4">Loading products...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-400">
                    <p>{error}</p>
                    <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-slate-700/50 bg-slate-900">
                        <TableHead className="text-slate-300">Product</TableHead>
                        <TableHead className="text-slate-300">Category</TableHead>
                        <TableHead className="text-slate-300">Condition</TableHead>
                        <TableHead className="text-slate-300">Price</TableHead>
                        <TableHead className="text-slate-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product._id || product.id} className="border-slate-700 hover:bg-slate-700/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image || 'https://placehold.co/100x100/3b82f6/white?text=Product'}
                                alt={product.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div>
                                <p className="font-medium text-white">{product.name}</p>
                                <p className="text-sm text-slate-400 line-clamp-1">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">{product.category}</TableCell>
                          <TableCell>
                            <Badge
                              variant={product.condition === 'New' ? 'default' : 'secondary'}
                              className={
                                product.condition === 'New'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-blue-600 text-white'
                              }
                            >
                              {product.condition}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            R {product.price?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingProduct(product)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteProduct(product)}
                                className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {filteredProducts.length === 0 && !loading && !error && (
                  <div className="text-center py-12 text-slate-400">
                    No products found
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Edit Dialog */}
        {editingProduct && (
          <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Product</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Update product information
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                product={editingProduct}
                onSubmit={handleUpdateProduct}
                onCancel={() => setEditingProduct(null)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation */}
        {deleteProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">Are you sure?</h3>
              <p className="text-slate-400 mb-4">
                This will permanently delete "{deleteProduct.name}". This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteProduct(null)}
                  className="bg-slate-600 hover:bg-slate-700 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteProduct(deleteProduct)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}

function ProductForm({ product, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    category: product?.category || 'Accessories',
    condition: product?.condition || 'New',
    description: product?.description || '',
    image: product?.image || '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || '');
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload to server
  const uploadImage = async () => {
    if (!selectedFile) return formData.image;
    
    setIsUploading(true);
    try {
      const response = await uploadAPI.uploadImage(selectedFile);
      if (response.success) {
        return getImageUrl(response.url);
      } else {
        alert('Failed to upload image');
        return formData.image;
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image');
      return formData.image;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Upload image if selected
    const imageUrl = await uploadImage();
    
    onSubmit({
      ...formData,
      image: imageUrl,
    });
  };

  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
    setImagePreview(product?.image || '');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label className="text-white">Product Image</Label>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="relative border-2 border-dashed border-slate-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-400">
                  {selectedFile ? selectedFile.name : 'Click or drag to upload image'}
                </p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
            {isUploading && (
              <p className="text-sm text-blue-400 mt-2">Uploading image...</p>
            )}
          </div>
          {imagePreview && (
            <div className="relative w-24 h-24">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-slate-900 border-slate-700 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price" className="text-white">Price (R) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="bg-slate-900 border-slate-700 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category" className="text-white">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger id="category" className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Phones">Phones</SelectItem>
              <SelectItem value="Laptops">Laptops</SelectItem>
              <SelectItem value="Tablets">Tablets</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
              <SelectItem value="Parts">Parts</SelectItem>
              <SelectItem value="Tools">Tools</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition" className="text-white">Condition *</Label>
          <Select
            value={formData.condition}
            onValueChange={(value) => setFormData({ ...formData, condition: value })}
          >
            <SelectTrigger id="condition" className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Pre-Owned">Pre-Owned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="bg-slate-600 hover:bg-slate-700 text-white">
          Close
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isUploading}>
          {product ? 'Update' : 'Add'} Product
        </Button>
      </div>
    </form>
  );
}

export default AdminProductsPage;
