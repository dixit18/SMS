import { NextResponse } from "next/server"
import { getSession } from "../../lib/auth"
import Customer from "../../lib/models/customer"

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
              { name: { $regex: search, $options: "i" } },
              { companyName: { $regex: search, $options: "i" } },
              { gstNumber: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    }

    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ companyName: 1 }).skip(skip).limit(limit).lean(),
      Customer.countDocuments(query),
    ])

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

