import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getSession } from "../../../../lib/auth";
import Invoice from "../../../../lib/models/invoice";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoice: any = await Invoice.findOne({
      _id: new ObjectId(params.id),
      organizationId: new ObjectId(session.organizationId),
    })
      .populate("customerId")
      .lean();

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText("INVOICE", {
      x: width / 2 - 50,
      y: height - 50,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Invoice Number: ${invoice.invoiceNumber}`, {
      x: 50,
      y: height - 100,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, {
      x: 50,
      y: height - 120,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText("Bill To:", {
      x: 50,
      y: height - 160,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(invoice.customerId.companyName, {
      x: 50,
      y: height - 180,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`GST: ${invoice.customerId.gstNumber}`, {
      x: 50,
      y: height - 200,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(invoice.customerId.address.street, {
      x: 50,
      y: height - 220,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(
      `${invoice.customerId.address.city}, ${invoice.customerId.address.state} ${invoice.customerId.address.zipCode}`,
      {
        x: 50,
        y: height - 240,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      },
    );

    page.drawText(invoice.customerId.address.country, {
      x: 50,
      y: height - 260,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    let y = height - 300;
    page.drawRectangle({
      x: 50,
      y: y - 5,
      width: 500,
      height: 25,
      color: rgb(0.95, 0.95, 0.95),
    });

    page.drawText("Item", { x: 60, y, size: 12, font: boldFont, color: rgb(0, 0, 0) });
    page.drawText("Price", { x: 350, y, size: 12, font: boldFont, color: rgb(0, 0, 0) });
    page.drawText("Total", { x: 450, y, size: 12, font: boldFont, color: rgb(0, 0, 0) });

    y -= 30;

    invoice.items.forEach((item: any) => {
      page.drawText(item.name, { x: 60, y, size: 12, font, color: rgb(0, 0, 0) });
      page.drawText(`INR ${item.price.toFixed(2)}`, { x: 350, y, size: 12, font, color: rgb(0, 0, 0) });
      page.drawText(`INR ${item.total.toFixed(2)}`, { x: 450, y, size: 12, font, color: rgb(0, 0, 0) });
      y -= 25;
    });

    y -= 10;
    page.drawLine({
      start: { x: 300, y },
      end: { x: 550, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    y -= 20;
    page.drawText("Subtotal:", { x: 350, y, size: 12, font, color: rgb(0, 0, 0) });
    page.drawText(`INR ${invoice.subtotal.toFixed(2)}`, { x: 450, y, size: 12, font, color: rgb(0, 0, 0) });

    if (invoice.tax > 0) {
      y -= 20;
      page.drawText("GST (18%):", { x: 350, y, size: 12, font, color: rgb(0, 0, 0) });
      page.drawText(`INR ${invoice.tax.toFixed(2)}`, { x: 450, y, size: 12, font, color: rgb(0, 0, 0) });
    }

    y -= 20;
    page.drawLine({
      start: { x: 300, y: y + 15 },
      end: { x: 550, y: y + 15 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    page.drawText("Total:", { x: 350, y, size: 12, font: boldFont, color: rgb(0, 0, 0) });
    page.drawText(`INR ${invoice.total.toFixed(2)}`, { x: 450, y, size: 12, font: boldFont, color: rgb(0, 0, 0) });

    const footerY = 50;
    page.drawText("Thank you for your business!", {
      x: width / 2 - 70,
      y: footerY,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
