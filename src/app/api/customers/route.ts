import { NextResponse } from "next/server"
import clientPromise from "../../lib/mongodb"
import { getSession } from "../../lib/auth"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const collection = client.db("stockmanagement").collection("customers")

    const customers = await collection.find({ organizationId: new ObjectId(session.organizationId) }).toArray()

    return NextResponse.json(
      customers.map((customer) => ({
        ...customer,
        _id: customer._id.toString(),
        organizationId: customer.organizationId.toString(),
      })),
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
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
    const collection = client.db("stockmanagement").collection("customers")

    const now = new Date()
    const customer = {
      ...data,
      organizationId: new ObjectId(session.organizationId),
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(customer)

    return NextResponse.json(
      {
        ...customer,
        _id: result.insertedId.toString(),
        organizationId: customer.organizationId.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}

