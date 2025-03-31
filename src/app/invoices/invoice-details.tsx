"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Alert,
  Paper,
} from "@mui/material"
import type { Invoice } from "../types"

interface InvoiceDetailsProps {
  invoice: any
  onClose: () => void
  onStatusChange: () => void
}

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

export default function InvoiceDetails({ invoice, onClose, onStatusChange }: InvoiceDetailsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/invoices/${invoice._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update status")
      }

      onStatusChange()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setLoading(false)
    }
  }

  const customer = typeof invoice.customerId === "object" ? invoice.customerId : null

  // Format dates only after component has mounted to avoid hydration errors
  const formatDate = (date: string | Date | undefined) => {
    if (!mounted) return "" // Return empty string during server rendering
    if (!date) return ""
    return new Date(date).toLocaleDateString("en-IN")
  }

  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Tax Invoice</Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, maxWidth: "210mm", margin: "0 auto" }}>
          <Box sx={{ textAlign: "center", mb: 1 }}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              :: OM NAMAH SHIVAY ::
            </Typography>
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              TAX INVOICE
            </Typography>
            <Typography variant="subtitle1">(ORIGINAL / DUPLICATE)</Typography>
          </Box>

          <Box sx={{ border: "1px solid #000", p: 2, mb: 2 }}>
            <Typography variant="h5" gutterBottom align="center">
              {COMPANY_DETAILS.name}
            </Typography>
          </Box>

          <Box sx={{ border: "1px solid #000", p: 2, mb: 2 }}>
            <Typography variant="body2">Company Address :-</Typography>
            <Typography variant="body2">{COMPANY_DETAILS.address}</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Phone: {COMPANY_DETAILS.phone} (M): {COMPANY_DETAILS.mobile}
              </Typography>
              <Typography variant="body2">E-mail: {COMPANY_DETAILS.email}</Typography>
            </Box>
            <Typography variant="body2">
              Company's GST IN: {COMPANY_DETAILS.gst} Company's PAN: {COMPANY_DETAILS.pan}
            </Typography>
          </Box>

          <Grid container spacing={0} sx={{ border: "1px solid #000", mb: 2 }}>
            <Grid item xs={6} sx={{ p: 2, borderRight: "1px solid #000" }}>
              <Typography variant="body2" gutterBottom>
                Details of Consignee (Bill to)
              </Typography>
              <Typography variant="body1" gutterBottom>
                {customer?.companyName || invoice.customerName}
              </Typography>
              <Typography variant="body2">{customer?.address?.street}</Typography>
              <Typography variant="body2">{customer?.address?.city}</Typography>
              <Typography variant="body2">{customer?.address?.state}</Typography>
              <Typography variant="body2">State: {customer?.address?.state}</Typography>
              <Typography variant="body2">Phone: {customer?.phone}</Typography>
              <Typography variant="body2">GSTIN: {customer?.gstNumber}</Typography>
              <Typography variant="body2">PAN No.: {customer?.gstNumber?.substring(2, 12)}</Typography>
            </Grid>
            <Grid item xs={6} sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Invoice No.</Typography>
                <Typography variant="body2">{invoice.invoiceNumber}</Typography>
                <Typography variant="body2">Dt. : {formatDate(invoice.invoiceDate || invoice.createdAt)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Challan No.</Typography>
                <Typography variant="body2">{invoice.challanNo || ""}</Typography>
                <Typography variant="body2">Dt. : {formatDate(invoice.challanDate)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">P.O. No.</Typography>
                <Typography variant="body2">{invoice.poNo || ""}</Typography>
                <Typography variant="body2">Dt. : {formatDate(invoice.poDate)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Vehicle No.</Typography>
                <Typography variant="body2">{invoice.vehicleNo || ""}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Transport</Typography>
                <Typography variant="body2">{invoice.transportName || ""}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">L.R. No.</Typography>
                <Typography variant="body2">{invoice.lrNo || ""}</Typography>
                <Typography variant="body2">Dt. : {formatDate(invoice.lrDate)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">EWay Bill No.</Typography>
                <Typography variant="body2">{invoice.ewayBillNo || ""}</Typography>
                <Typography variant="body2">Dt. : {formatDate(invoice.ewayBillDate)}</Typography>
              </Box>
            </Grid>
          </Grid>

          <Table size="small" sx={{ border: "1px solid #000", mb: 2 }}>
            <TableHead>
              <TableRow sx={{ borderBottom: "1px solid #000" }}>
                <TableCell sx={{ borderRight: "1px solid #000", width: "5%" }}>Sr. No.</TableCell>
                <TableCell sx={{ borderRight: "1px solid #000", width: "35%" }}>Product Description</TableCell>
                <TableCell sx={{ borderRight: "1px solid #000", width: "10%" }}>Roll No</TableCell>
                <TableCell sx={{ borderRight: "1px solid #000", width: "8%" }} align="center">
                  Qty
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #000", width: "10%" }} align="center">
                  Rate
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #000", width: "8%" }} align="center">
                  SGST (%)
                </TableCell>
                <TableCell sx={{ borderRight: "1px solid #000", width: "8%" }} align="center">
                  CGST (%)
                </TableCell>
                <TableCell sx={{ width: "16%" }} align="right">
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item:any, index:any) => (
                <TableRow
                  key={index}
                  sx={{ borderBottom: index === invoice.items.length - 1 ? "none" : "1px solid #000" }}
                >
                  <TableCell sx={{ borderRight: "1px solid #000" }}>{index + 1}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #000" }}>{item.name}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #000" }}>{item.rollNo}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #000" }} align="center">
                    {item.quantity}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #000" }} align="center">
                    ₹{item.rate?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #000" }} align="center">
                    {item.sgstPercentage?.toFixed(2) || "6.00"}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #000" }} align="center">
                    {item.cgstPercentage?.toFixed(2) || "6.00"}
                  </TableCell>
                  <TableCell align="right">₹{item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}

              {/* Add empty rows for handwritten notes */}
              {[...Array(Math.max(0, 10 - invoice.items.length))].map((_, index) => (
                <TableRow key={`empty-${index}`} sx={{ height: "30px" }}>
                  <TableCell sx={{ borderRight: "1px solid #000" }}></TableCell>
                  <TableCell sx={{ borderRight: "1px solid #000" }}></TableCell>
                  <TableCell sx={{ borderRight: "1px solid #000" }}></TableCell>
                  <TableCell sx={{ borderRight: "1px solid #000" }}></TableCell>
                  <TableCell sx={{ borderRight: "1px solid #000" }}></TableCell>
                  <TableCell sx={{ borderRight: "1px solid #000" }}></TableCell>
                  <TableCell sx={{ borderRight: "1px solid #000" }}></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box sx={{ border: "1px solid #000", p: 2, mb: 2 }}>
            <Grid container>
              <Grid item xs={8}>
                {/* Removed payment terms from here */}
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">
                  Total Qty: {invoice.items.reduce((sum: any, item:any) => sum + item.quantity, 0)}
                </Typography>
                <Typography variant="body2">Sub Total: ₹{invoice.subtotal.toFixed(2)}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ border: "1px solid #000", p: 2, mb: 2 }}>
            <Grid container>
              <Grid item xs={8}>
                <Typography variant="body2">NOTE:</Typography>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">CGST @ {invoice.items[0]?.cgstPercentage || 6}%</Typography>
                  <Typography variant="body2">
                    ₹{invoice.cgstTotal?.toFixed(2) || (invoice.tax / 2).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">SGST @ {invoice.items[0]?.sgstPercentage || 6}%</Typography>
                  <Typography variant="body2">
                    ₹{invoice.sgstTotal?.toFixed(2) || (invoice.tax / 2).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Round Off</Typography>
                  <Typography variant="body2">₹{invoice.roundOff?.toFixed(2) || "0.00"}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                  <Typography variant="body1" fontWeight="bold">
                    NET AMOUNT
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ₹{invoice.total.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ border: "1px solid #000", p: 2, mb: 2 }}>
            <Typography variant="body2">[In words] : {numberToWords(invoice.total)} Only.</Typography>
          </Box>

          <Box sx={{ border: "1px solid #000", p: 2, mb: 2 }}>
            <Typography variant="body2">Bank Details:</Typography>
            <Typography variant="body2">
              {COMPANY_DETAILS.bankName1} BRANCH: {COMPANY_DETAILS.branch1} A/c No. {COMPANY_DETAILS.accountNo1} IFSC
              CODE: {COMPANY_DETAILS.ifscCode1}
            </Typography>
            <Typography variant="body2">
              {COMPANY_DETAILS.bankName2} A/C NO: {COMPANY_DETAILS.accountNo2} BRANCH: {COMPANY_DETAILS.branch2} IFSC
              CODE: {COMPANY_DETAILS.ifscCode2}
            </Typography>
          </Box>

          <Box sx={{ border: "1px solid #000", p: 2 }}>
            <Grid container>
              <Grid item xs={8}>
                <Typography variant="body2" gutterBottom>
                  Terms & Conditions:
                </Typography>
                <Typography variant="body2">
                  (1) We do not hold responsible for any breakage/demage/shortage/leakage in transit.
                </Typography>
                <Typography variant="body2">
                  (2) Our responsibility ceases when the goods are delivered to the carrier.
                </Typography>
                <Typography variant="body2">(3) Goods once sold will not be accepted back.</Typography>
                <Typography variant="body2">
                  (4) Interest @24% p.a. will be charged if invoice is not paid on or before due date.
                </Typography>
                <Typography variant="body2">(5) Subject to Surat Jurisdiction.</Typography>
                {/* Added payment terms here - only render after mount to avoid hydration errors */}
                {mounted && (
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: "medium" }}>
                    Payment Within 10 Days. Due On:{" "}
                    {formatDate(
                      invoice.dueDate ||
                        (() => {
                          const date = new Date(invoice.createdAt)
                          date.setDate(date.getDate() + 10)
                          return date
                        })(),
                    )}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={4} sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Typography variant="body2" align="center">
                  For {COMPANY_DETAILS.name}
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 8 }}>
                  Authorised Signatory
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {invoice.status === "pending" && (
          <>
            <Button onClick={() => handleStatusChange("cancelled")} color="error" disabled={loading}>
              Cancel Invoice
            </Button>
            <Button
              onClick={() => handleStatusChange("paid")}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: "black",
                "&:hover": {
                  bgcolor: "#333",
                },
              }}
            >
              Mark as Paid
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
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

