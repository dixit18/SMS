import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "../../../lib/mongodb"
import { getSession } from "../../../lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const collection = client.db("stockmanagement").collection("products")

    const product = await collection.findOne({
      _id: new ObjectId(params.id),
      organizationId: new ObjectId(session.organizationId),
    })

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const client = await clientPromise
    const collection = client.db("stockmanagement").collection("products")

    const result = await collection.updateOne(
      {
        _id: new ObjectId(params.id),
        organizationId: new ObjectId(session.organizationId),
      },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const collection = client.db("stockmanagement").collection("products")

    const result = await collection.deleteOne({
      _id: new ObjectId(params.id),
      organizationId: new ObjectId(session.organizationId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

