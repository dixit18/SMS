import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { getSession } from "../../../../lib/auth"
import Invoice from "../../../../lib/models/invoice"

// Company details will come from Organization settings
const COMPANY_DETAILS = {
  name: "Laxmi INTERNATIONAL",
  address: "A/G/3, ANGAN ANNEXY, BAREJA CROSS ROAD, BAREJA, AHMEDABAD-382425.",
  phone: "9428612643",
  mobile: "9099331633",
  email: "info@laxmiinternational.com",
  gst: "24DOLPS6199E1ZC",
  pan: "DOLPS6199E",
  bankName1: "ICICI BANK LTD",
  branch1: "BODAKDEV",
  accountNo1: "230805002078",
  ifscCode1: "ICIC0002308",
  bankName2: "HDFC BANK LTD",
  branch2: "PALDI",
  accountNo2: "50200050159191",
  ifscCode2: "HDFC0000299",
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const paramsId = await params.id
    // Fetch invoice with customer details
    const invoice: any = await Invoice.findOne({
      _id: new ObjectId(paramsId),
      organizationId: new ObjectId(session.organizationId),
    })
      .populate("customerId")
      .lean()

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const customer = invoice.customerId as any

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Helper function to draw a bordered box
    const drawBox = (x: number, y: number, w: number, h: number) => {
      page.drawRectangle({
        x,
        y: height - y - h,
        width: w,
        height: h,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      })
    }

    // Helper function to draw text with alignment options
    const drawText = (text: string, x: number, y: number, options: any = {}) => {
      const fontSize = options.size || 9
      const textFont = options.bold ? boldFont : font
      const textWidth = textFont.widthOfTextAtSize(text, fontSize)
      
      let xPosition = x
      
      // Handle horizontal alignment
      if (options.align === "center") {
        xPosition = x - textWidth / 2
      } else if (options.align === "right") {
        xPosition = x - textWidth
      }
      
      page.drawText(text, {
        x: xPosition,
        y: height - y,
        size: fontSize,
        font: textFont,
        ...options,
      })
    }

    // Header - OM NAMAH SHIVAY - centered properly
    drawText(":: OM NAMAH SHIVAY ::", width / 2, 30, { size: 14, bold: true, align: "center" })

    // TAX INVOICE - centered
    drawText("TAX INVOICE", width / 2, 50, { size: 16, bold: true, align: "center" })

    // (ORIGINAL / DUPLICATE) - centered
    drawText("(ORIGINAL / DUPLICATE)", width / 2, 70, { size: 12, align: "center" })

    // Company Name Box
    drawBox(30, 90, width - 60, 40)
    drawText(COMPANY_DETAILS.name, width / 2, 115, { size: 16, bold: true, align: "center" })

    // Company Address Box - FIXED: Increased height to accommodate all text
    drawBox(30, 130, width - 60, 70) // Increased height from 60 to 70
    drawText("Company Address :-", 40, 145, { size: 9 })
    drawText(COMPANY_DETAILS.address, 40, 160, { size: 9 })
    drawText(`Phone: ${COMPANY_DETAILS.phone} (M): ${COMPANY_DETAILS.mobile}`, 40, 175, { size: 9 })
    drawText(`E-mail: ${COMPANY_DETAILS.email}`, 350, 175, { size: 9 })
    // FIXED: Adjusted vertical position to keep text within the box
    drawText(`Company's GST IN: ${COMPANY_DETAILS.gst}`, 40, 185, { size: 9 })
    drawText(`Company's PAN: ${COMPANY_DETAILS.pan}`, 350, 185, { size: 9 })

    // Customer and Invoice Details Box - FIXED: Adjusted starting Y position
    const customerBoxY = 200 // Changed from 190 to 200 to account for the taller company address box
    const customerBoxWidth = (width - 60) / 2
    drawBox(30, customerBoxY, customerBoxWidth, 120)
    drawBox(30 + customerBoxWidth, customerBoxY, customerBoxWidth, 120)

    // Customer Details
    drawText("Details of Consignee (Bill to)", 40, customerBoxY + 15, { size: 9, bold: true })
    drawText(customer.companyName, 40, customerBoxY + 30, { size: 9 })
    drawText(customer.address.street, 40, customerBoxY + 45, { size: 9 })
    drawText(customer.address.city, 40, customerBoxY + 60, { size: 9 })
    drawText(customer.address.state, 40, customerBoxY + 75, { size: 9 })
    drawText(`State: ${customer.address.state}`, 40, customerBoxY + 90, { size: 9 })
    drawText(`GSTIN: ${customer.gstNumber}`, 40, customerBoxY + 105, { size: 9 })

    // Invoice Details - improved spacing and alignment
    // FIXED: Better spacing between label and value, aligned dates to the right
    const invoiceColX1 = 30 + customerBoxWidth + 20 // Left column of invoice details
    const invoiceColX2 = 30 + customerBoxWidth + 90 // Value column of invoice details
    const dateColX = width - 110 // Date column position
    const dateValueX = width - 40 // Date value position
    
    // Row 1: Invoice No
    drawText("Invoice No.:", invoiceColX1, customerBoxY + 15, { size: 9 })
    drawText(invoice.invoiceNumber, invoiceColX2, customerBoxY + 15, { size: 9 })
    drawText("Dt.:", dateColX, customerBoxY + 15, { size: 9 })
    drawText(new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString("en-IN"), dateValueX, customerBoxY + 15, {
      size: 9,
      align: "right"
    })

    // Row 2: Challan No
    drawText("Challan No.:", invoiceColX1, customerBoxY + 30, { size: 9 })
    drawText(invoice.challanNo || "", invoiceColX2, customerBoxY + 30, { size: 9 })
    drawText("Dt.:", dateColX, customerBoxY + 30, { size: 9 })
    drawText(invoice.challanDate ? new Date(invoice.challanDate).toLocaleDateString("en-IN") : "", dateValueX, customerBoxY + 30, {
      size: 9,
      align: "right"
    })

    // Row 3: PO No
    drawText("P.O. No.:", invoiceColX1, customerBoxY + 45, { size: 9 })
    drawText(invoice.poNo || "", invoiceColX2, customerBoxY + 45, { size: 9 })
    drawText("Dt.:", dateColX, customerBoxY + 45, { size: 9 })
    drawText(invoice.poDate ? new Date(invoice.poDate).toLocaleDateString("en-IN") : "", dateValueX, customerBoxY + 45, {
      size: 9,
      align: "right"
    })

    // Row 4: Vehicle No
    drawText("Vehicle No.:", invoiceColX1, customerBoxY + 60, { size: 9 })
    drawText(invoice.vehicleNo || "", invoiceColX2, customerBoxY + 60, { size: 9 })

    // Row 5: Transport
    drawText("Transport:", invoiceColX1, customerBoxY + 75, { size: 9 })
    drawText(invoice.transportName || "", invoiceColX2, customerBoxY + 75, { size: 9 })

    // Row 6: LR No
    drawText("L.R. No.:", invoiceColX1, customerBoxY + 90, { size: 9 })
    drawText(invoice.lrNo || "", invoiceColX2, customerBoxY + 90, { size: 9 })
    drawText("Dt.:", dateColX, customerBoxY + 90, { size: 9 })
    drawText(invoice.lrDate ? new Date(invoice.lrDate).toLocaleDateString("en-IN") : "", dateValueX, customerBoxY + 90, {
      size: 9,
      align: "right"
    })

    // Row 7: E-way Bill
    drawText("EWay Bill No.:", invoiceColX1, customerBoxY + 105, { size: 9 })
    drawText(invoice.ewayBillNo || "", invoiceColX2, customerBoxY + 105, { size: 9 })
    drawText("Dt.:", dateColX, customerBoxY + 105, { size: 9 })
    drawText(invoice.ewayBillDate ? new Date(invoice.ewayBillDate).toLocaleDateString("en-IN") : "", dateValueX, customerBoxY + 105, {
      size: 9,
      align: "right"
    })

    // Items Table Header - FIXED: Adjusted position to account for taller company address box
    const tableTop = 320 // Adjusted from 310
    drawBox(30, tableTop, width - 60, 30)

    // Table Headers with better alignment
    const columns = [
      { x: 30, width: 30, title: "Sr. No.", align: "center" },
      { x: 60, width: 200, title: "Product Description", align: "left" },
      { x: 260, width: 60, title: "Roll No", align: "center" },
      { x: 320, width: 50, title: "Qty", align: "center" },
      { x: 370, width: 50, title: "Rate", align: "center" },
      { x: 420, width: 40, title: "SGST (%)", align: "center" },
      { x: 460, width: 40, title: "CGST (%)", align: "center" },
      { x: 500, width: 65, title: "Amount", align: "right" },
    ]

    // Draw vertical lines for headers
    for (let i = 0; i < columns.length; i++) {
      if (i > 0) {
        page.drawLine({
          start: { x: columns[i].x, y: height - tableTop },
          end: { x: columns[i].x, y: height - tableTop - 30 },
          thickness: 1,
          color: rgb(0, 0, 0),
        })
      }
    }

    // Draw header texts with proper alignment
    for (let i = 0; i < columns.length; i++) {
      let xPos = columns[i].x + columns[i].width / 2
      
      if (columns[i].align === "left") {
        xPos = columns[i].x + 5
      } else if (columns[i].align === "right") {
        xPos = columns[i].x + columns[i].width - 5
      }

      drawText(columns[i].title, xPos, tableTop + 20, {
        size: 8,
        bold: true,
        align: columns[i].align,
      })
    }

    // Items Table Content
    const currentY = tableTop + 30
    const lineHeight = 20 // Reduced line height

    // Calculate how many items we have and how many empty rows we need
    const itemCount = invoice.items.length
    const emptyRowsNeeded = Math.max(0, 10 - itemCount) // Ensure at least 10 rows total
    const totalRows = itemCount + emptyRowsNeeded
    const itemsHeight = totalRows * lineHeight

    // Draw table box
    drawBox(30, currentY, width - 60, itemsHeight)

    // Draw vertical lines for items
    for (let i = 0; i < columns.length; i++) {
      if (i > 0) {
        page.drawLine({
          start: { x: columns[i].x, y: height - currentY },
          end: { x: columns[i].x, y: height - currentY - itemsHeight },
          thickness: 1,
          color: rgb(0, 0, 0),
        })
      }
    }

    // Draw items with proper alignment
    invoice.items.forEach((item: any, index: number) => {
      // Draw horizontal line if not the first item
      if (index > 0) {
        page.drawLine({
          start: { x: 30, y: height - (currentY + index * lineHeight) },
          end: { x: width - 30, y: height - (currentY + index * lineHeight) },
          thickness: 1,
          color: rgb(0, 0, 0),
        })
      }

      // Calculate y position for the current row
      const rowY = currentY + index * lineHeight + 15
      
      // Draw item data with proper alignment
      drawText((index + 1).toString(), columns[0].x + columns[0].width / 2, rowY, { 
        size: 8, 
        align: "center" 
      })
      
      drawText(item.name, columns[1].x + 5, rowY, { size: 8 })
      
      drawText(item.rollNo, columns[2].x + columns[2].width / 2, rowY, { 
        size: 8,
        align: "center"
      })
      
      drawText(item.quantity.toString(), columns[3].x + columns[3].width / 2, rowY, { 
        size: 8,
        align: "center"
      })
      
      drawText(item.rate?.toFixed(2) || "0.00", columns[4].x + columns[4].width / 2, rowY, { 
        size: 8,
        align: "center"
      })
      
      drawText(item.sgstPercentage?.toFixed(2) || "6.00", columns[5].x + columns[5].width / 2, rowY, {
        size: 8,
        align: "center"
      })
      
      drawText(item.cgstPercentage?.toFixed(2) || "6.00", columns[6].x + columns[6].width / 2, rowY, {
        size: 8,
        align: "center"
      })
      
      // Right align the amount
      drawText(item.total.toFixed(2), columns[7].x + columns[7].width - 5, rowY, {
        size: 8,
        align: "right"
      })
    })

    // Draw empty rows for handwritten notes
    for (let i = 0; i < emptyRowsNeeded; i++) {
      const rowIndex = itemCount + i

      // Draw horizontal line
      page.drawLine({
        start: { x: 30, y: height - (currentY + rowIndex * lineHeight) },
        end: { x: width - 30, y: height - (currentY + rowIndex * lineHeight) },
        thickness: 1,
        color: rgb(0, 0, 0),
      })
    }

    // Payment Terms Box
    const paymentBoxY = currentY + itemsHeight
    drawBox(30, paymentBoxY, width - 60, 30)

    // Summary section - aligned properly
    drawText(`Total Qty: ${invoice.items.reduce((sum: any, item: any) => sum + item.quantity, 0)}`, 350, paymentBoxY + 15, {
      size: 8,
    })
    drawText("Sub Total:", 350, paymentBoxY + 25, { size: 8 })
    drawText(invoice.subtotal.toFixed(2), width - 40, paymentBoxY + 25, { 
      size: 8,
      align: "right"
    })

    // Tax Details Box
    const taxBoxY = paymentBoxY + 30
    drawBox(30, taxBoxY, width - 60, 60)
    drawText("NOTE:", 40, taxBoxY + 20, { size: 8 })

    // Better alignment for tax values
    const taxColX = 350 // Label position
    const valueColX = width - 40 // Value position - right aligned
    
    drawText(`CGST @ ${invoice.items[0]?.cgstPercentage || 6}%`, taxColX, taxBoxY + 15, { size: 8 })
    drawText(`${invoice.cgstTotal?.toFixed(2) || (invoice.tax / 2).toFixed(2)}`, valueColX, taxBoxY + 15, { 
      size: 8,
      align: "right"
    })

    drawText(`SGST @ ${invoice.items[0]?.sgstPercentage || 6}%`, taxColX, taxBoxY + 30, { size: 8 })
    drawText(`${invoice.sgstTotal?.toFixed(2) || (invoice.tax / 2).toFixed(2)}`, valueColX, taxBoxY + 30, { 
      size: 8,
      align: "right"
    })

    drawText("Round Off", taxColX, taxBoxY + 45, { size: 8 })
    drawText(`${invoice.roundOff?.toFixed(2) || "0.00"}`, valueColX, taxBoxY + 45, { 
      size: 8,
      align: "right"
    })

    // Total Amount Box
    const totalBoxY = taxBoxY + 60
    drawBox(30, totalBoxY, width - 60, 30)
    drawText("NET AMOUNT", taxColX, totalBoxY + 20, { size: 9, bold: true })
    drawText(`INR ${invoice.total.toFixed(2)}`, valueColX, totalBoxY + 20, { 
      size: 9, 
      bold: true,
      align: "right"
    })

    // Amount in Words Box
    const wordsBoxY = totalBoxY + 30
    drawBox(30, wordsBoxY, width - 60, 30)
    drawText(`[In words] : ${numberToWords(invoice.total)} Only.`, 40, wordsBoxY + 20, { size: 8 })

    // Bank Details Box
    const bankBoxY = wordsBoxY + 30
    drawBox(30, bankBoxY, width - 60, 40)
    drawText("Bank Details:", 40, bankBoxY + 15, { size: 8 })
    drawText(
      `${COMPANY_DETAILS.bankName1} BRANCH: ${COMPANY_DETAILS.branch1} A/c No. ${COMPANY_DETAILS.accountNo1} IFSC CODE: ${COMPANY_DETAILS.ifscCode1}`,
      40,
      bankBoxY + 25,
      { size: 7 },
    )
    drawText(
      `${COMPANY_DETAILS.bankName2} A/C NO: ${COMPANY_DETAILS.accountNo2} BRANCH: ${COMPANY_DETAILS.branch2} IFSC CODE: ${COMPANY_DETAILS.ifscCode2}`,
      40,
      bankBoxY + 35,
      { size: 7 },
    )

    // Terms and Conditions Box - FIXED: Increased height to accommodate payment terms
    const termsBoxY = bankBoxY + 40
    drawBox(30, termsBoxY, width - 60, 115) // Increased height from 100 to 115

    drawText("Terms & Conditions:", 40, termsBoxY + 15, { size: 8, bold: true })
    drawText(
      "(1) We do not hold responsible for any breakage/demage/shortage/leakage in transit.",
      40,
      termsBoxY + 30,
      { size: 7 },
    )
    drawText("(2) Our responsibility ceases when the goods are delivered to the carrier.", 40, termsBoxY + 45, {
      size: 7,
    })
    drawText("(3) Goods once sold will not be accepted back.", 40, termsBoxY + 60, { size: 7 })

    drawText(
      "(4) Interest @24% p.a. will be charged if invoice is not paid on or before due date.",
      40,
      termsBoxY + 75,
      { size: 7 },
    )

    drawText("(5) Subject to Surat Jurisdiction.", 40, termsBoxY + 90, { size: 7 })

    // FIXED: Added payment terms inside the box
    const dueDate =
      invoice.dueDate ||
      (() => {
        const date = new Date(invoice.createdAt)
        date.setDate(date.getDate() + 10)
        return date
      })()

    drawText(`Payment Within 10 Days. Due On: ${new Date(dueDate).toLocaleDateString("en-IN")}`, 40, termsBoxY + 105, {
      size: 8,
      bold: true,
    })

    // Signature section - aligned to right side
    drawText(`For ${COMPANY_DETAILS.name}`, width - 80, termsBoxY + 40, { 
      size: 8, 
      bold: true,
      align: "center" 
    })
    drawText("Authorised Signatory", width - 80, termsBoxY + 100, { 
      size: 8,
      align: "center" 
    })

    // Serialize the PDF
    const pdfBytes = await pdfDoc.save()

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}

// Helper function to convert number to words
function numberToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  function convertLessThanThousand(n: number): string {
    if (n === 0) return ""

    let result = ""

    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred "
      n %= 100
    }

    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " "
      n %= 10
    } else if (n >= 10) {
      result += teens[n - 10] + " "
      return result
    }

    if (n > 0) {
      result += ones[n] + " "
    }

    return result
  }

  if (num === 0) return "Zero Rupees Only"

  const inr = Math.floor(num)
  const paise = Math.round((num % 1) * 100)

  let result = ""

  if (inr > 0) {
    const crores = Math.floor(inr / 10000000)
    const lakhs = Math.floor((inr % 10000000) / 100000)
    const thousands = Math.floor((inr % 100000) / 1000)
    const remaining = inr % 1000

    if (crores > 0) result += convertLessThanThousand(crores) + "Crore "
    if (lakhs > 0) result += convertLessThanThousand(lakhs) + "Lakh "
    if (thousands > 0) result += convertLessThanThousand(thousands) + "Thousand "
    if (remaining > 0) result += convertLessThanThousand(remaining)

    result += "Rupees "
  }

  if (paise > 0) {
    result += "and " + convertLessThanThousand(paise) + "Paise "
  }

  return result + "Only"
}