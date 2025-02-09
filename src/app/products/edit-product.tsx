"use client"

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem } from "@mui/material"
import { type Product, updateProduct } from "./actions"
import type React from "react" // Import React

const units = ["pieces", "kg", "liters", "meters"]
const categories = ["Electronics", "Furniture", "Clothing", "Food", "Other"]

interface EditProductProps {
  product: Product
  onClose: () => void
  onUpdate: (product: Product) => void
}

export default function EditProduct({ product, onClose, onUpdate }: EditProductProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      quantity: Number(formData.get("quantity")),
      dimensions: {
        length: Number(formData.get("length")),
        width: Number(formData.get("width")),
        height: Number(formData.get("height")),
      },
      unit: formData.get("unit") as string,
      category: formData.get("category") as string,
    }

    await updateProduct(product._id as string, data)
    onUpdate({ ...product, ...data })
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="name" label="Product Name" defaultValue={product.name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="sku" label="SKU" defaultValue={product.sku} />
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
                name="price"
                label="Price"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                defaultValue={product.price}
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
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                name="length"
                label="Length"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                defaultValue={product.dimensions.length}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                name="width"
                label="Width"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                defaultValue={product.dimensions.width}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                name="height"
                label="Height"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                defaultValue={product.dimensions.height}
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
          <Button type="submit" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

