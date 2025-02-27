"use client"

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
  Chip,
  Box,
  Alert,
  Divider,
} from "@mui/material"
import type { Invoice } from "../types"
import { useState } from "react"

interface InvoiceDetailsProps {
  invoice: Invoice
  onClose: () => void
  onStatusChange: () => void
}

export default function InvoiceDetails({ invoice, onClose, onStatusChange }: InvoiceDetailsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Invoice Details</Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Invoice Number
            </Typography>
            <Typography variant="body1">{invoice.invoiceNumber}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Date
            </Typography>
            <Typography variant="body1">{new Date(invoice.createdAt).toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Customer
            </Typography>
            <Typography variant="body1">{invoice.customerName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              color={invoice.status === "paid" ? "success" : invoice.status === "pending" ? "warning" : "error"}
              size="small"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Items
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">GST</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    {item.taxPercentage > 0 ? (
                      <>
                        ₹{item.tax.toFixed(2)}
                        <Typography variant="caption" color="text.secondary" display="block">
                          ({item.taxPercentage}%)
                        </Typography>
                      </>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="right">₹{item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: "right" }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Subtotal: ₹{invoice.subtotal.toFixed(2)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            GST: ₹{invoice.tax.toFixed(2)}
          </Typography>
          <Typography variant="h6">Total: ₹{invoice.total.toFixed(2)}</Typography>
        </Box>
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

