"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Autocomplete, TextField, CircularProgress } from "@mui/material"
import { debounce } from "lodash"
import type { Product } from "../types"

interface ProductSearchProps {
  onSelect: (product: Product | null) => void
  label?: string
  disabled?: boolean
}

export default function ProductSearch({ onSelect, label = "Select Product", disabled = false }: ProductSearchProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchProducts = async (searchTerm: string, pageNum: number) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        q: searchTerm,
        page: pageNum.toString(),
        limit: "20",
      })

      const res = await fetch(`/api/products/search?${params}`)
      if (!res.ok) throw new Error("Failed to fetch products")

      const data = await res.json()

      if (pageNum === 1) {
        setOptions(data.products)
      } else {
        setOptions((prev) => [...prev, ...data.products])
      }

      setHasMore(data.pagination.hasMore)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const debouncedFetch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        setPage(1)
        fetchProducts(searchTerm, 1)
      }, 300),
    [], // Removed fetchProducts as a dependency
  )

  useEffect(() => {
    if (open) {
      debouncedFetch(search)
    }
  }, [open, search, debouncedFetch])

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const listboxNode = event.currentTarget

    if (!loading && hasMore && listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 50) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchProducts(search, nextPage)
    }
  }

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onChange={(_, value) => onSelect(value)}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      getOptionLabel={(option) =>
        `${option.name} (${option.rollNo}) - ${option.size} - ${option.gsm} GSM - ${option.quantity} ${option.unit}`
      }
      options={options}
      loading={loading}
      disabled={disabled}
      filterOptions={(x) => x} // Disable client-side filtering
      onInputChange={(_, value) => setSearch(value)}
      ListboxProps={{
        onScroll: handleScroll,
        style: { maxHeight: "300px" },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}

