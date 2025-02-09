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
} from "@mui/material"
import { Delete, Edit } from "@mui/icons-material"
import { type Product, deleteProduct } from "./actions"
import EditProduct from "./edit-product"

export default function ProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id)
      setProducts(products.filter((p) => p._id !== id))
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Dimensions</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={`${product.quantity} ${product.unit}`}
                    color={product.quantity > 0 ? "success" : "error"}
                  />
                </TableCell>
                <TableCell>
                  {`${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height}`}
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => setEditProduct(product)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(product._id as string)}>
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
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number.parseInt(e.target.value, 10))
            setPage(0)
          }}
        />
      </TableContainer>

      {editProduct && (
        <EditProduct
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onUpdate={(updatedProduct) => {
            setProducts(products.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)))
            setEditProduct(null)
          }}
        />
      )}
    </>
  )
}

