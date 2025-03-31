"use client"

import { useState } from "react"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  TextField,
  Paper,
} from "@mui/material"
import { Add, Delete } from "@mui/icons-material"
import type { Product, Customer } from "../types"
import ProductSearch from "../components/product-search"
import CustomerSearch from "../components/customer-search"

interface CreateInvoiceProps {
  onInvoiceCreated: () => void
}

type InvoiceItem = {
  productId: string
  name: string
  rollNo: string
  quantity: number
  weight: number
  rate: number
  taxableValue: number
  sgstPercentage: number
  sgstAmount: number
  cgstPercentage: number
  cgstAmount: number
  total: number
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

export default function CreateInvoice({ onInvoiceCreated }: CreateInvoiceProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState<string>(() => {
    const date = new Date()
    date.setDate(date.getDate() + 10)
    return date.toISOString().split("T")[0]
  })
  const [paymentTerms, setPaymentTerms] = useState<number>(10)
  const [vehicleNo, setVehicleNo] = useState<string>("")
  const [transportName, setTransportName] = useState<string>("")
  const [lrNo, setLrNo] = useState<string>("")
  const [lrDate, setLrDate] = useState<string>("")
  const [ewayBillNo, setEwayBillNo] = useState<string>("")
  const [ewayBillDate, setEwayBillDate] = useState<string>("")
  const [poNo, setPoNo] = useState<string>("")
  const [poDate, setPoDate] = useState<string>("")
  const [challanNo, setChallanNo] = useState<string>("")
  const [challanDate, setChallanDate] = useState<string>("")

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        name: "",
        rollNo: "",
        quantity: 0,
        weight: 0,
        rate: 0,
        taxableValue: 0,
        sgstPercentage: 6, // Changed from 9 to 6
        sgstAmount: 0,
        cgstPercentage: 6, // Changed from 9 to 6
        cgstAmount: 0,
        total: 0,
      },
    ])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleProductSelect = (index: number, product: Product | null) => {
    if (!product) return

    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      productId: product._id,
      name: product.name,
      rollNo: product.rollNo,
      weight: product.weight || 0, // Ensure weight is set, default to 0 if not available
      quantity: 1,
      rate: 0,
      taxableValue: 0,
      sgstPercentage: 6, // Changed from 9 to 6
      sgstAmount: 0,
      cgstPercentage: 6, // Changed from 9 to 6
      cgstAmount: 0,
      total: 0,
    }
    setItems(newItems)
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items]
    newItems[index].quantity = quantity
    updateItemTotals(newItems, index)
    setItems(newItems)
  }

  const handleRateChange = (index: number, rate: number) => {
    const newItems = [...items]
    newItems[index].rate = rate
    updateItemTotals(newItems, index)
    setItems(newItems)
  }

  const handleSgstPercentageChange = (index: number, percentage: number) => {
    const newItems = [...items]
    newItems[index].sgstPercentage = percentage
    updateItemTotals(newItems, index)
    setItems(newItems)
  }

  const handleCgstPercentageChange = (index: number, percentage: number) => {
    const newItems = [...items]
    newItems[index].cgstPercentage = percentage
    updateItemTotals(newItems, index)
    setItems(newItems)
  }

  const updateItemTotals = (items: InvoiceItem[], index: number) => {
    const item = items[index]
    item.taxableValue = item.quantity * item.rate
    item.sgstAmount = (item.taxableValue * item.sgstPercentage) / 100
    item.cgstAmount = (item.taxableValue * item.cgstPercentage) / 100
    item.total = item.taxableValue + item.sgstAmount + item.cgstAmount
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.taxableValue, 0)
  }

  const calculateSgstTotal = () => {
    return items.reduce((sum, item) => sum + item.sgstAmount, 0)
  }

  const calculateCgstTotal = () => {
    return items.reduce((sum, item) => sum + item.cgstAmount, 0)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateRoundOff = () => {
    const total = calculateTotal()
    const roundedTotal = Math.round(total)
    return roundedTotal - total
  }

  const calculateFinalTotal = () => {
    return calculateTotal() + calculateRoundOff()
  }

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      setError("Please select a customer")
      return
    }

    if (items.length === 0 || !items.every((item) => item.productId)) {
      setError("Please add at least one valid product")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer._id,
          invoiceDate: new Date(invoiceDate),
          dueDate: new Date(dueDate),
          paymentTerms,
          vehicleNo,
          transportName,
          lrNo,
          lrDate: lrDate ? new Date(lrDate) : null,
          ewayBillNo,
          ewayBillDate: ewayBillDate ? new Date(ewayBillDate) : null,
          poNo,
          poDate: poDate ? new Date(poDate) : null,
          challanNo,
          challanDate: challanDate ? new Date(challanDate) : null,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            rollNo: item.rollNo,
            quantity: item.quantity,
            weight: item.weight || 0, // Ensure weight is included, default to 0 if not available
            rate: item.rate,
            taxableValue: item.taxableValue,
            sgstPercentage: item.sgstPercentage,
            sgstAmount: item.sgstAmount,
            cgstPercentage: item.cgstPercentage,
            cgstAmount: item.cgstAmount,
            total: item.total,
          })),
          subtotal: calculateSubtotal(),
          sgstTotal: calculateSgstTotal(),
          cgstTotal: calculateCgstTotal(),
          total: calculateFinalTotal(),
          roundOff: calculateRoundOff(),
          status: "pending",
          paymentMethod: "cash",
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create invoice")
      }

      onInvoiceCreated()
      setOpen(false)
      setSelectedCustomer(null)
      setItems([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
        sx={{
          bgcolor: "black",
          "&:hover": {
            bgcolor: "#333",
          },
        }}
      >
        Create Invoice
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <CustomerSearch onSelect={setSelectedCustomer} label="Select Customer" />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Invoice Date"
                type="date"
                fullWidth
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {selectedCustomer && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, border: "1px solid #eee", borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Billing To: {selectedCustomer.companyName}
                  </Typography>
                  <Typography variant="body2">GSTIN: {selectedCustomer.gstNumber}</Typography>
                  <Typography variant="body2">
                    {selectedCustomer.address.street}, {selectedCustomer.address.city}
                  </Typography>
                  <Typography variant="body2">
                    {selectedCustomer.address.state}, {selectedCustomer.address.zipCode}
                  </Typography>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Shipping & Transport Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Vehicle No."
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Transport Name"
                      value={transportName}
                      onChange={(e) => setTransportName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth label="L.R. No." value={lrNo} onChange={(e) => setLrNo(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="L.R. Date"
                      type="date"
                      fullWidth
                      value={lrDate}
                      onChange={(e) => setLrDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="E-Way Bill No."
                      value={ewayBillNo}
                      onChange={(e) => setEwayBillNo(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="E-Way Bill Date"
                      type="date"
                      fullWidth
                      value={ewayBillDate}
                      onChange={(e) => setEwayBillDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth label="P.O. No." value={poNo} onChange={(e) => setPoNo(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="P.O. Date"
                      type="date"
                      fullWidth
                      value={poDate}
                      onChange={(e) => setPoDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Challan No."
                      value={challanNo}
                      onChange={(e) => setChallanNo(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Challan Date"
                      type="date"
                      fullWidth
                      value={challanDate}
                      onChange={(e) => setChallanDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Payment Terms (Days)"
                      type="number"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(Number(e.target.value))}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Items</Typography>
                <Button startIcon={<Add />} onClick={handleAddItem}>
                  Add Item
                </Button>
              </Box>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sr.</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Roll No</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="center">Rate</TableCell>
                    <TableCell align="center">Taxable Value</TableCell>
                    <TableCell align="center">SGST %</TableCell>
                    <TableCell align="center">CGST %</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell width="20%">
                        <ProductSearch onSelect={(product) => handleProductSelect(index, product)} />
                      </TableCell>
                      <TableCell>{item.rollNo}</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                          inputProps={{ min: 1, style: { textAlign: "center" } }}
                          sx={{ width: "80px" }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleRateChange(index, Number(e.target.value))}
                          inputProps={{ min: 0, step: "0.01", style: { textAlign: "center" } }}
                          sx={{ width: "100px" }}
                        />
                      </TableCell>
                      <TableCell align="center">₹{item.taxableValue.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={item.sgstPercentage}
                          onChange={(e) => handleSgstPercentageChange(index, Number(e.target.value))}
                          inputProps={{ min: 0, max: 100, step: "0.01", style: { textAlign: "center" } }}
                          sx={{ width: "70px" }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={item.cgstPercentage}
                          onChange={(e) => handleCgstPercentageChange(index, Number(e.target.value))}
                          inputProps={{ min: 0, max: 100, step: "0.01", style: { textAlign: "center" } }}
                          sx={{ width: "70px" }}
                        />
                      </TableCell>
                      <TableCell align="right">₹{item.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleRemoveItem(index)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box sx={{ mt: 2, textAlign: "right" }}>
                <Typography variant="body1" color="text.secondary">
                  Sub Total: ₹{calculateSubtotal().toFixed(2)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  SGST: ₹{calculateSgstTotal().toFixed(2)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  CGST: ₹{calculateCgstTotal().toFixed(2)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Round Off: ₹{calculateRoundOff().toFixed(2)}
                </Typography>
                <Typography variant="h6">Total: ₹{calculateFinalTotal().toFixed(2)}</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "black",
              "&:hover": {
                bgcolor: "#333",
              },
            }}
          >
            Create Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

