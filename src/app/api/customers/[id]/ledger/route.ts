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

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.$gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate)
    }

    // Query transactions
    const query: any = {
      customerId: new ObjectId(params.id),
      organizationId: new ObjectId(session.organizationId),
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    }

    const transactions = await Invoice.find(query).sort({ createdAt: -1 }).lean()

    // Calculate summary
    const summary = transactions.reduce(
      (acc, curr) => {
        acc.totalInvoices += 1
        acc.totalAmount += curr.total
        if (curr.status === "paid") {
          acc.paidAmount += curr.total
        } else if (curr.status === "pending") {
          acc.pendingAmount += curr.total
        }
        return acc
      },
      {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      },
    )

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        ...t,
        _id: t._id.toString(),
        customerId: t.customerId.toString(),
        organizationId: t.organizationId.toString(),
      })),
      summary,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ledger data" }, { status: 500 })
  }
}

