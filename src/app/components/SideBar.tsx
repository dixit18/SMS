"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Inventory2, People, Receipt } from "@mui/icons-material"
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material"

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
            <Link href={item.path} key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton
                selected={pathname === item.path}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: pathname === item.path ? "white" : "text.secondary" 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}