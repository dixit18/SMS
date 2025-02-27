"use client"

import { Grid, TextField, MenuItem } from "@mui/material"
import type { FilterValues } from "./page"
import { categories, units } from "./add-product"


interface ProductFiltersProps {
  filters: FilterValues
  onFilterChange: (filters: FilterValues) => void
}

export default function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
  const handleChange = (field: keyof FilterValues, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    })
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          select
          fullWidth
          label="Category"
          value={filters.category}
          onChange={(e) => handleChange("category", e.target.value)}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <TextField
          fullWidth
          label="Min GSM"
          type="number"
          value={filters.gsmMin}
          onChange={(e) => handleChange("gsmMin", e.target.value)}
          inputProps={{ min: 0 }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <TextField
          fullWidth
          label="Max GSM"
          type="number"
          value={filters.gsmMax}
          onChange={(e) => handleChange("gsmMax", e.target.value)}
          inputProps={{ min: 0 }}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <TextField
          fullWidth
          label="Roll No"
          value={filters.rollNo}
          onChange={(e) => handleChange("rollNo", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <TextField
          fullWidth
          label="Reel No"
          value={filters.reelNo}
          onChange={(e) => handleChange("reelNo", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={1.5}>
        <TextField
          select
          fullWidth
          label="Unit"
          value={filters.unit}
          onChange={(e) => handleChange("unit", e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          {units.map((unit) => (
            <MenuItem key={unit} value={unit}>
              {unit}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  )
}

