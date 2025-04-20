import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getSession } from "../../../../../lib/auth";
import Invoice from "../../../../../lib/models/invoice";
import Customer from "../../../../../lib/models/customer";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch customer details
    const customer = await Customer.findOne({
      _id: new ObjectId((await params).id),
      organizationId: new ObjectId(session.organizationId),
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    // Query transactions
    const query: any = {
      customerId: new ObjectId((await params).id),
      organizationId: new ObjectId(session.organizationId),
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    };

    const transactions = await Invoice.find(query).sort({ createdAt: -1 }).lean();

    // Calculate summary
    const summary = transactions.reduce(
      (acc, curr) => {
        acc.totalInvoices += 1;
        acc.totalAmount += curr.total;
        if (curr.status === "paid") {
          acc.paidAmount += curr.total;
        } else if (curr.status === "pending") {
          acc.pendingAmount += curr.total;
        }
        return acc;
      },
      {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      }
    );

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let yPosition = height - 50;

    page.drawText("Customer Ledger", { x: 200, y: yPosition, size: 20, font, color: rgb(0, 0, 0) });
    yPosition -= 30;

    // Customer details
    page.drawText(`Customer: ${customer.name}`, { x: 50, y: yPosition, size: 12, font });
    yPosition -= 20;
    page.drawText(`Company: ${customer.companyName}`, { x: 50, y: yPosition, size: 12, font });
    yPosition -= 20;
    page.drawText(`GST Number: ${customer.gstNumber}`, { x: 50, y: yPosition, size: 12, font });
    yPosition -= 30;

    if (startDate || endDate) {
      page.drawText(
        `Period: ${startDate ? new Date(startDate).toLocaleDateString() : "Start"} to ${
          endDate ? new Date(endDate).toLocaleDateString() : "End"
        }`,
        { x: 50, y: yPosition, size: 12, font }
      );
      yPosition -= 30;
    }

    // Summary
    page.drawText("Summary", { x: 50, y: yPosition, size: 14, font });
    yPosition -= 20;
    page.drawText(`Total Invoices: ${summary.totalInvoices}`, { x: 50, y: yPosition, size: 12, font });
    yPosition -= 20;
    page.drawText(`Total Amount: $${summary.totalAmount.toFixed(2)}`, { x: 50, y: yPosition, size: 12, font });
    yPosition -= 20;
    page.drawText(`Paid Amount: $${summary.paidAmount.toFixed(2)}`, { x: 50, y: yPosition, size: 12, font });
    yPosition -= 20;
    page.drawText(`Pending Amount: $${summary.pendingAmount.toFixed(2)}`, { x: 50, y: yPosition, size: 12, font });
    yPosition -= 30;

    // Transactions Table Headers
    page.drawText("Invoice No.", { x: 50, y: yPosition, size: 10, font });
    page.drawText("Date", { x: 150, y: yPosition, size: 10, font });
    page.drawText("Status", { x: 250, y: yPosition, size: 10, font });
    page.drawText("Amount", { x: 400, y: yPosition, size: 10, font });
    yPosition -= 20;

    // Transactions Table Rows
    transactions.forEach((transaction) => {
      if (yPosition < 50) {
        page.drawText("(More transactions not displayed due to space)", { x: 50, y: yPosition, size: 10, font });
        return;
      }
      page.drawText(transaction.invoiceNumber, { x: 50, y: yPosition, size: 10, font });
      page.drawText(new Date(transaction.createdAt).toLocaleDateString(), { x: 150, y: yPosition, size: 10, font });
      page.drawText(transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1), { x: 250, y: yPosition, size: 10, font });
      page.drawText(`$${transaction.total.toFixed(2)}`, { x: 400, y: yPosition, size: 10, font });
      yPosition -= 20;
    });

    // Finalize PDF
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ledger-${customer.name}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.log("<<<error", error);
    return NextResponse.json({ error: "Failed to generate ledger" }, { status: 500 });
  }
}
