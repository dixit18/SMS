"use client"

import { useEffect, useState, useCallback } from "react"
import { Box, Container, Typography, CircularProgress, Alert } from "@mui/material"
import CreateInvoice from "./create-invoice"
import InvoiceList from "./invoice-list"
import type { Invoice } from "../types"

export default function InvoicesPage() {
  const [mounted, setMounted] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      })

      const res = await fetch(`/api/invoices?${queryParams}`)
      if (!res.ok) throw new Error("Failed to fetch invoices")

      const data = await res.json()
      console.log("<<<data", data)
      setInvoices(data.invoices)
      setTotal(data.pagination.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }, [page, limit, search])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  if (loading && !invoices.length) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1">
          Invoices
        </Typography>
        <CreateInvoice onInvoiceCreated={fetchInvoices} />
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <InvoiceList
        invoices={invoices}
        loading={loading}
        page={page}
        limit={limit}
        total={total}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onInvoicesChange={fetchInvoices}
      />
    </Container>
  )
}

