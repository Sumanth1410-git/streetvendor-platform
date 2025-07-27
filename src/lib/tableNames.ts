// Table name constants for easy management
export const TABLES = {
  VENDORS: 'sv_vendors_01',
  SUPPLIERS: 'sv_suppliers_01',
  PRODUCTS: 'sv_products_01',
  ORDERS: 'sv_orders_01',
  ORDER_ITEMS: 'sv_order_items_01',
  REVIEWS: 'sv_reviews_01'
} as const;

// TypeScript types for our data
export interface Vendor {
  id: number;
  phone: string;
  name: string;
  business_name?: string;
  area: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
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

export interface Product {
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

export interface Order {
  id: number;
  vendor_id: number;
  supplier_id: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';
  delivery_address: string;
  expected_delivery?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Review {
  id: number;
  vendor_id: number;
  supplier_id: number;
  order_id: number;
  rating: number;
  quality_score: number;
  delivery_score: number;
  review_text?: string;
  image_url?: string;
  created_at: string;
}

// Utility types for enhanced functionality
export interface ProductWithSupplier extends Product {
  supplier: Supplier;
}

export interface OrderWithSupplier extends Order {
  supplier: Pick<Supplier, 'business_name' | 'phone' | 'area'>;
}

export interface OrderWithVendor extends Order {
  vendor: Pick<Vendor, 'name' | 'business_name' | 'phone' | 'area'>;
}

export interface OrderItemWithProduct extends OrderItem {
  product: Pick<Product, 'name' | 'unit' | 'category' | 'image_url'>;
}

export interface ReviewWithVendor extends Review {
  vendor: Pick<Vendor, 'name' | 'business_name'>;
}

// Cart item type for frontend
export interface CartItem {
  product: ProductWithSupplier;
  quantity: number;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Order status options
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed', 
  PREPARING: 'preparing',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

// Product categories
export const PRODUCT_CATEGORIES = [
  'Vegetables',
  'Fruits', 
  'Grains',
  'Pulses',
  'Spices',
  'Herbs',
  'Oil',
  'Dairy',
  'Other'
] as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];
export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
