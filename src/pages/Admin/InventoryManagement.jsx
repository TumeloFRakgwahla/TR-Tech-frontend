import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Search, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import { products } from '../../data/mockData';
import { useState } from 'react';

export function InventoryManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock inventory data
  const inventory = products.map((p) => ({
    ...p,
    stock: Math.floor(Math.random() * 100) + 1,
    threshold: 20,
    supplier: ['Amazon', 'Best Buy', 'Direct', 'Wholesale'][
      Math.floor(Math.random() * 4)
    ],
  }));

  const lowStockItems = inventory.filter((item) => item.stock < item.threshold);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Inventory Management</h1>
        <p className="text-slate-400">
          Monitor and manage product stock levels
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm">Total Products</p>
          </div>
          <p className="text-3xl font-bold text-white">{products.length}</p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-green-600/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-slate-400 text-sm">In Stock</p>
          </div>
          <p className="text-3xl font-bold text-green-400">
            {inventory.filter((i) => i.stock > i.threshold).length}
          </p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-yellow-600/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-slate-400 text-sm">Low Stock</p>
          </div>
          <p className="text-3xl font-bold text-yellow-400">
            {lowStockItems.length}
          </p>
        </Card>
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-red-600/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-slate-400 text-sm">Out of Stock</p>
          </div>
          <p className="text-3xl font-bold text-red-400">
            {inventory.filter((i) => i.stock === 0).length}
          </p>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="p-6 mb-6 bg-yellow-600/10 border-yellow-600/20 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Low Stock Alerts</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {lowStockItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-slate-700 rounded-xl p-4 border border-yellow-600/20"
              >
                <p className="font-semibold mb-1 text-white">{item.name}</p>
                <p className="text-sm text-slate-400 mb-2">
                  Stock: {item.stock} / {item.threshold}
                </p>
                <Progress
                  value={(item.stock / item.threshold) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">Filter</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Update Stock</Button>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Product</TableHead>
              <TableHead className="text-white">SKU</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Stock Level</TableHead>
              <TableHead className="text-white">Supplier</TableHead>
              <TableHead className="text-white">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.slice(0, 10).map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <p className="font-semibold text-white">{item.name}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-slate-300">
                  SKU-{item.id.toString().padStart(5, '0')}
                </TableCell>
                <TableCell className="text-white">{item.category}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold mb-1 text-white">{item.stock} units</p>
                    <Progress
                      value={(item.stock / item.threshold) * 100}
                      className="h-2"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-white">{item.supplier}</TableCell>
                <TableCell>
                  {item.stock === 0 ? (
                    <Badge className="bg-red-600">Out of Stock</Badge>
                  ) : item.stock < item.threshold ? (
                    <Badge className="bg-yellow-600">Low Stock</Badge>
                  ) : (
                    <Badge className="bg-green-600">In Stock</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}