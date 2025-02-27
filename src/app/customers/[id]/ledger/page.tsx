"use client"

import { useEffect, useState } from "react"
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material"
import { Download } from "@mui/icons-material"
import { useParams } from "next/navigation"
import React from "react"
import type { Customer, Invoice } from "@/app/types"

interface LedgerSummary {
  totalInvoices: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
}

export default function CustomerLedger() {
  const params = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [transactions, setTransactions] = useState<Invoice[]>([])
  const [summary, setSummary] = useState<LedgerSummary>({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  })
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCustomerData()
    fetchLedgerData()
  }, []) // Initial load

  const fetchCustomerData = async () => {
    try {
      const res = await fetch(`/api/customers/${params.id}`)
      if (!res.ok) throw new Error("Failed to fetch customer details")
      const data = await res.json()
      setCustomer(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customer details")
    }
  }

  const fetchLedgerData = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (startDate) queryParams.append("startDate", startDate)
      if (endDate) queryParams.append("endDate", endDate)

      const res = await fetch(`/api/customers/${params.id}/ledger?${queryParams}`)
      if (!res.ok) throw new Error("Failed to fetch ledger data")

      const data = await res.json()
      setTransactions(data.transactions)
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ledger data")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (startDate) queryParams.append("startDate", startDate)
      if (endDate) queryParams.append("endDate", endDate)

      const res = await fetch(`/api/customers/${params.id}/ledger/download?${queryParams}`)
      if (!res.ok) throw new Error("Failed to download ledger")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `ledger-${customer?.name}-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download ledger")
    }
  }

  if (!customer && loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customer Ledger
        </Typography>
        {customer && (
          <Typography variant="h6" color="text.secondary">
            {customer.name} - {customer.companyName}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Invoices
                  </Typography>
                  <Typography variant="h5">{summary.totalInvoices}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Amount
                  </Typography>
                  <Typography variant="h5">${summary.totalAmount.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Paid Amount
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    ${summary.paidAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Pending Amount
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    ${summary.pendingAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={fetchLedgerData}
                    disabled={loading}
                    sx={{
                      bgcolor: "black",
                      "&:hover": {
                        bgcolor: "#333",
                      },
                    }}
                  >
                    Apply Filter
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleDownload}
                    disabled={loading}
                  >
                    Download
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Transactions Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            {loading && <CircularProgress />}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Invoice Number</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.invoiceNumber}</TableCell>
                    <TableCell>{transaction.items.length} items</TableCell>
                    <TableCell align="right">${transaction.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          color:
                            transaction.status === "paid"
                              ? "success.main"
                              : transaction.status === "pending"
                                ? "warning.main"
                                : "error.main",
                        }}
                      >
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  )
}

