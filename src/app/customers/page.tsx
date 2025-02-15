"use client"

import { useEffect, useState, useCallback } from "react"
import { Box, Container, Typography, CircularProgress, Alert } from "@mui/material"
import AddCustomer from "./add-customer"
import CustomersTable from "./customers-table"
import type { Customer,  } from "../types"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      })

      const res = await fetch(`/api/customers?${queryParams}`)
      if (!res.ok) throw new Error("Failed to fetch customers")

      const data = await res.json()
      setCustomers(data.customers)
      setTotal(data.pagination.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers")
    } finally {
      setLoading(false)
    }
  }, [page, limit, search])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  if (loading && !customers.length) {
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
          Customers
        </Typography>
        <AddCustomer onCustomerAdded={fetchCustomers} />
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <CustomersTable
        customers={customers}
        loading={loading}
        page={page}
        limit={limit}
        total={total}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onCustomersChange={fetchCustomers}
      />
    </Container>
  )
}

