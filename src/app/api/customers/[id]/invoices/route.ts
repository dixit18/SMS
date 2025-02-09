import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "../../../../lib/mongodb"
import { getSession } from "../../../../lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const collection = client.db("stockmanagement").collection("invoices")

    const invoices = await collection
      .find({
        customerId: params.id,
        organizationId: new ObjectId(session.organizationId),
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(
      invoices.map((invoice) => ({
        ...invoice,
        _id: invoice._id.toString(),
        organizationId: invoice.organizationId.toString(),
      })),
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customer invoices" }, { status: 500 })
  }
}

