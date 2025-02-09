import { NextResponse } from "next/server"
import clientPromise from "../../lib/mongodb"
import { ObjectId } from "mongodb"
import { getSession } from "../../lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const collection = client.db("stockmanagement").collection("products")

    const products = await collection.find({ organizationId: new ObjectId(session.organizationId) }).toArray()

    return NextResponse.json(
      products.map((product) => ({
        ...product,
        _id: product._id.toString(),
        organizationId: product.organizationId.toString(),
      })),
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const client = await clientPromise
    const collection = client.db("stockmanagement").collection("products")

    const now = new Date()
    const product = {
      ...data,
      organizationId: new ObjectId(session.organizationId),
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(product)

    return NextResponse.json(
      {
        ...product,
        _id: result.insertedId.toString(),
        organizationId: product.organizationId.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

