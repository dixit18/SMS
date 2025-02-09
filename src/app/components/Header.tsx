"use client"

import { AppBar, IconButton, Toolbar, Typography } from "@mui/material"
import { Menu, Notifications } from "@mui/icons-material"

export default function Header() {
  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2, display: { sm: "none" } }}>
          <Menu />
        </IconButton>
        <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
          Stock Management
        </Typography>
        <IconButton color="inherit">
          <Notifications />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

