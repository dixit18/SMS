import type { ObjectId } from "mongodb"

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Product {
  _id: string
  name: string
  description: string
  gsm: number
  size: string
  rollNo: string
  reelNo: string
  diameter: number
  weight: number
  quantity: number
  unit: string
  category: string
  status: "available" | "sold"
  soldAt?: string
  invoiceId?: string
  organizationId: string | ObjectId
  createdAt: string
  updatedAt: string
}

export interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  totals: {
    kg?: number
    pieces?: number
  }
}

export interface Customer {
  _id: string
  name: string
  companyName: string
  gstNumber: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  organizationId: string | ObjectId
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  _id: string
  invoiceNumber: string
  customerId: string | Customer
  customerName: string
  items: {
    productId: string
    name: string
    price: number
    tax: number
    taxPercentage: number
    total: number
  }[]
  subtotal: number
  tax: number
  total: number
  status: "pending" | "paid" | "cancelled"
  paymentMethod: string
  organizationId: string | ObjectId
  createdAt: string
  updatedAt: string
}

