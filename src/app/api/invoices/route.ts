import { NextResponse } from "next/server"
import { getSession } from "../../lib/auth"
import Invoice from "../../lib/models/invoice"
import Product from "../../lib/models/products"
import Customer from "../../lib/models/customer"
import mongoose from "mongoose"

export async function GET(request: Request) {
  try {
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
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const sessionData = await getSession()
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch customer details
    const customer = await Customer.findById(data.customerId).lean()
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
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

    // Calculate totals
    let subtotal = 0
    let sgstTotal = 0
    let cgstTotal = 0

    // Process each item
    const processedItems = data.items.map((item: any) => {
      // Ensure weight is set
      if (item.weight === undefined || item.weight === null) {
        item.weight = 0
      }

      const taxableValue = item.taxableValue || item.quantity * item.rate
      const sgstAmount = (taxableValue * item.sgstPercentage) / 100
      const cgstAmount = (taxableValue * item.cgstPercentage) / 100

      subtotal += taxableValue
      sgstTotal += sgstAmount
      cgstTotal += cgstAmount

      return {
        ...item,
        taxableValue,
        sgstAmount,
        cgstAmount,
        total: taxableValue + sgstAmount + cgstAmount,
      }
    })

    // Calculate total and round off
    const totalBeforeRounding = subtotal + sgstTotal + cgstTotal
    const roundedTotal = Math.round(totalBeforeRounding)
    const roundOff = roundedTotal - totalBeforeRounding

    // Create invoice
    const invoice = new Invoice({
      ...data,
      items: processedItems,
      subtotal,
      sgstTotal,
      cgstTotal,
      total: roundedTotal,
      roundOff,
      organizationId: sessionData.organizationId,
      invoiceNumber: `INV-${dateStr}-${sequence}`,
    })

    await invoice.save()

    // Mark products as sold (without transaction)
    for (const item of data.items) {
      await Product.findByIdAndUpdate(item.productId, {
        status: "sold",
        soldAt: new Date(),
        invoiceId: invoice._id,
      })
    }

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("Invoice creation error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create invoice",
      },
      { status: 500 },
    )
  }
}

