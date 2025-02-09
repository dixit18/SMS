"use client"

import { useState } from "react"
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from "@mui/material"
import { Add } from "@mui/icons-material"
import { addCustomer } from "./actions"

export default function AddCustomer() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: {
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        zipCode: formData.get("zipCode") as string,
        country: formData.get("country") as string,
      },
    }

    await addCustomer(data)
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
        Add Customer
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth name="name" label="Customer Name" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth name="email" label="Email" type="email" />
              </Grid>
              <Grid item xs={12}>
                <TextField required fullWidth name="phone" label="Phone Number" />
              </Grid>
              <Grid item xs={12}>
                <TextField required fullWidth name="street" label="Street Address" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth name="city" label="City" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth name="state" label="State/Province" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth name="zipCode" label="ZIP/Postal Code" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth name="country" label="Country" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              Add Customer
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

