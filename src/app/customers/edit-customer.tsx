"use client"

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid } from "@mui/material"
import { type Customer, updateCustomer } from "./actions"
import type React from "react" // Import React

interface EditCustomerProps {
  customer: Customer
  onClose: () => void
  onUpdate: (customer: Customer) => void
}

export default function EditCustomer({ customer, onClose, onUpdate }: EditCustomerProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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

    await updateCustomer(customer._id as string, data)
    onUpdate({ ...customer, ...data })
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth name="name" label="Customer Name" defaultValue={customer.name} />
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
          <Button type="submit" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

