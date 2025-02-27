"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Autocomplete, TextField, CircularProgress } from "@mui/material"
import debounce from "lodash/debounce"
import type { Customer } from "../types"

interface CustomerSearchProps {
  onSelect: (customer: Customer | null) => void
  label?: string
  disabled?: boolean
}

export default function CustomerSearch({ onSelect, label = "Select Customer", disabled = false }: CustomerSearchProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchCustomers = async (searchTerm: string, pageNum: number) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        page: pageNum.toString(),
        limit: "20",
      })

      const res = await fetch(`/api/customers?${params}`)
      if (!res.ok) throw new Error("Failed to fetch customers")

      const data = await res.json()
  console.log("<<<data in customer", data)
      if (pageNum === 1) {
        setOptions(data.customers)
      } else {
        setOptions((prev) => [...prev, ...data.customers])
      }

      setHasMore(data.pagination.hasMore)
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const debouncedFetch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        setPage(1)
        fetchCustomers(searchTerm, 1)
      }, 300),
    [],
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
      fetchCustomers(search, nextPage)
    }
  }

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onChange={(_, value) => onSelect(value)}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      getOptionLabel={(option) => option.name}
      options={options}
      loading={loading}
      disabled={disabled}
      filterOptions={(x) => x}
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

