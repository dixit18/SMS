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
    const db = client.db("stockmanagement")

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    // Get total sales for today
    const todaySales = await db
      .collection("invoices")
      .aggregate([
        {
          $match: {
            organizationId: new ObjectId(session.organizationId),
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
      .toArray()

    // Get total sales for last 30 days
    const monthlySales = await db
      .collection("invoices")
      .aggregate([
        {
          $match: {
            organizationId: new ObjectId(session.organizationId),
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
      .toArray()

    // Get low stock products
    const lowStockProducts = await db
      .collection("products")
      .find({
        organizationId: new ObjectId(session.organizationId),
        quantity: { $lt: 10 },
      })
      .toArray()

    // Get recent invoices
    const recentInvoices = await db
      .collection("invoices")
      .find({ organizationId: new ObjectId(session.organizationId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    return NextResponse.json({
      todaySales: {
        total: todaySales[0]?.total || 0,
        count: todaySales[0]?.count || 0,
      },
      monthlySales: {
        total: monthlySales[0]?.total || 0,
        count: monthlySales[0]?.count || 0,
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
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

