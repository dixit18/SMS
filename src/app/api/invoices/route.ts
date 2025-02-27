import { NextResponse } from "next/server"
import { getSession } from "../../lib/auth"
import Invoice from "../../lib/models/invoice"
import products from "../../lib/models/products"
import connectDB from "../../lib/mongodb"
import mongoose from "mongoose"

export async function GET(request: Request) {
  try {
    await connectDB()
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const customerId = searchParams.get("customerId")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    const query = {
      organizationId: session.organizationId,
      ...(customerId && { customerId: new mongoose.Types.ObjectId(customerId) }),
      ...(search && {
        $or: [
          { invoiceNumber: { $regex: search, $options: "i" } },
          { customerName: { $regex: search, $options: "i" } },
        ],
      }),
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("customerId", "name companyName gstNumber")
        .lean(),
      Invoice.countDocuments(query),
    ])

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.log("Error fetching invoices:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate invoice number
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
    const lastInvoice = await Invoice.findOne({
      invoiceNumber: new RegExp(`INV-${dateStr}-`),
    })
      .sort({ invoiceNumber: -1 })
      .limit(1)

    const sequence = lastInvoice ? String(Number(lastInvoice.invoiceNumber.split("-")[2]) + 1).padStart(3, "0") : "001"

    const invoice = new Invoice({
      ...data,
      organizationId: session.organizationId,
      invoiceNumber: `INV-${dateStr}-${sequence}`,
    })

    await invoice.save()

    // Update product quantities
    for (const item of data.items) {
      const product = await products.findById(item.productId)
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`)
      }

      // Calculate quantity reduction based on sale type
     
      await products.findByIdAndUpdate(item.productId, {
        status: "sold",
        soldAt: new Date(),
        invoiceId: invoice._id,
      })
      
    }

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.log("Error creating invoice:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create invoice",
      },
      { status: 500 },
    )
  }
}
