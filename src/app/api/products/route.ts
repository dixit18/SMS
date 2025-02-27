import { NextResponse } from "next/server"
import { getSession } from "../../lib/auth"
import Product from "../../lib/models/products"
import connectDB from "../../lib/mongodb"


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

    // Advanced filters
    const category = searchParams.get("category")
    const gsmMin = searchParams.get("gsmMin")
    const gsmMax = searchParams.get("gsmMax")
    const rollNo = searchParams.get("rollNo")
    const reelNo = searchParams.get("reelNo")
    const unit = searchParams.get("unit")

    const skip = (page - 1) * limit

    // Build query
    const query: any = {
      organizationId: session.organizationId,
       status: "available"
    }

    if (category) query.category = category
    if (gsmMin || gsmMax) {
      query.gsm = {}
      if (gsmMin) query.gsm.$gte = Number(gsmMin)
      if (gsmMax) query.gsm.$lte = Number(gsmMax)
    }
    if (rollNo) query.rollNo = { $regex: rollNo, $options: "i" }
    if (reelNo) query.reelNo = { $regex: reelNo, $options: "i" }
    if (unit) query.unit = unit

    // Get products with pagination
    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ])

    const totals = products.reduce(
      (acc, product) => {
        const unit = product.unit;
        
        if (unit === "kg") {
          acc.kg += product.weight || 0; // Sum weight for kg
        } else if (unit === "pieces") {
          acc.pieces += product.quantity || 0; // Sum quantity for pieces
        }
    
        return acc;
      },
      { kg: 0, pieces: 0 } // Initialize totals
    );
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      totals: totals,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}


export async function POST(request: Request) {
  try {
    await connectDB()
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const product = new Product({
      ...data,
      status: "available",
      organizationId: session.organizationId,
    })

    await product.save()

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

