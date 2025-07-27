import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, TrendingUp, ShoppingCart, Store } from 'lucide-react';
import Navbar from './common/Navbar';
import LoadingSpinner from './common/LoadingSpinner';
import CartModal from './common/CartModal';
import { dbQueries } from '../lib/supabase';
import { formatCurrency } from '../utils/helpers';
import type { Supplier, Product } from '../lib/tableNames';

interface VendorDashboardProps {
  user: any;
  onLogout: () => void;
}

const VendorDashboard = ({ user, onLogout }: VendorDashboardProps) => {
  const [products, setProducts] = useState<(Product & { supplier: Supplier })[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch products and suppliers on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products with supplier information
        const { data: productsData, error: productsError } = await dbQueries.getProductsWithSuppliers();
        if (productsError) throw productsError;

        // Fetch suppliers
        const { data: suppliersData, error: suppliersError } = await dbQueries.getSuppliers();
        if (suppliersError) throw suppliersError;

        setProducts(productsData || []);
        setSuppliers(suppliersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique categories for filter
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier?.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add to cart function
  const addToCart = (productId: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  // Calculate total cart items
  const totalCartItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // Convert cart to CartItem format
  const cartItems = products
    .filter(product => cart[product.id] > 0)
    .map(product => ({
      product,
      quantity: cart[product.id]
    }));

  // Update cart quantity
  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  // Remove from cart
  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  // Place order function
  const placeOrder = async () => {
    try {
      // Group items by supplier for separate orders
      const ordersBySupplier = cartItems.reduce((acc, item) => {
        const supplierId = item.product.supplier_id;
        if (!acc[supplierId]) {
          acc[supplierId] = [];
        }
        acc[supplierId].push(item);
        return acc;
      }, {} as { [key: number]: typeof cartItems });

      // Create orders for each supplier
      for (const [supplierId, items] of Object.entries(ordersBySupplier)) {
        const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        
        // Create order
        const { data: order, error: orderError } = await dbQueries.createOrder({
          vendor_id: user.id,
          supplier_id: parseInt(supplierId),
          total_amount: totalAmount,
          status: 'pending',
          delivery_address: `${user.business_name || user.name}, ${user.area}`,
          expected_delivery: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours from now
        });

        if (orderError) throw orderError;

        // Create order items
        for (const item of items) {
          await dbQueries.createOrderItem({
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.product.price,
            total_price: item.product.price * item.quantity
          });
        }
      }

      // Clear cart and show success
      setCart({});
      alert('🎉 Order placed successfully! You will receive delivery updates via SMS.');
      
    } catch (error) {
      console.error('Order placement failed:', error);
      alert('Failed to place order. Please try again.');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} userType="vendor" onLogout={onLogout} />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" message="Loading products..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} userType="vendor" onLogout={onLogout} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600">
            Find the best deals from verified suppliers near {user.area}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cart Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalCartItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image Placeholder */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <Store className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Product Image</p>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {product.category}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{product.description}</p>

                {/* Supplier Info */}
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <Store className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.supplier?.business_name}
                    </p>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{product.supplier?.area}</span>
                      {product.supplier?.kyc_verified && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.supplier?.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {product.supplier?.rating?.toFixed(1)} ({product.supplier?.total_reviews} reviews)
                  </span>
                </div>

                {/* Price and Actions */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="text-sm text-gray-500">per {product.unit}</p>
                    <p className="text-xs text-gray-500">
                      Min order: {product.min_order_quantity} {product.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Stock Status */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Stock: {product.stock_quantity} {product.unit}</span>
                    <span className={`${
                      product.stock_quantity > 50 ? 'text-green-600' : 
                      product.stock_quantity > 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {product.stock_quantity > 50 ? 'In Stock' : 
                       product.stock_quantity > 10 ? 'Low Stock' : 'Limited Stock'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        product.stock_quantity > 50 ? 'bg-green-500' : 
                        product.stock_quantity > 10 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((product.stock_quantity / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 right-6">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg flex items-center space-x-2 transform hover:scale-105 transition-all"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="bg-white text-orange-500 px-2 py-1 rounded-full text-sm font-bold animate-pulse">
              {totalCartItems}
            </span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onPlaceOrder={placeOrder}
      />
    </div>
  );
};

export default VendorDashboard;
