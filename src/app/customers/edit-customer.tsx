"use client"

import type React from "react"

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Alert } from "@mui/material"
import { useState } from "react"

interface EditCustomerProps {
  customer: any
  onClose: () => void
  onUpdate: () => void
}

export default function EditCustomer({ customer, onClose, onUpdate }: EditCustomerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      companyName: formData.get("companyName") as string,
      gstNumber: formData.get("gstNumber") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      placeOfSupply: formData.get("placeOfSupply") as string,
      address: {
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        zipCode: formData.get("zipCode") as string,
        country: formData.get("country") as string,
      },
    }

    try {
      const res = await fetch(`/api/customers/${customer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update customer")
      }

      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="name" label="Contact Person Name" defaultValue={customer.name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="companyName"
                label="Company Name"
                defaultValue={customer.companyName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="gstNumber" label="GST Number" defaultValue={customer.gstNumber} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="placeOfSupply"
                label="Place of Supply"
                defaultValue={customer.placeOfSupply || "24-GUJARAT"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="email" label="Email" type="email" defaultValue={customer.email} />
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth name="phone" label="Phone Number" defaultValue={customer.phone} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="street"
                label="Street Address"
                defaultValue={customer.address.street}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="city" label="City" defaultValue={customer.address.city} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="state" label="State/Province" defaultValue={customer.address.state} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="zipCode"
                label="ZIP/Postal Code"
                defaultValue={customer.address.zipCode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="country" label="Country" defaultValue={customer.address.country} />
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

