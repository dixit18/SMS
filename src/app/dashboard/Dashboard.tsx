"use client"

import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Alert,
  Autocomplete,
} from "@mui/material"
import { Add } from "@mui/icons-material"
import type { Product } from "../products/actions"
import type { Customer } from "../customers/actions"

export default function QuickSale() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [saleType, setSaleType] = useState<"dimension" | "weight">("dimension")
  const [saleDetails, setSaleDetails] = useState({
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
  })

  // Fetch customers and products when dialog opens
  const handleOpen = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        fetch("/api/customers").then((res) => res.json()),
        fetch("/api/products").then((res) => res.json()),
      ])
      setCustomers(customersRes)
      setProducts(productsRes)
      setOpen(true)
    } catch (err) {
      setError("Failed to load data")
    }
  }

  const calculateTotal = () => {
    if (!selectedProduct) return 0

    if (saleType === "dimension") {
      const volume = saleDetails.length * saleDetails.width * saleDetails.height
      return volume * selectedProduct.price
    } else {
      return saleDetails.weight * selectedProduct.price
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCustomer || !selectedProduct) {
      setError("Please select customer and product")
      return
    }

    setLoading(true)
    setError("")

    const total = calculateTotal()

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer._id,
          customerName: selectedCustomer.name,
          items: [
            {
              productId: selectedProduct._id,
              name: selectedProduct.name,
              quantity: 1,
              price: selectedProduct.price,
              total,
              saleType,
              saleDetails:
                saleType === "dimension"
                  ? { length: saleDetails.length, width: saleDetails.width, height: saleDetails.height }
                  : { weight: saleDetails.weight },
            },
          ],
          subtotal: total,
          tax: total * 0.1,
          total: total * 1.1,
          status: "paid",
          paymentMethod: "cash",
        }),
      })

      if (!res.ok) throw new Error("Failed to create sale")

      setOpen(false)
      setSelectedCustomer(null)
      setSelectedProduct(null)
      setSaleDetails({ length: 0, width: 0, height: 0, weight: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleOpen}
        sx={{
          bgcolor: "black",
          "&:hover": {
            bgcolor: "#333",
          },
        }}
      >
        Quick Sale
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
              Quick Sale
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(customer) => customer.name}
                  value={selectedCustomer}
                  onChange={(_, newValue) => setSelectedCustomer(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} required label="Select Customer" variant="outlined" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(product) => `${product.name} (${product.rollNo})`}
                  value={selectedProduct}
                  onChange={(_, newValue) => setSelectedProduct(newValue)}
                  renderInput={(params) => <TextField {...params} required label="Select Product" variant="outlined" />}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Sale Type</FormLabel>
                  <RadioGroup
                    row
                    value={saleType}
                    onChange={(e) => setSaleType(e.target.value as "dimension" | "weight")}
                  >
                    <FormControlLabel value="dimension" control={<Radio />} label="By Dimension" />
                    <FormControlLabel value="weight" control={<Radio />} label="By Weight" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {saleType === "dimension" ? (
                <>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      required
                      fullWidth
                      label="Length"
                      type="number"
                      value={saleDetails.length}
                      onChange={(e) =>
                        setSaleDetails({
                          ...saleDetails,
                          length: Number(e.target.value),
                        })
                      }
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      required
                      fullWidth
                      label="Width"
                      type="number"
                      value={saleDetails.width}
                      onChange={(e) =>
                        setSaleDetails({
                          ...saleDetails,
                          width: Number(e.target.value),
                        })
                      }
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      required
                      fullWidth
                      label="Height"
                      type="number"
                      value={saleDetails.height}
                      onChange={(e) =>
                        setSaleDetails({
                          ...saleDetails,
                          height: Number(e.target.value),
                        })
                      }
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                </>
              ) : (
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Weight (kg)"
                    type="number"
                    value={saleDetails.weight}
                    onChange={(e) =>
                      setSaleDetails({
                        ...saleDetails,
                        weight: Number(e.target.value),
                      })
                    }
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ textAlign: "right", mt: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Amount:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Button onClick={() => setOpen(false)} sx={{ color: "text.secondary" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: "black",
                "&:hover": {
                  bgcolor: "#333",
                },
              }}
            >
              Complete Sale
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

