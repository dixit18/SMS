import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getSession } from "../../lib/auth"
import Product from "../../lib/models/products"
import Invoice from "../../lib/models/invoice"
import connectDB from "../../lib/mongodb"

export async function GET() {
  try {
    await connectDB()
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const organizationId = new ObjectId(session.organizationId)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    // Get total sales for today
    const todaySales = await Invoice.aggregate([
      {
        $match: {
          organizationId,
          status: "paid",
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
    ])

    // Get total sales for last 30 days
    const monthlySales = await Invoice.aggregate([
      {
        $match: {
          organizationId,
          status: "paid",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
    ])

    // Get product statistics
    const productStats = await Promise.all([
      // Count available products
      Product.countDocuments({
        organizationId,
        status: "available",
      }),
      // Count sold products
      Product.countDocuments({
        organizationId,
        status: "sold",
      }),
      // Calculate total inventory value
      Product.aggregate([
        {
          $match: {
            organizationId,
            status: "available",
          },
        },
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ["$quantity", "$weight"] } },
          },
        },
      ]),
    ])

    // Get low stock products
    const lowStockProducts = await Product.find({
      organizationId,
      status: "available",
      quantity: { $lt: 10 },
    })
      .sort({ quantity: 1 })
      .limit(5)
      .lean()

    // Get recent invoices
    const recentInvoices = await Invoice.find({ organizationId }).sort({ createdAt: -1 }).limit(5).lean()

    return NextResponse.json({
      todaySales: {
        total: todaySales[0]?.total || 0,
        count: todaySales[0]?.count || 0,
      },
      monthlySales: {
        total: monthlySales[0]?.total || 0,
        count: monthlySales[0]?.count || 0,
      },
      productStats: {
        available: productStats[0] || 0,
        sold: productStats[1] || 0,
        totalValue: productStats[2][0]?.totalValue || 0,
      },
      lowStockProducts: lowStockProducts.map((p) => ({
        ...p,
        _id: p._id.toString(),
        organizationId: p.organizationId.toString(),
      })),
      recentInvoices: recentInvoices.map((i) => ({
        ...i,
        _id: i._id.toString(),
        organizationId: i.organizationId.toString(),
        customerId: typeof i.customerId === "object" ? i.customerId.toString() : i.customerId,
      })),
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

