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
} from "@mui/material"
import { Delete, Edit } from "@mui/icons-material"
import { type Customer, deleteCustomer } from "./actions"
import EditCustomer from "./edit-customer"

export default function CustomersTable({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      await deleteCustomer(id)
      setCustomers(customers.filter((c) => c._id !== id))
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm),
  )

  return (
    <>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search customers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((customer) => (
              <TableRow key={customer._id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  {`${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}`}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => setEditCustomer(customer)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(customer._id as string)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number.parseInt(e.target.value, 10))
            setPage(0)
          }}
        />
      </TableContainer>

      {editCustomer && (
        <EditCustomer
          customer={editCustomer}
          onClose={() => setEditCustomer(null)}
          onUpdate={(updatedCustomer) => {
            setCustomers(customers.map((c) => (c._id === updatedCustomer._id ? updatedCustomer : c)))
            setEditCustomer(null)
          }}
        />
      )}
    </>
  )
}

