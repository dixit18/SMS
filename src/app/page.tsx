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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
} from "@mui/material"
import { TrendingUp, Receipt, AttachMoney } from "@mui/icons-material"
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
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

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

    fetchStats()
  }, [])

  const searchProduct = async (term: string) => {
    if (!term) {
      setProductDetails(null)
      return
    }

    setSearchLoading(true)
    try {
      const res = await fetch(`/api/products/search/details?q=${encodeURIComponent(term)}`)
      if (!res.ok) throw new Error("Failed to fetch product details")
      const data = await res.json()
      setProductDetails(data.product)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search product")
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProduct(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm]) // Removed searchProduct from dependencies

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
                <Typography variant="h6">Product Search</Typography>
              </Box>
              <TextField
                fullWidth
                placeholder="Search by product name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Product Details */}
        {searchLoading && (
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          </Grid>
        )}

        {productDetails && !searchLoading && (
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" gutterBottom>
                Product Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: "bold" }}>
                            Name
                          </TableCell>
                          <TableCell>{productDetails.name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: "bold" }}>
                            Roll No
                          </TableCell>
                          <TableCell>{productDetails.rollNo}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: "bold" }}>
                            Reel No
                          </TableCell>
                          <TableCell>{productDetails.reelNo}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: "bold" }}>
                            GSM
                          </TableCell>
                          <TableCell>{productDetails.gsm}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: "bold" }}>
                            Weight
                          </TableCell>
                          <TableCell>{productDetails.weight} kg</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: "bold" }}>
                            Status
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={productDetails.status}
                              color={productDetails.status === "available" ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: "bold" }}>
                            Category
                          </TableCell>
                          <TableCell>{productDetails.category}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: "bold" }}>
                            Size
                          </TableCell>
                          <TableCell>{productDetails.size}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: "bold" }}>
                            Quantity
                          </TableCell>
                          <TableCell>
                            {productDetails.quantity} {productDetails.unit}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: "bold" }}>
                            Created Date
                          </TableCell>
                          <TableCell>{new Date(productDetails.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>

              {productDetails.status === "sold" && productDetails.salesHistory && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Sales History
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Invoice Number</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Company</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productDetails.salesHistory.map((sale, index) => (
                          <TableRow key={index}>
                            <TableCell>{sale.invoiceNumber}</TableCell>
                            <TableCell>{sale.customerName}</TableCell>
                            <TableCell>{sale.companyName}</TableCell>
                            <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                            <TableCell align="right">{sale.quantity}</TableCell>
                            <TableCell align="right">₹{sale.price.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  )
}

