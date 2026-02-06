import { useState, useEffect } from 'react';
import { Button } from '../button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { productsAPI } from '../../services/api';

export function CreateOrderForm({ onSubmit, onCancel }) {
  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Pending');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [items, setItems] = useState([
    { productId: '', productName: '', quantity: 1, price: 0, image: '' },
  ]);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll();
        if (response.success) {
          setProducts(response.data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      { productId: '', productName: '', quantity: 1, price: 0, image: '' },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'productId') {
      const product = products.find((p) => p._id.toString() === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].price = product.price;
        newItems[index].image = product.image || '';
      }
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty items and format for backend
    const validItems = items.filter((item) => item.productId);
    
    onSubmit({
      customer: {
        name: customerName,
        email: email,
        phone: phone,
        address: address,
      },
      status: status,
      paymentMethod: paymentMethod,
      paymentStatus: 'Paid', // Orders created from admin are considered paid
      items: validItems.map((item) => ({
        product: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: calculateTotal(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="bg-slate-900 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-white">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-white">Name</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
          <div>
            <Label className="text-white">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Customer Email"
              type="email"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-white">Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Customer Phone"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="space-y-2">
        <Label className="text-white">Address</Label>
        <Textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter shipping address"
          rows={3}
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>

      {/* Order Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Order Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="border-slate-600 text-white hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="bg-slate-900 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Item {index + 1}</span>
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-4">
                <Label className="text-white">Product</Label>
                <Select
                  value={item.productId}
                  onValueChange={(value) => updateItem(index, 'productId', value)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name} - R{product.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Price</Label>
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Subtotal</Label>
                <div className="h-10 px-3 flex items-center bg-slate-800 border border-slate-700 rounded-md text-white">
                  R {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Total */}
      <div className="bg-slate-900 rounded-lg p-4">
        <div className="flex justify-between text-lg font-bold text-white">
          <span>Order Total</span>
          <span>R {calculateTotal().toLocaleString()}</span>
        </div>
      </div>

      {/* Status & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-white">Order Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status" className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMethod" className="text-white">Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger id="paymentMethod" className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Card">Card</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentStatus" className="text-white">Payment Status</Label>
          <Select 
            value={items.length > 0 && items[0].productId ? 'Paid' : 'Pending'} 
            onValueChange={() => {}}
          >
            <SelectTrigger id="paymentStatus" className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-slate-600 text-white hover:bg-slate-700">
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Create Order
        </Button>
      </div>
    </form>
  );
}
