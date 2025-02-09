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
    const collection = client.db("stockmanagement").collection("invoices")

    const invoices = await collection
      .find({ organizationId: new ObjectId(session.organizationId) })
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
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
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
    const db = client.db("stockmanagement")

    // Generate invoice number
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
    const lastInvoice = await db
      .collection("invoices")
      .find({
        organizationId: new ObjectId(session.organizationId),
        invoiceNumber: new RegExp(`INV-${dateStr}-`),
      })
      .sort({ invoiceNumber: -1 })
      .limit(1)
      .toArray()

    const sequence =
      lastInvoice.length > 0 ? String(Number(lastInvoice[0].invoiceNumber.split("-")[2]) + 1).padStart(3, "0") : "001"

    const invoice = {
      ...data,
      invoiceNumber: `INV-${dateStr}-${sequence}`,
      organizationId: new ObjectId(session.organizationId),
      createdAt: date,
      updatedAt: date,
    }

    // Start a session for transaction
    const session_db = client.startSession()

    try {
      await session_db.withTransaction(async () => {
        // Insert invoice
        const result = await db.collection("invoices").insertOne(invoice, { session: session_db })

        // Update product quantities
        for (const item of data.items) {
          await db.collection("products").updateOne(
            {
              _id: new ObjectId(item.productId),
              organizationId: new ObjectId(session.organizationId),
            },
            {
              $inc: { quantity: -item.quantity },
              $set: { updatedAt: date },
            },
            { session: session_db },
          )
        }

        return result
      })

      await session_db.endSession()

      return NextResponse.json(
        {
          ...invoice,
          _id: invoice._id?.toString(),
          organizationId: invoice.organizationId.toString(),
        },
        { status: 201 },
      )
    } catch (error) {
      await session_db.endSession()
      throw error
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}

