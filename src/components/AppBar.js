import React from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

function AppBar() {
  const theme = useTheme();

  return (
    <MuiAppBar 
      position="fixed" 
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.primary.main, // Changed to primary color
        boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.1)}`
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit" // Changed to inherit to make it white
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: 'inherit', // Changed to inherit to make it white
            fontWeight: 600
          }}
        >
          Dashboard
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit"> {/* Changed to inherit */}
            <NotificationsIcon />
          </IconButton>
          
          <IconButton color="inherit"> {/* Changed to inherit */}
            <SettingsIcon />
          </IconButton>

          <Avatar 
            sx={{ 
              width: 35, 
              height: 35,
              bgcolor: alpha('#fff', 0.2), // Changed background color
              color: 'inherit' // Changed to inherit
            }}
          >
            A
          </Avatar>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}

export default AppBar;