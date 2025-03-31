"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
  Chip,
  IconButton,
  Alert,
  Tooltip,
  LinearProgress,
} from "@mui/material"
import { Visibility, Download } from "@mui/icons-material"
import type { Invoice } from "../types"
import InvoiceDetails from "./invoice-details"
import { debounce } from "lodash"

interface InvoiceListProps {
  invoices: any[]
  loading: boolean
  page: number
  limit: number
  total: number
  search: string
  onSearchChange: (search: string) => void
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onInvoicesChange: () => void
}

export default function InvoiceList({
  invoices,
  loading,
  page,
  limit,
  total,
  search,
  onSearchChange,
  onPageChange,
  onLimitChange,
  onInvoicesChange,
}: InvoiceListProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success"
      case "pending":
        return "warning"
      case "cancelled":
        return "error"
      default:
        return "default"
    }
  }

  const handleDownload = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/download`)
      if (!res.ok) throw new Error("Failed to download invoice")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download invoice")
    }
  }

  const debouncedSearch = debounce((value: string) => {
    onSearchChange(value)
  }, 300)

  // Format date safely to avoid hydration errors
  const formatDate = (date: string | Date) => {
    if (!mounted) return "" // Return empty string during server rendering
    return new Date(date).toLocaleDateString()
  }

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search invoices..."
        defaultValue={search}
        onChange={(e) => debouncedSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.customerId?.name}</TableCell>
                <TableCell>{typeof invoice.customerId === "object" && invoice.customerId.companyName}</TableCell>
                <TableCell>
                  {mounted ? (
                    <Tooltip title={new Date(invoice.createdAt).toLocaleString()}>
                      <span>{formatDate(invoice.createdAt)}</span>
                    </Tooltip>
                  ) : (
                    <span>Loading...</span>
                  )}
                </TableCell>
                <TableCell>${invoice.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    color={getStatusColor(invoice.status) as "success" | "warning" | "error" | "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => setSelectedInvoice(invoice)}>
                    <Visibility />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDownload(invoice._id)}>
                    <Download />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onPageChange={(_, newPage) => onPageChange(newPage + 1)}
          onRowsPerPageChange={(e) => {
            onLimitChange(Number.parseInt(e.target.value, 10))
            onPageChange(1)
          }}
        />
      </TableContainer>

      {selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onStatusChange={onInvoicesChange}
        />
      )}
    </>
  )
}

