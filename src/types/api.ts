// types/api.ts — types khớp 1-1 với contract của nomad-backend (xem API_REFERENCE.md)

// ─── Chung ────────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductColor {
  name: string;
  slug: string;
  hex: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
  alt?: string;
}

export interface ProductVariant {
  id?: string;
  sku: string;
  color: string; // slug, khớp với ProductColor.slug
  size: string;
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  // Flash sale (giới hạn thời gian) — khác với originalPrice (giá tham chiếu tĩnh, không hết hạn).
  salePrice?: number;
  saleStartAt?: string;
  saleEndAt?: string;
  // Luôn có sẵn trên mọi response — dùng effectivePrice làm giá hiển thị chính, KHÔNG dùng price.
  effectivePrice: number;
  isOnSale: boolean;
  category: Category;
  images: ProductImage[];
  colors: ProductColor[];
  variants: ProductVariant[];
  information?: string;
  isBestSeller: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name-asc";

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  isBestSeller?: boolean;
  onSale?: boolean;
  sort?: ProductSort;
}

// Payload gửi lên khi tạo/sửa sản phẩm (admin)
export interface ProductInput {
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  saleStartAt?: string;
  saleEndAt?: string;
  category: string; // id danh mục
  images: ProductImage[];
  colors: ProductColor[];
  variants: ProductVariant[];
  information?: string;
  isBestSeller?: boolean;
  isActive?: boolean;
}

export interface BulkSaleInput {
  percentOff: number;
  startAt: string;
  endAt: string;
  categoryId?: string;
  productIds?: string[];
}

export interface BulkSaleResult {
  matched: number;
  modified: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserRole = "customer" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";
export type PaymentMethod = "cod" | "payos";

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  province: string;
}

export interface OrderItem {
  product: string;
  variantId: string;
  name: string;
  slug: string;
  image?: string;
  sku: string;
  color: string;
  size: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export type RefundStatus = "none" | "pending" | "refunded";

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  note?: string;
  subtotal: number;
  shippingFee: number;
  couponCode?: string;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  refundStatus: RefundStatus;
  refundedAt?: string;
  refundNote?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// Chỉ có trong response của POST /orders và POST /orders/:id/pay (không lưu, không có ở GET)
export interface PayosPaymentInfo {
  checkoutUrl: string;
  qrCode: string;
  paymentLinkId: string;
  orderCode: number;
  expiredAt: number; // unix timestamp (giây)
}

export type CreateOrderResult = Order & { payment?: PayosPaymentInfo };
export interface CreatePaymentResult {
  order: Order;
  payment: PayosPaymentInfo;
}

export interface CreateOrderItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  shippingAddress: ShippingAddress;
  note?: string;
  couponCode?: string;
  paymentMethod?: PaymentMethod;
  userId?: string; // chỉ dùng khi admin tạo đơn thủ công
}

export interface ListOrdersParams {
  status?: OrderStatus;
  refundStatus?: RefundStatus;
  orderNumber?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export type CouponType = "percent" | "fixed";

export interface Coupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount?: number;
  expiresAt?: string;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponInput {
  code: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  minOrderValue?: number;
  usageLimit?: number;
  expiresAt?: string;
  isActive?: boolean;
  isPublic?: boolean;
}

// Coupon công khai hiển thị ở banner — GET /coupons/featured (không có thông tin nhạy cảm như usedCount)
export interface FeaturedCoupon {
  code: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  minOrderValue?: number;
  expiresAt?: string;
}

export interface CouponValidateResult {
  code: string;
  discount: number;
}

// ─── Shipping settings ──────────────────────────────────────────────────────

export interface ProvinceFee {
  province: string;
  fee: number;
}

export interface ShippingSettings {
  defaultFee: number;
  freeShippingThreshold: number;
  provinceFees: ProvinceFee[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardBestSeller {
  _id: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface DashboardLowStock {
  _id: string;
  name: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
}

export interface DashboardSummary {
  rangeDays: number;
  revenue: number;
  ordersInRange: number;
  ordersByStatus: Record<OrderStatus, number>;
  bestSellers: DashboardBestSeller[];
  lowStock: DashboardLowStock[];
  pendingRefunds: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}
