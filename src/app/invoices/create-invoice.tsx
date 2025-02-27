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
} from "@mui/material"
import { Add, Delete } from "@mui/icons-material"
import type { Product } from "../types"
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
  price: number
  taxPercentage: number
  tax: number
  total: number
}

export default function CreateInvoice({ onInvoiceCreated }: CreateInvoiceProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        name: "",
        rollNo: "",
        quantity: 0,
        weight: 0,
        price: 0,
        taxPercentage: 0,
        tax: 0,
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
      quantity: 1,
      weight: product.weight,
    }
    updateItemTotals(newItems, index)
    setItems(newItems)
  }

  const handlePriceChange = (index: number, price: number) => {
    const newItems = [...items]
    newItems[index].price = price
    updateItemTotals(newItems, index)
    setItems(newItems)
  }

  const handleTaxChange = (index: number, taxPercentage: number) => {
    const newItems = [...items]
    newItems[index].taxPercentage = taxPercentage
    updateItemTotals(newItems, index)
    setItems(newItems)
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items]
    newItems[index].quantity = quantity
    updateItemTotals(newItems, index)
    setItems(newItems)
  }

  const updateItemTotals = (items: InvoiceItem[], index: number) => {
    const item = items[index]
    const baseAmount = item.price * item.quantity
    const taxAmount = (baseAmount * item.taxPercentage) / 100
    item.tax = taxAmount
    item.total = baseAmount + taxAmount
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateTotalTax = () => {
    return items.reduce((sum, item) => sum + item.tax, 0)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
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
          customerName: selectedCustomer.name,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            rollNo: item.rollNo,
            quantity: item.quantity,
            weight: item.weight,
            price: item.price,
            tax: item.tax,
            taxPercentage: item.taxPercentage,
            total: item.total,
          })),
          subtotal: calculateSubtotal(),
          tax: calculateTotalTax(),
          total: calculateTotal(),
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <CustomerSearch onSelect={setSelectedCustomer} label="Select Customer" />
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
                    <TableCell>Product</TableCell>
                    <TableCell>Roll No</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="center">Weight (kg)</TableCell>
                    <TableCell align="center">Price (₹)</TableCell>
                    <TableCell align="center">Tax (%)</TableCell>
                    <TableCell align="right">Total (₹)</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell width="30%">
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
                      <TableCell align="center">{item.weight}</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={item.price}
                          onChange={(e) => handlePriceChange(index, Number(e.target.value))}
                          inputProps={{ min: 0, step: "0.01", style: { textAlign: "center" } }}
                          sx={{ width: "100px" }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={item.taxPercentage}
                          onChange={(e) => handleTaxChange(index, Number(e.target.value))}
                          inputProps={{ min: 0, max: 100, step: "0.1", style: { textAlign: "center" } }}
                          sx={{ width: "80px" }}
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
                  Subtotal: ₹{calculateSubtotal().toFixed(2)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Total Tax: ₹{calculateTotalTax().toFixed(2)}
                </Typography>
                <Typography variant="h6">Total: ₹{calculateTotal().toFixed(2)}</Typography>
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

