"use client"

import { useState } from "react"
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Alert } from "@mui/material"
import { Add } from "@mui/icons-material"


interface CustomersTableProps {
  onCustomerAdded: () => void
}

export default function AddCustomer({ onCustomerAdded }: CustomersTableProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

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
      gstNumber: formData.get("gstNumber") as string,
      companyName: formData.get("companyName") as string
    }
    
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
console.log("<<<<res",res)
      if (!res.ok) {
        const errorData = await res.json()
        console.log("<<<<errorData", errorData)
        throw new Error(errorData.error || "Failed to add product")
      }
      onCustomerAdded()
      setLoading(false)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
        Add Customer
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth name="name" label="Customer Name" />
              </Grid>
              <Grid item xs={2} sm={6}>
                  <TextField required fullWidth name="companyName" label="Company Name"/>
              </Grid>
              <Grid item xs={12} >
                <TextField required fullWidth name="email" label="Email" type="email" />
              </Grid>
              <Grid item xs={12} >
                <TextField required fullWidth name="gstNumber" label="GST Number" />
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

