import { useState } from 'react';
import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

// Define interfaces locally to avoid import issues
interface Supplier {
  id: number;
  business_name: string;
  owner_name: string;
  phone: string;
  address: string;
  area: string;
  latitude?: number;
  longitude?: number;
  kyc_verified: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  supplier_id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock_quantity: number;
  min_order_quantity: number;
  image_url?: string;
  description?: string;
  updated_at: string;
}

interface CartItem {
  product: Product & { supplier: Supplier };
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onPlaceOrder: () => void;
}

const CartModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem,
  onPlaceOrder 
}: CartModalProps) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery above ₹500
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      await onPlaceOrder();
      onClose();
    } catch (error) {
      console.error('Order placement failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="w-6 h-6 mr-2" />
              Your Cart ({cartItems.length})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600">Add some products to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">{item.product.supplier.business_name}</p>
                        <p className="text-sm text-gray-500">{item.product.category}</p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          disabled={item.quantity >= item.product.stock_quantity}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-500">× {formatCurrency(item.product.price)}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                        <p className="text-xs text-gray-500">
                          per {item.product.unit}
                        </p>
                      </div>
                    </div>

                    {/* Stock warning */}
                    {item.quantity >= item.product.stock_quantity && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        Maximum available: {item.product.stock_quantity} {item.product.unit}
                      </div>
                    )}

                    {/* Minimum order check */}
                    {item.quantity < item.product.min_order_quantity && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                        Minimum order: {item.product.min_order_quantity} {item.product.unit}
                      </div>
                    )}

                    {/* Supplier info */}
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>From: {item.product.supplier.area}</span>
                      {item.product.supplier.kyc_verified && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary & Checkout */}
          {cartItems.length > 0 && (
            <div className="border-t p-6">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      formatCurrency(deliveryFee)
                    )}
                  </span>
                </div>
                {subtotal < 500 && deliveryFee > 0 && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                    💡 Add {formatCurrency(500 - subtotal)} more for free delivery
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Validation warnings */}
              {cartItems.some(item => item.quantity < item.product.min_order_quantity) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  ⚠️ Some items don't meet minimum order requirements
                </div>
              )}

              {cartItems.some(item => item.quantity > item.product.stock_quantity) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  ❌ Some items exceed available stock
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={
                  loading || 
                  cartItems.some(item => 
                    item.quantity < item.product.min_order_quantity || 
                    item.quantity > item.product.stock_quantity
                  )
                }
                className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </div>
                ) : (
                  `Place Order - ${formatCurrency(total)}`
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🚚 Orders are typically delivered within 2-4 hours
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll receive SMS updates about your order status
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
