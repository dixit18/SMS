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
  Chip,
  TextField,
  TablePagination,
  Alert,
  Tooltip,
  LinearProgress,
} from "@mui/material"
import { Delete, Edit } from "@mui/icons-material"
import type { Product } from "../types"
import EditProduct from "./edit-product"
import { debounce } from "lodash"

interface ProductsTableProps {
  products: Product[]
  loading: boolean
  page: number
  limit: number
  total: number
  search: string
  onSearchChange: (search: string) => void
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onProductsChange: () => void
}

export default function ProductsTable({
  products,
  loading,
  page,
  limit,
  total,
  search,
  onSearchChange,
  onPageChange,
  onLimitChange,
  onProductsChange,
}: ProductsTableProps) {
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [error, setError] = useState("")

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to delete product")
      }

      onProductsChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product")
    }
  }

  const debouncedSearch = debounce((value: string) => {
    onSearchChange(value)
  }, 300)
  console.log("<<<products",products)

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
        placeholder="Search products..."
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
              <TableCell>Roll No</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Dimensions (L×W×H)</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.rollNo}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  {`${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height}`}
                </TableCell>
                <TableCell>{product.weight} kg</TableCell>
                <TableCell>
                  <Chip
                    label={`${product.quantity} ${product.unit}`}
                    color={product.quantity > 0 ? "success" : "error"}
                  />
                </TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Tooltip title={new Date(product.createdAt).toLocaleString()}>
                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => setEditProduct(product)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(product._id)}>
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

      {editProduct && (
        <EditProduct
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onUpdate={() => {
            setEditProduct(null)
            onProductsChange()
          }}
        />
      )}
    </>
  )
}

