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
  rollNo: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
    default: 0, // Add default value to prevent validation errors
  },
  rate: {
    type: Number,
    required: true,
  },
  taxableValue: {
    type: Number,
    required: true,
  },
  sgstPercentage: {
    type: Number,
    required: true,
    default: 6, // Changed from 9 to 6
  },
  sgstAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  cgstPercentage: {
    type: Number,
    required: true,
    default: 6, // Changed from 9 to 6
  },
  cgstAmount: {
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
  invoiceDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Customer",
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  sgstTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  cgstTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  roundOff: {
    type: Number,
    default: 0,
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
  paymentTerms: {
    type: Number,
    default: 10, // Default payment terms in days
  },
  vehicleNo: {
    type: String,
    default: "",
  },
  transportName: {
    type: String,
    default: "",
  },
  lrNo: {
    type: String,
    default: "",
  },
  lrDate: {
    type: Date,
  },
  ewayBillNo: {
    type: String,
    default: "",
  },
  ewayBillDate: {
    type: Date,
  },
  poNo: {
    type: String,
    default: "",
  },
  poDate: {
    type: Date,
  },
  challanNo: {
    type: String,
    default: "",
  },
  challanDate: {
    type: Date,
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

