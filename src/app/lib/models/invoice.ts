import mongoose from "mongoose"

const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
    default: 0,
  },
  taxPercentage: {
    type: Number,
    required: true,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
})

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Customer",
  },
  customerName: {
    type: String,
    required: true,
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "paid", "cancelled"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Organization",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema)

