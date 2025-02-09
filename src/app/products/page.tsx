import { Box, Container, Typography } from "@mui/material"
import AddProduct from "./add-product"
import ProductsTable from "./products-table"
import { getProducts } from "./actions"

export default async function ProductsPage() {
  const products: any = await getProducts()
  console.log("<<<products",products)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <AddProduct />
      </Box>
      <ProductsTable initialProducts={products} />
    </Container>
  )
}

