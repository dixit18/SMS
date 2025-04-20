import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getSession } from "../../../lib/auth"
import Product from "../../../lib/models/products"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const product: any = await Product.findOne({
      _id: new ObjectId((await params).id),
      organizationId: new ObjectId(session.organizationId),
    }).lean()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...product,
      _id: product._id.toString(),
      organizationId: product.organizationId.toString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    const requiredFields = [
      "name",
      "gsm",
      "size",
      "rollNo",
      "reelNo",
      "diameter",
      "weight",
      "quantity",
      "unit",
      "category",
    ]
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === "") {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Convert numeric fields
    if (data.gsm) data.gsm = Number(data.gsm)
    if (data.diameter) data.diameter = Number(data.diameter)
    if (data.weight) data.weight = Number(data.weight)
    if (data.quantity) data.quantity = Number(data.quantity)

    const result = await Product.findOneAndUpdate(
      {
        _id: new ObjectId((await params).id),
        organizationId: new ObjectId(session.organizationId),
      },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
      { new: true },
    )

    if (!result) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product: {
        ...result.toObject(),
        _id: result._id.toString(),
        organizationId: result.organizationId.toString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update product",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Instead of deleting, mark as sold with no invoice
    const result = await Product.findOneAndUpdate(
      {
        _id: new ObjectId((await params).id),
        organizationId: new ObjectId(session.organizationId),
      },
      {
        $set: {
          status: "sold",
          soldAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    if (!result) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

