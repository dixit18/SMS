"use client"

import { useState, useEffect } from "react"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Autocomplete,
  Typography,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material"
import { Add, Delete } from "@mui/icons-material"
import type { Product } from "../products/page"

interface CreateInvoiceProps {
  onInvoiceCreated: () => void
}

type Customer = {
  _id: string
  name: string
  email: string
  gstNumber: string
}

type InvoiceItem = {
  productId: string
  name: string
  quantity: number
  price: number
  total: number
  saleType: "dimension" | "weight"
  saleDetails: {
    length?: number
    width?: number
    height?: number
    weight?: number
  }
}

export default function CreateInvoice({ onInvoiceCreated }: CreateInvoiceProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, productsRes] = await Promise.all([
          fetch("/api/customers").then((res) => res.json()),
          fetch("/api/products").then((res) => res.json()),
        ])
        setCustomers(customersRes)
        setProducts(productsRes)
      } catch (err) {
        setError("Failed to load data")
      }
    }

    if (open) {
      fetchData()
    }
  }, [open])

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        name: "",
        quantity: 1,
        price: 0,
        total: 0,
        saleType: "dimension",
        saleDetails: {},
      },
    ])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    const item = newItems[index]

    if (field === "productId") {
      const product = products.find((p) => p._id === value)
      if (product) {
        item.productId = product._id
        item.name = product.name
        item.price = product.price
      }
    } else if (field === "saleType") {
      item.saleType = value
      item.saleDetails = {}
    } else if (field.startsWith("saleDetails.")) {
      const detailField = field.split(".")[1]
      item.saleDetails = {
        ...item.saleDetails,
        [detailField]: value,
      }
    }

    // Calculate total based on sale type
    if (item.saleType === "dimension" && item.saleDetails.length && item.saleDetails.width && item.saleDetails.height) {
      const volume = item.saleDetails.length * item.saleDetails.width * item.saleDetails.height
      item.total = volume * item.price
    } else if (item.saleType === "weight" && item.saleDetails.weight) {
      item.total = item.saleDetails.weight * item.price
    }

    setItems(newItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      setError("Please select a customer")
      return
    }

    if (items.length === 0) {
      setError("Please add at least one item")
      return
    }

    setLoading(true)
    setError("")

    const { subtotal, tax, total } = calculateTotals()

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer._id,
          customerName: selectedCustomer.name,
          items,
          subtotal,
          tax,
          total,
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
              <Autocomplete
                options={customers}
                getOptionLabel={(customer) => `${customer.name} (${customer.gstNumber})`}
                value={selectedCustomer}
                onChange={(_, newValue) => setSelectedCustomer(newValue)}
                renderInput={(params) => <TextField {...params} required label="Select Customer" variant="outlined" />}
              />
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
                    <TableCell>Sale Type</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Autocomplete
                          options={products}
                          getOptionLabel={(product) => `${product.name} (${product.rollNo})`}
                          value={products.find((p) => p._id === item.productId) || null}
                          onChange={(_, newValue) => handleItemChange(index, "productId", newValue ? newValue._id : "")}
                          renderInput={(params) => <TextField {...params} required size="small" />}
                          sx={{ width: 200 }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl>
                          <RadioGroup
                            row
                            value={item.saleType}
                            onChange={(e) => handleItemChange(index, "saleType", e.target.value)}
                          >
                            <FormControlLabel value="dimension" control={<Radio size="small" />} label="Dimension" />
                            <FormControlLabel value="weight" control={<Radio size="small" />} label="Weight" />
                          </RadioGroup>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {item.saleType === "dimension" ? (
                          <Grid container spacing={1}>
                            <Grid item xs={4}>
                              <TextField
                                size="small"
                                type="number"
                                label="L"
                                value={item.saleDetails.length || ""}
                                onChange={(e) => handleItemChange(index, "saleDetails.length", Number(e.target.value))}
                                inputProps={{ step: 0.01 }}
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                size="small"
                                type="number"
                                label="W"
                                value={item.saleDetails.width || ""}
                                onChange={(e) => handleItemChange(index, "saleDetails.width", Number(e.target.value))}
                                inputProps={{ step: 0.01 }}
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                size="small"
                                type="number"
                                label="H"
                                value={item.saleDetails.height || ""}
                                onChange={(e) => handleItemChange(index, "saleDetails.height", Number(e.target.value))}
                                inputProps={{ step: 0.01 }}
                              />
                            </Grid>
                          </Grid>
                        ) : (
                          <TextField
                            size="small"
                            type="number"
                            label="Weight (kg)"
                            value={item.saleDetails.weight || ""}
                            onChange={(e) => handleItemChange(index, "saleDetails.weight", Number(e.target.value))}
                            inputProps={{ step: 0.01 }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                      <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleRemoveItem(index)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {items.length > 0 && (
                <Box sx={{ mt: 2, textAlign: "right" }}>
                  <Typography>Subtotal: ${calculateTotals().subtotal.toFixed(2)}</Typography>
                  <Typography>Tax (10%): ${calculateTotals().tax.toFixed(2)}</Typography>
                  <Typography variant="h6">Total: ${calculateTotals().total.toFixed(2)}</Typography>
                </Box>
              )}
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

