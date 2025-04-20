import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getSession } from "../../../../lib/auth"
import Invoice from "../../../../lib/models/invoice"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const productId = (await params).id

    // Find invoices containing this product
    const invoices : any[] = await Invoice.aggregate([
      {
        $match: {
          organizationId: new ObjectId(session.organizationId),
          "items.productId": new ObjectId(productId),
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          invoiceNumber: 1,
          customerName: { $ifNull: ["$customer.name", "$customerName"] },
          companyName: { $ifNull: ["$customer.companyName", ""] },
          date: "$createdAt",
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: { $eq: ["$$item.productId", new ObjectId(productId)] },
            },
          },
        },
      },
    ])

    const salesHistory = invoices.map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      companyName: invoice.companyName,
      date: invoice.date,
      quantity: invoice.items[0]?.quantity || 0,
      price: invoice.items[0]?.price || 0,
    }))

    return NextResponse.json({
      salesHistory,
    })
  } catch (error) {
    console.error("Error fetching sales history:", error)
    return NextResponse.json({ error: "Failed to fetch sales history" }, { status: 500 })
  }
}

