"use client"

import { useState } from "react"
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem } from "@mui/material"
import { Add } from "@mui/icons-material"
import { addProduct } from "./actions"

const units = ["pieces", "kg", "liters", "meters"]
const categories = ["Electronics", "Furniture", "Clothing", "Food", "Other"]

export default function AddProduct() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

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

    await addProduct(data)
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
        Add Product
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth name="name" label="Product Name" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth name="sku" label="SKU" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth name="description" label="Description" multiline rows={3} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="price"
                  label="Price"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="quantity"
                  label="Initial Quantity"
                  type="number"
                  inputProps={{ min: 0 }}
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth select name="unit" label="Unit" defaultValue="">
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth select name="category" label="Category" defaultValue="">
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
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              Add Product
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

