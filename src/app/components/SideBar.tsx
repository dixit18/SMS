"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Inventory2, People, Receipt } from "@mui/icons-material"
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material"

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Products", icon: <Inventory2 />, path: "/products" },
  { text: "Customers", icon: <People />, path: "/customers" },
  { text: "Invoices", icon: <Receipt />, path: "/invoices" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" },
      }}
    >
      <Box sx={{ overflow: "auto", height: "100%" }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="div">
            Stock Manager
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              component={Link}
              href={item.path}
              selected={pathname === item.path}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "gray",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "gray",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: pathname === item.path ? "inherit" : "gray" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}

