// Common Types
export interface PageResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// User & Auth Types
export interface RoleResponse {
  id: number;
  name: string;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  isActive: boolean;
  role: RoleResponse;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface RegisterRequest {
  fullName?: string;
  email?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

export interface MessageResponse {
  message: string;
}

// Product Types
export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  status: boolean;
  parentId?: number;
}

export interface MaterialResponse {
  id: number;
  name: string;
  slug: string;
}

export interface ProductVariantResponse {
  id: number;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface ProductImageResponse {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  category: CategoryResponse;
  material: MaterialResponse;
  variants: ProductVariantResponse[];
  images: ProductImageResponse[];
}

// Cart Types
export interface CartItemResponse {
  id: number;
  variantId: number;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface CartResponse {
  id: number;
  userId: number;
  items: CartItemResponse[];
  totalAmount: number;
}

// Order Types
export interface OrderDetailResponse {
  id: number;
  variantId: number;
  productName: string;
  variantName: string;
  quantity: number;
  price: number;
}

export interface OrderResponse {
  id: number;
  trackingNumber: string;
  userId?: number;
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  orderDetails: OrderDetailResponse[];
}
