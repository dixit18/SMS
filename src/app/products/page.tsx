"use client"

import { useEffect, useState, useCallback } from "react"
import { Box, Container, Typography, CircularProgress, Alert, Paper, Grid } from "@mui/material"
import AddProduct from "./add-product"
import ProductsTable from "./products-table"
import ProductFilters from "./product-filters"
import type { Product, ProductsResponse } from "../types"

export interface FilterValues {
  category: string
  gsmMin: string
  gsmMax: string
  rollNo: string
  reelNo: string
  unit: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totals, setTotals] = useState<{ kg?: number; pieces?: number }>({})
  const [filters, setFilters] = useState<FilterValues>({
    category: "",
    gsmMin: "",
    gsmMax: "",
    rollNo: "",
    reelNo: "",
    unit: "",
  })

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== "")),
      })

      const res = await fetch(`/api/products?${queryParams}`)
      if (!res.ok) throw new Error("Failed to fetch products")

      const data: ProductsResponse = await res.json()
      setProducts(data.products)
      setTotal(data.pagination.total)
      setTotals(data.totals)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [page, limit, filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  if (loading && !products.length) {
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
          Products
        </Typography>
        <AddProduct onProductAdded={fetchProducts} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Quantity:
                  </Typography>
                  {totals.kg && <Typography variant="h6">{totals.kg.toLocaleString()} kg</Typography>}
                  {totals.pieces && <Typography variant="h6">{totals.pieces.toLocaleString()} pieces</Typography>}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <ProductsTable
            products={products}
            loading={loading}
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onProductsChange={fetchProducts}
          />
        </Grid>
      </Grid>
    </Container>
  )
}

