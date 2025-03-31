import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getSession } from "../../../../lib/auth"
import Product from "../../../../lib/models/products"
import Invoice from "../../../../lib/models/invoice"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("q")

    if (!searchTerm) {
      return NextResponse.json({ error: "Search term is required" }, { status: 400 })
    }

    // Find the product - include both sold and unsold products
    const product: any = await Product.findOne({
      organizationId: new ObjectId(session.organizationId),
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { rollNo: { $regex: searchTerm, $options: "i" } },
        { reelNo: { $regex: searchTerm, $options: "i" } },
      ],
    }).lean()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // If product is sold, get sales history
    let salesHistory: any[] = []
    if (product.status === "sold") {
      const invoices = await Invoice.aggregate([
        {
          $match: {
            organizationId: new ObjectId(session.organizationId),
            "items.productId": product._id,
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
                cond: { $eq: ["$$item.productId", product._id] },
              },
            },
          },
        },
      ])

      salesHistory = invoices.map((invoice) => ({
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        companyName: invoice.companyName,
        date: invoice.date,
        quantity: invoice.items[0]?.quantity || 0,
        price: invoice.items[0]?.price || 0,
      }))
    }

    return NextResponse.json({
      product: {
        ...product,
        _id: product._id.toString(),
        organizationId: product.organizationId.toString(),
        ...(salesHistory.length > 0 && { salesHistory }),
      },
    })
  } catch (error) {
    console.error("Product search error:", error)
    return NextResponse.json({ error: "Failed to search product" }, { status: 500 })
  }
}

