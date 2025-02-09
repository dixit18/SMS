import { Box, Container, Typography } from "@mui/material"
import AddCustomer from "./add-customer"
import CustomersTable from "./customers-table"
import { getCustomers } from "./actions"

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1">
          Customers
        </Typography>
        <AddCustomer />
      </Box>
      <CustomersTable initialCustomers={customers} />
    </Container>
  )
}

