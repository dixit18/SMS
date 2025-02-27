import { NextResponse } from "next/server"
import { getSession } from "../../../lib/auth"
import Product from "../../../lib/models/products"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("q") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const skip = (page - 1) * limit

    const query = {
      organizationId: session.organizationId,
      status: "available",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { rollNo: { $regex: search, $options: "i" } },
        { reelNo: { $regex: search, $options: "i" } },
      ],
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .select("name rollNo reelNo size gsm quantity unit")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + products.length < total,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 })
  }
}

