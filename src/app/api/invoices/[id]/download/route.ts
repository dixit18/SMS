import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import PDFDocument from "pdfkit"
import { getSession } from "../../../../lib/auth"
import Invoice from "../../../../lib/models/invoice"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch invoice with customer details
    const invoice = await Invoice.findOne({
      _id: new ObjectId(params.id),
      organizationId: new ObjectId(session.organizationId),
    })
      .populate("customerId")
      .lean()

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 })

    // Stream the PDF directly to the response
    const chunks: Uint8Array[] = []
    doc.on("data", (chunk) => chunks.push(chunk))

    // Add content to PDF
    doc.fontSize(20).text("INVOICE", { align: "center" }).moveDown()

    doc
      .fontSize(12)
      .text(`Invoice Number: ${invoice.invoiceNumber}`)
      .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`)
      .moveDown()

    // Customer details
    doc
      .text("Bill To:")
      .text(invoice.customerId.companyName)
      .text(`GST: ${invoice.customerId.gstNumber}`)
      .text(invoice.customerId.address.street)
      .text(
        `${invoice.customerId.address.city}, ${invoice.customerId.address.state} ${invoice.customerId.address.zipCode}`,
      )
      .text(invoice.customerId.address.country)
      .moveDown()

    // Items table
    const tableTop = doc.y
    const itemX = 50
    const descriptionX = 150
    const detailsX = 280
    const priceX = 370
    const amountX = 450

    doc
      .text("Item", itemX, tableTop)
      .text("Description", descriptionX, tableTop)
      .text("Details", detailsX, tableTop)
      .text("Price", priceX, tableTop)
      .text("Amount", amountX, tableTop)

    let y = tableTop + 20

    // Items
    invoice.items.forEach((item) => {
      const details =
        item.saleType === "dimension"
          ? `${item.saleDetails.length} × ${item.saleDetails.width} × ${item.saleDetails.height}`
          : `${item.saleDetails.weight} kg`

      doc
        .text(item.name, itemX, y)
        .text(item.saleType, descriptionX, y)
        .text(details, detailsX, y)
        .text(`$${item.price.toFixed(2)}`, priceX, y)
        .text(`$${item.total.toFixed(2)}`, amountX, y)

      y += 20
    })

    // Totals
    const totalsY = y + 20
    doc
      .text("Subtotal:", 350, totalsY)
      .text(`$${invoice.subtotal.toFixed(2)}`, amountX, totalsY)
      .text("Tax:", 350, totalsY + 20)
      .text(`$${invoice.tax.toFixed(2)}`, amountX, totalsY + 20)
      .text("Total:", 350, totalsY + 40)
      .text(`$${invoice.total.toFixed(2)}`, amountX, totalsY + 40)

    doc.end()

    // Return PDF as stream
    return new Response(Buffer.concat(chunks), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}

