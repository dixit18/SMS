import { NextResponse } from "next/server"
import { getSession } from "../../lib/auth"
import Invoice from "../../lib/models/invoice"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    const query = {
      organizationId: session.organizationId,
      ...(search
        ? {
            $or: [
              { invoiceNumber: { $regex: search, $options: "i" } },
              { customerName: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
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

