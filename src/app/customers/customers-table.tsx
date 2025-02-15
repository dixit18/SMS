"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  TablePagination,
  Alert,
  Tooltip,
  LinearProgress,
} from "@mui/material"
import { Delete, Edit } from "@mui/icons-material"
import type { Customer } from "../types"
import EditCustomer from "./edit-customer"
import { debounce } from "lodash"

interface CustomersTableProps {
  customers: Customer[]
  loading: boolean
  page: number
  limit: number
  total: number
  search: string
  onSearchChange: (search: string) => void
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onCustomersChange: () => void
}

export default function CustomersTable({
  customers,
  loading,
  page,
  limit,
  total,
  search,
  onSearchChange,
  onPageChange,
  onLimitChange,
  onCustomersChange,
}: CustomersTableProps) {
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [error, setError] = useState("")

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to delete customer")
      }

      onCustomersChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer")
    }
  }

  const debouncedSearch = debounce((value: string) => {
    onSearchChange(value)
  }, 300)

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
        placeholder="Search customers..."
        defaultValue={search}
        onChange={(e) => debouncedSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        {loading && <LinearProgress />}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>GST Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer._id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.companyName}</TableCell>
                <TableCell>{customer.gstNumber}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <Tooltip
                    title={`${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}, ${customer.address.country}`}
                  >
                    <span>{`${customer.address.city}, ${customer.address.state}`}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={new Date(customer.createdAt).toLocaleString()}>
                    <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => setEditCustomer(customer)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(customer._id)}>
                    <Delete />
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

      {editCustomer && (
        <EditCustomer
          customer={editCustomer}
          onClose={() => setEditCustomer(null)}
          onUpdate={() => {
            setEditCustomer(null)
            onCustomersChange()
          }}
        />
      )}
    </>
  )
}

