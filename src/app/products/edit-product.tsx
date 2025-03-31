"use client"

import type React from "react"

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
} from "@mui/material"
import type { Product } from "../types"
import { useState } from "react"
import { categories, units } from "./add-product"

interface EditProductProps {
  product: Product
  onClose: () => void
  onUpdate: () => void
}

export default function EditProduct({ product, onClose, onUpdate }: EditProductProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      gsm: Number(formData.get("gsm")),
      size: formData.get("size") as string,
      rollNo: formData.get("rollNo") as string,
      reelNo: formData.get("reelNo") as string,
      diameter: Number(formData.get("diameter")),
      weight: Number(formData.get("weight")),
      quantity: Number(formData.get("quantity")),
      unit: formData.get("unit") as string,
      category: formData.get("category") as string,
    }

    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update product")
      }

      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="name" label="Product Name" defaultValue={product.name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="size" label="Size" defaultValue={product.size} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="gsm" label="GSM" type="number" defaultValue={product.gsm} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="rollNo" label="Roll No" defaultValue={product.rollNo} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="reelNo" label="Reel No" defaultValue={product.reelNo} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="diameter"
                label="Diameter"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                defaultValue={product.diameter}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="weight"
                label="Weight (kg)"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                defaultValue={product.weight}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description"
                multiline
                rows={3}
                defaultValue={product.description}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="quantity"
                label="Quantity"
                type="number"
                inputProps={{ min: 0 }}
                defaultValue={product.quantity}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth select name="unit" label="Unit" defaultValue={product.unit}>
                {units.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth select name="category" label="Category" defaultValue={product.category}>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "black",
              "&:hover": {
                bgcolor: "#333",
              },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

