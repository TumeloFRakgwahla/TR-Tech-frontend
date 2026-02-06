import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Smartphone, Headphones, Battery, Cable, HardDrive, Monitor, Star, ShoppingCart } from 'lucide-react';
import { Button } from "../components/button.jsx";
import { CartProvider, useCart } from '../components/CartContext';
import { CartDrawer } from '../components/CartDrawer';
import { productsAPI } from '../services/api';

function ShopContent() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const { addToCart, totalItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', name: 'All Products', icon: ShoppingCart },
    { id: 'accessories', name: 'Accessories', icon: Headphones },
    { id: 'batteries', name: 'Batteries', icon: Battery },
    { id: 'cables', name: 'Cables', icon: Cable },
    { id: 'storage', name: 'Storage', icon: HardDrive },
    { id: 'screens', name: 'Screens', icon: Monitor }
  ];

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

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const conditionMatch = selectedCondition === 'all' || product.condition === selectedCondition;
    return categoryMatch && conditionMatch;
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 md:pt-25">

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tech Shop
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Quality tech products and accessories for all your technology needs.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-muted border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  <span className="text-sm">{category.name}</span>
                </Button>
              ))}
              {['all', 'new', 'pre-owned'].map((condition) => (
                <Button
                  key={condition}
                  onClick={() => setSelectedCondition(condition)}
                  variant={selectedCondition === condition ? "default" : "outline"}
                  className="capitalize"
                >
                  <span className="text-sm">{condition === 'all' ? 'All' : condition === 'new' ? 'New' : 'Pre-Owned'}</span>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-center mb-4">
                {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-muted-foreground text-center">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading products...</p>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No products found</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product._id || product.id} className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = '<Smartphone className="h-24 w-24 text-muted-foreground" />';
                          }}
                        />
                      ) : (
                        <div className="text-6xl text-muted-foreground">
                          <Smartphone className="h-24 w-24" />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{product.description}</p>

                      <div className="flex items-center mb-3">
                        <div className="flex items-center mr-2">
                          {renderStars(product.rating || 0)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({product.reviews || 0})
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">
                            R{product.price?.toLocaleString() || 0}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              R{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>

                      <Button 
                        size="lg" 
                        className="w-full bg-white text-primary border-2 border-black hover:bg-primary hover:text-white hover:border-primary font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-bold text-2xl text-black mb-2">✓</h3>
              <h4 className="font-bold mb-2 text-[#0a1f3d]">Quality Assured</h4>
              <p className="text-sm text-gray-600">
                All products tested and verified
              </p>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-black mb-2">✓</h3>
              <h4 className="font-bold mb-2 text-[#0a1f3d]">Warranty Included</h4>
              <p className="text-sm text-gray-600">
                Every purchase comes with warranty
              </p>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-black mb-2">✓</h3>
              <h4 className="font-bold mb-2 text-[#0a1f3d]">Secure Checkout</h4>
              <p className="text-sm text-gray-600">
                Safe and convenient WhatsApp checkout
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}

const Shop = () => {
  return <ShopContent />;
};

export default Shop;
