import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Smartphone, Headphones, Battery, Cable, HardDrive, Monitor, Star, ShoppingCart } from 'lucide-react';
import { Button } from "../components/button.jsx";

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');

  const categories = [
    { id: 'all', name: 'All Products', icon: ShoppingCart },
    { id: 'accessories', name: 'Accessories', icon: Headphones },
    { id: 'batteries', name: 'Batteries', icon: Battery },
    { id: 'cables', name: 'Cables', icon: Cable },
    { id: 'storage', name: 'Storage', icon: HardDrive },
    { id: 'screens', name: 'Screens', icon: Monitor }
  ];

  const products = [
    {
      id: 1,
      name: 'Wireless Earbuds Pro',
      category: 'accessories',
      condition: 'new',
      price: 899,
      originalPrice: 1299,
      rating: 4.5,
      reviews: 128,
      image: '/api/placeholder/300/300',
      description: 'Premium wireless earbuds with noise cancellation'
    },
    {
      id: 2,
      name: 'Phone Battery 4000mAh',
      category: 'batteries',
      condition: 'new',
      price: 299,
      originalPrice: 399,
      rating: 4.2,
      reviews: 89,
      image: '/api/placeholder/300/300',
      description: 'High-capacity replacement battery for smartphones'
    },
    {
      id: 3,
      name: 'USB-C Charging Cable',
      category: 'cables',
      condition: 'new',
      price: 149,
      originalPrice: 199,
      rating: 4.8,
      reviews: 256,
      image: '/api/placeholder/300/300',
      description: 'Fast charging USB-C cable, 2m length'
    },
    {
      id: 4,
      name: '256GB MicroSD Card',
      category: 'storage',
      condition: 'new',
      price: 599,
      originalPrice: 799,
      rating: 4.6,
      reviews: 167,
      image: '/api/placeholder/300/300',
      description: 'Class 10 microSD card for expanded storage'
    },
    {
      id: 5,
      name: 'iPhone Screen Protector',
      category: 'accessories',
      condition: 'new',
      price: 199,
      originalPrice: 299,
      rating: 4.4,
      reviews: 203,
      image: '/api/placeholder/300/300',
      description: 'Tempered glass screen protector with privacy'
    },
    {
      id: 6,
      name: 'Laptop Battery 6-Cell',
      category: 'batteries',
      condition: 'pre-owned',
      price: 899,
      originalPrice: 1199,
      rating: 4.3,
      reviews: 78,
      image: '/api/placeholder/300/300',
      description: 'Replacement battery for various laptop models'
    },
    {
      id: 7,
      name: 'HDMI Cable 4K',
      category: 'cables',
      condition: 'new',
      price: 249,
      originalPrice: 349,
      rating: 4.7,
      reviews: 145,
      image: '/api/placeholder/300/300',
      description: 'High-speed HDMI cable for 4K displays'
    },
    {
      id: 8,
      name: '2TB External Hard Drive',
      category: 'storage',
      condition: 'pre-owned',
      price: 1899,
      originalPrice: 2299,
      rating: 4.5,
      reviews: 92,
      image: '/api/placeholder/300/300',
      description: 'Portable external hard drive with USB 3.0'
    },
    {
      id: 9,
      name: 'Phone Stand & Holder',
      category: 'accessories',
      condition: 'new',
      price: 99,
      originalPrice: 149,
      rating: 4.1,
      reviews: 134,
      image: '/api/placeholder/300/300',
      description: 'Adjustable phone stand for desk and car use'
    }
  ];

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
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <div className="text-6xl text-muted-foreground">
                      {/* Placeholder for product image */}
                      <Smartphone className="h-24 w-24" />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{product.description}</p>

                    <div className="flex items-center mb-3">
                      <div className="flex items-center mr-2">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          R{product.price}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            R{product.originalPrice}
                          </span>
                        )}
                      </div>
                      {product.originalPrice > product.price && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    <Button size="lg" className="w-full flex items-center justify-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
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
};

export default Shop;