import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "../../../lib/mongodb"
import { getSession } from "../../../lib/auth"
import Customer from "../../../lib/models/customer"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise

    const customer = await Customer.findOne({
      _id: new ObjectId((await params).id),
      organizationId: new ObjectId(session.organizationId),
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...customer,
      _id: customer._id.toString(),
      organizationId: customer.organizationId.toString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const client = await clientPromise

    const result = await Customer.updateOne(
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
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise

    const result = await Customer.deleteOne({
      _id: new ObjectId((await params).id),
      organizationId: new ObjectId(session.organizationId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}

