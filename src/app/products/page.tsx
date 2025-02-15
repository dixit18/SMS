"use client"

import { useEffect, useState, useCallback } from "react"
import { Box, Container, Typography, CircularProgress, Alert } from "@mui/material"
import AddProduct from "./add-product"
import ProductsTable from "./products-table"
import type { Product } from "../types"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      })

      const res = await fetch(`/api/products?${queryParams}`)
      if (!res.ok) throw new Error("Failed to fetch products")
      console.log("<<<res", res)
      const data = await res.json()
      console.log("<<<data", data)
      setProducts(data.products)
      setTotal(data.pagination.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [page, limit, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  if (loading && !products.length) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Container>
    )
  }
  console.log("<<<products eeee",products)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <AddProduct onProductAdded={fetchProducts} />
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <ProductsTable
        products={products}
        loading={loading}
        page={page}
        limit={limit}
        total={total}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onProductsChange={fetchProducts}
      />
    </Container>
  )
}

