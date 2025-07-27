import { createClient } from '@supabase/supabase-js'
import { TABLES } from './tableNames'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions for common queries
export const dbQueries = {
  // Get all suppliers
  getSuppliers: () => supabase.from(TABLES.SUPPLIERS).select('*'),
  
  // Get products by supplier
  getProductsBySupplier: (supplierId: number) => 
    supabase.from(TABLES.PRODUCTS).select('*').eq('supplier_id', supplierId),
  
  // Get all products with supplier info
  getProductsWithSuppliers: () => 
    supabase.from(TABLES.PRODUCTS)
      .select(`*, supplier:${TABLES.SUPPLIERS}(business_name, rating, area, kyc_verified)`),
  
  // Create new vendor
  createVendor: (vendorData: Partial<any>) => 
    supabase.from(TABLES.VENDORS).insert([vendorData]).select().single(),
  
  // Get vendor by phone
  getVendorByPhone: (phone: string) => 
    supabase.from(TABLES.VENDORS).select('*').eq('phone', phone).single(),
  
  // Create new supplier
  createSupplier: (supplierData: Partial<any>) => 
    supabase.from(TABLES.SUPPLIERS).insert([supplierData]).select().single(),
  
  // Get supplier by phone
  getSupplierByPhone: (phone: string) => 
    supabase.from(TABLES.SUPPLIERS).select('*').eq('phone', phone).single(),

  // Create order
  createOrder: (orderData: any) => 
    supabase.from(TABLES.ORDERS).insert([orderData]).select().single(),

  // Create order item
  createOrderItem: (orderItemData: any) => 
    supabase.from(TABLES.ORDER_ITEMS).insert([orderItemData]).select().single(),

  // Get orders for a vendor
  getVendorOrders: (vendorId: number) => 
    supabase.from(TABLES.ORDERS)
      .select(`*, ${TABLES.SUPPLIERS}(business_name, phone, area)`)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false }),

  // Get orders for a supplier
  getSupplierOrders: (supplierId: number) => 
    supabase.from(TABLES.ORDERS)
      .select(`*, ${TABLES.VENDORS}(name, business_name, phone, area)`)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false }),

  // Update order status
  updateOrderStatus: (orderId: number, status: string) => 
    supabase.from(TABLES.ORDERS)
      .update({ status })
      .eq('id', orderId)
      .select()
      .single(),

  // Get order items for an order
  getOrderItems: (orderId: number) => 
    supabase.from(TABLES.ORDER_ITEMS)
      .select(`*, ${TABLES.PRODUCTS}(name, unit, category, image_url)`)
      .eq('order_id', orderId),

  // Update product stock
  updateProductStock: (productId: number, newStock: number) => 
    supabase.from(TABLES.PRODUCTS)
      .update({ stock_quantity: newStock })
      .eq('id', productId)
      .select()
      .single(),

  // Add review
  addReview: (reviewData: any) => 
    supabase.from(TABLES.REVIEWS).insert([reviewData]).select().single(),

  // Get reviews for a supplier
  getSupplierReviews: (supplierId: number) => 
    supabase.from(TABLES.REVIEWS)
      .select(`*, ${TABLES.VENDORS}(name, business_name)`)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false }),

  // Update supplier rating (after new review)
  updateSupplierRating: (supplierId: number, newRating: number, newReviewCount: number) => 
    supabase.from(TABLES.SUPPLIERS)
      .update({ rating: newRating, total_reviews: newReviewCount })
      .eq('id', supplierId)
      .select()
      .single()
}
