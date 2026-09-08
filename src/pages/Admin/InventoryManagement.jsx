import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { KPICard, SectionCard } from '../../components/ui/dashboard-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Search, AlertTriangle, Package, Loader2, TrendingUp, Edit3, Save, X, Plus, Minus } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import { toast } from 'sonner';
import { getStatusConfig } from '../../lib/admin-utils';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../constants';
import { StockAlertWidget } from '../../components/admin/StockAlertWidget';

const threshold = 10;

export function InventoryManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');

  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    if (search) setSearchQuery(search);
    if (category) setCategoryFilter(category);
    if (status) setStatusFilter(status);
  }, []);

  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter !== 'all') params.category = categoryFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    setSearchParams(params, { replace: true });
  }, [searchQuery, categoryFilter, statusFilter, setSearchParams]);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await productsAPI.getAll({ limit: 100 });
        if (isMounted) setProducts(res.data || []);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load inventory');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadProducts();
    return () => { isMounted = false; };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...cats];
  }, [products]);

  const lowStockItems = useMemo(() => products.filter((p) => Number(p.stock) <= threshold && Number(p.stock) > 0), [products]);
  const inStockItems = useMemo(() => products.filter((p) => Number(p.stock) > threshold), [products]);
  const outOfStockItems = useMemo(() => products.filter((p) => Number(p.stock) === 0), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'in-stock' && Number(p.stock) > threshold) || (statusFilter === 'low-stock' && Number(p.stock) <= threshold && Number(p.stock) > 0) || (statusFilter === 'out-of-stock' && Number(p.stock) === 0);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditStock(String(product.stock));
  };

  const saveStock = async (product) => {
    const newStock = Number(editStock);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Invalid stock quantity');
      return;
    }
    try {
      await productsAPI.update(product._id, { stock: newStock });
      toast.success('Stock updated');
      setEditingId(null);
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, stock: newStock } : p));
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-red-400">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 py-4">
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        <p className="text-slate-300">Monitor and manage product stock levels</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Products" value={products.length.toLocaleString()} icon={Package} color="text-blue-400" bgColor="bg-blue-600/20" />
        <KPICard title="In Stock" value={inStockItems.length.toLocaleString()} icon={TrendingUp} color="text-green-400" bgColor="bg-green-600/20" />
        <KPICard title="Low Stock" value={lowStockItems.length.toLocaleString()} icon={AlertTriangle} color="text-yellow-400" bgColor="bg-yellow-600/20" />
        <KPICard title="Out of Stock" value={outOfStockItems.length.toLocaleString()} icon={Package} color="text-red-400" bgColor="bg-red-600/20" />
      </div>

      <SectionCard title="Stock Alerts" description="Severity-tiered alerts requiring attention">
        <StockAlertWidget products={products} threshold={threshold} />
      </SectionCard>

      <Card className="p-4 mb-6 bg-slate-800/80 border-slate-700 mt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search inventory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-700 border-slate-600 text-white" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-white capitalize">{cat === 'all' ? 'All Categories' : cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all" className="text-white">All Status</SelectItem>
                <SelectItem value="in-stock" className="text-white">In Stock</SelectItem>
                <SelectItem value="low-stock" className="text-white">Low Stock</SelectItem>
                <SelectItem value="out-of-stock" className="text-white">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800/80 border-slate-700 overflow-hidden table-responsive">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Product</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Stock Level</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">No products found</TableCell></TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product._id || product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || PRODUCT_PLACEHOLDER_IMAGE}
                        alt={product.name}
                        onError={(e) => { e.target.src = PRODUCT_PLACEHOLDER_IMAGE; }}
                        className="h-10 w-10 rounded-lg object-cover bg-slate-700"
                      />
                      <p className="font-semibold text-white">{product.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{product.category}</TableCell>
                  <TableCell>
                    {editingId === product._id ? (
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="h-7 w-7 border-slate-600 text-white hover:bg-slate-700" onClick={() => setEditStock(String(Math.max(0, Number(editStock) - 1)))}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="w-16 h-7 text-center bg-slate-700 border-slate-600 text-white text-sm" />
                        <Button size="icon" variant="outline" className="h-7 w-7 border-slate-600 text-white hover:bg-slate-700" onClick={() => setEditStock(String(Number(editStock) + 1))}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-700" onClick={() => saveStock(product)}>
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => setEditingId(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white min-w-[3rem]">{product.stock} units</span>
                        <div className="w-20 bg-slate-600 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${Math.min((Number(product.stock) / 100) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {Number(product.stock) === 0 ? <Badge className={getStatusConfig('Out of Stock', 'inventory').color}>Out of Stock</Badge> : Number(product.stock) < threshold ? <Badge className={getStatusConfig('Low Stock', 'inventory').color}>Low Stock</Badge> : <Badge className={getStatusConfig('In Stock', 'inventory').color}>In Stock</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700" onClick={() => startEdit(product)}>
                        <Edit3 className="h-4 w-4" />
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

export default InventoryManagement;
