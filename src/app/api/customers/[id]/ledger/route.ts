import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getSession } from "../../../../lib/auth"
import Invoice from "../../../../lib/models/invoice"
import Customer from "../../../../lib/models/customer"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify customer belongs to organization
    const customer = await Customer.findOne({
      _id: new ObjectId(params.id),
      organizationId: new ObjectId(session.organizationId),
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.$gte = new Date(startDate)
    }
    if (endDate) {
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999)
      dateFilter.$lte = endDateTime
    }

    // Query transactions
    const query: any = {
      customerId: new ObjectId(params.id),
      organizationId: new ObjectId(session.organizationId),
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    }

    // Get paginated transactions
    const [transactions, total] = await Promise.all([
      Invoice.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Invoice.countDocuments(query),
    ])

    // Calculate summary (using the full dataset, not just the paginated results)
    const summary = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: "$total" },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, "$total", 0],
            },
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$total", 0],
            },
          },
        },
      },
    ]).exec()

    const summaryData = summary[0] || {
      totalInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
    }

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        ...t,
        _id: t._id.toString(),
        customerId: t.customerId.toString(),
        organizationId: t.organizationId.toString(),
      })),
      summary: summaryData,
      hasMore: skip + transactions.length < total,
      total,
    })
  } catch (error) {
    console.error("Ledger error:", error)
    return NextResponse.json({ error: "Failed to fetch ledger data" }, { status: 500 })
  }
}

