import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  gsm: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
    trim: true,
  },
  rollNo: {
    type: String,
    required: true,
  },
  reelNo: {
    type: String,
    required: true,
  },
  diameter: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    enum: ["pieces", "kg"],
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["available", "sold"],
    default: "available",
  },
  soldAt: {
    type: Date,
    default: null,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    default: null,
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

export default mongoose.models.Product || mongoose.model("Product", productSchema)

