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
import { Search, AlertTriangle, Package, Loader2, TrendingUp } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { productsAPI } from '../../services/api';
import { toast } from 'sonner';

export function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const threshold = 10;

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

  const lowStockItems = useMemo(() => products.filter((p) => Number(p.stock) <= threshold && Number(p.stock) > 0), [products]);
  const inStockItems = useMemo(() => products.filter((p) => Number(p.stock) > threshold), [products]);
  const outOfStockItems = useMemo(() => products.filter((p) => Number(p.stock) === 0), [products]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Inventory Management</h1>
        <p className="text-slate-400">Monitor and manage product stock levels</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center"><Package className="h-5 w-5 text-blue-400" /></div>
            <p className="text-slate-400 text-sm">Total Products</p>
          </div>
          <p className="text-3xl font-bold text-white">{products.length}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-green-600/20 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-green-400" /></div>
            <p className="text-slate-400 text-sm">In Stock</p>
          </div>
          <p className="text-3xl font-bold text-green-400">{inStockItems.length}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-yellow-600/20 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-yellow-400" /></div>
            <p className="text-slate-400 text-sm">Low Stock</p>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{lowStockItems.length}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-red-600/20 flex items-center justify-center"><Package className="h-5 w-5 text-red-400" /></div>
            <p className="text-slate-400 text-sm">Out of Stock</p>
          </div>
          <p className="text-3xl font-bold text-red-400">{outOfStockItems.length}</p>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="p-6 mb-6 bg-yellow-600/10 border-yellow-600/20 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Low Stock Alerts</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {lowStockItems.slice(0, 3).map((item) => (
              <div key={item._id || item.id} className="bg-slate-700 rounded-xl p-4 border border-yellow-600/20">
                <p className="font-semibold mb-1 text-white">{item.name}</p>
                <p className="text-sm text-slate-400 mb-2">Stock: {item.stock} / {threshold}</p>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${Math.max((Number(item.stock) / threshold) * 100, 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search inventory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-700 border-slate-600 text-white" />
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Product</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Stock Level</TableHead>
              <TableHead className="text-white">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">No products found</TableCell></TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product._id || product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                      <p className="font-semibold text-white">{product.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{product.category}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold mb-1 text-white">{product.stock} units</p>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((Number(product.stock) / 100) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {Number(product.stock) === 0 ? <Badge className="bg-red-600">Out of Stock</Badge> : Number(product.stock) < threshold ? <Badge className="bg-yellow-600">Low Stock</Badge> : <Badge className="bg-green-600">In Stock</Badge>}
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
