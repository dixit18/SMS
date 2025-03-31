"use client"

import { useEffect, useState } from "react"
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Autocomplete,
} from "@mui/material"
import { TrendingUp, Receipt, AttachMoney, Search } from "@mui/icons-material"
import type { Product } from "./types"

interface DashboardStats {
  todaySales: {
    total: number
    count: number
  }
  monthlySales: {
    total: number
    count: number
  }
  productStats: {
    available: number
    sold: number
    totalValue: number
  }
}

interface ProductDetails extends Product {
  salesHistory?: {
    invoiceNumber: string
    customerName: string
    companyName: string
    date: string
    quantity: number
    price: number
  }[]
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState("")

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats")
        if (!res.ok) throw new Error("Failed to fetch dashboard data")
        const data = await res.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      fetchStats()
    }
  }, [mounted])

  // Function to search products
  const searchProducts = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    setSearchError("")

    try {
      const res = await fetch(`/api/products/search-all?q=${encodeURIComponent(term)}`)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to search products")
      }

      const data = await res.json()
      setSearchResults(data.products || [])
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Failed to search products")
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Function to get product details
  const getProductDetails = async (productId: string) => {
    setSearchLoading(true)
    setSearchError("")
    setProductDetails(null)

    try {
      const res = await fetch(`/api/products/${productId}`)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to fetch product details")
      }

      const product = await res.json()

      // If product is sold, fetch sales history
      if (product.status === "sold" && product.invoiceId) {
        try {
          const salesRes = await fetch(`/api/products/${productId}/sales-history`)
          if (salesRes.ok) {
            const salesData = await salesRes.json()
            product.salesHistory = salesData.salesHistory
          }
        } catch (error) {
          console.error("Error fetching sales history:", error)
        }
      }

      setProductDetails(product)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Failed to fetch product details")
    } finally {
      setSearchLoading(false)
    }
  }

  // Debounce search
  useEffect(() => {
    if (!mounted) return

    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchProducts(searchTerm)
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, mounted])

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  if (!stats) return null

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Sales Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AttachMoney sx={{ color: "primary.main", mr: 1 }} />
                <Typography variant="h6">Today's Sales</Typography>
              </Box>
              <Typography variant="h4">₹{stats.todaySales.total.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.todaySales.count} invoices today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUp sx={{ color: "primary.main", mr: 1 }} />
                <Typography variant="h6">Monthly Sales</Typography>
              </Box>
              <Typography variant="h4">₹{stats.monthlySales.total.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.monthlySales.count} invoices this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Receipt sx={{ color: "primary.main", mr: 1 }} />
                <Typography variant="h6">Product Inventory</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Available: {stats.productStats?.available || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sold: {stats.productStats?.sold || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Search */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6" gutterBottom>
              Product Search
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Autocomplete
                fullWidth
                freeSolo
                options={searchResults}
                getOptionLabel={(option) =>
                  typeof option === "string"
                    ? option
                    : `${option.name} (${option.rollNo}) - ${option.size} - ${option.gsm} GSM`
                }
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Roll No: {option.rollNo} | GSM: {option.gsm} | Status: {option.status}
                      </Typography>
                    </Box>
                  </li>
                )}
                loading={searchLoading}
                onInputChange={(_, value) => setSearchTerm(value)}
                onChange={(_, value) => {
                  if (value && typeof value !== "string") {
                    getProductDetails(value._id)
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search by product name, roll number, or reel number"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {searchLoading ? <CircularProgress color="inherit" size={20} /> : <Search />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            {searchError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {searchError}
              </Alert>
            )}

            {/* Product Details */}
            {searchLoading && !productDetails && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {productDetails && (
              <Box sx={{ mt: 2 }}>
                <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h5">{productDetails.name}</Typography>
                    <Chip
                      label={productDetails.status === "available" ? "Available" : "Sold"}
                      color={productDetails.status === "available" ? "success" : "default"}
                    />
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Product Details
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Roll No:
                          </Typography>
                          <Typography variant="body2">{productDetails.rollNo}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Reel No:
                          </Typography>
                          <Typography variant="body2">{productDetails.reelNo}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            GSM:
                          </Typography>
                          <Typography variant="body2">{productDetails.gsm}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Size:
                          </Typography>
                          <Typography variant="body2">{productDetails.size}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Category:
                          </Typography>
                          <Typography variant="body2">{productDetails.category}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Diameter:
                          </Typography>
                          <Typography variant="body2">{productDetails.diameter}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Inventory Details
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Weight:
                          </Typography>
                          <Typography variant="body2">{productDetails.weight} kg</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Quantity:
                          </Typography>
                          <Typography variant="body2">
                            {productDetails.quantity} {productDetails.unit}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Status:
                          </Typography>
                          <Typography variant="body2">{productDetails.status}</Typography>
                        </Box>
                        {productDetails.status === "sold" && (
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                              Sold Date:
                            </Typography>
                            <Typography variant="body2">
                              {new Date(productDetails.soldAt || "").toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Created Date:
                          </Typography>
                          <Typography variant="body2">
                            {new Date(productDetails.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {productDetails.description || "No description available"}
                      </Typography>
                    </Grid>
                  </Grid>

                  {productDetails.status === "sold" &&
                    productDetails.salesHistory &&
                    productDetails.salesHistory.length > 0 && (
                      <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" gutterBottom>
                          Sales History
                        </Typography>
                        <Grid container spacing={2}>
                          {productDetails.salesHistory.map((sale, index) => (
                            <Grid item xs={12} key={index}>
                              <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                  <Typography variant="subtitle1">Invoice: {sale.invoiceNumber}</Typography>
                                  <Typography variant="body2">{new Date(sale.date).toLocaleDateString()}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                  <Typography variant="body2">Customer: {sale.customerName}</Typography>
                                  <Typography variant="body2">Company: {sale.companyName}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                  <Typography variant="body2">Quantity: {sale.quantity}</Typography>
                                  <Typography variant="body2">Price: ₹{sale.price.toFixed(2)}</Typography>
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </>
                    )}
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

