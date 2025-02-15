import { NextResponse } from "next/server"
import { getSession } from "../../lib/auth"
import Product from "../../lib/models/products"

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
              { rollNo: { $regex: search, $options: "i" } },
              { category: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

