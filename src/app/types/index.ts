import type { ObjectId } from "mongodb"

// export interface PaginatedResponse<T> {
//   items: T[]
//   pagination: {
//     page: number
//     limit: number
//     total: number
//     totalPages: number
//   }
// }

export interface Product {
  _id: string
  name: string
  description: string
  gsm: number
  rollNo: string
  reelNo: string
  diameter: number
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  quantity: number
  price: number
  unit: string
  category: string
  organizationId: string | ObjectId
  createdAt: string
  updatedAt: string
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
    quantity: number
    price: number
    total: number
    saleType: "dimension" | "weight"
    saleDetails: {
      length?: number
      width?: number
      height?: number
      weight?: number
    }
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

