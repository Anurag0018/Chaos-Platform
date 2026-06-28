import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Science as ExperimentsIcon,
  Assessment as ResultsIcon,
  Settings as SettingsIcon,
  FlashOn as LogoIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

export default function Sidebar({
  selectedView,
  setSelectedView,
  currentCluster,
  setCurrentCluster,
  clusterStatus,
  mobileOpen,
  handleDrawerToggle,
}) {
  const [profileAnchor, setProfileAnchor] = React.useState(null);
  const [clusterAnchor, setClusterAnchor] = React.useState(null);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, value: 'dashboard' },
    { text: 'Experiments', icon: <ExperimentsIcon />, value: 'experiments' },
    { text: 'Results', icon: <ResultsIcon />, value: 'results' },
    { text: 'Settings', icon: <SettingsIcon />, value: 'settings' },
  ];

  const handleProfileClick = (event) => setProfileAnchor(event.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  const handleClusterClick = (event) => setClusterAnchor(event.currentTarget);
  const handleClusterClose = () => setClusterAnchor(null);

  const handleSelectCluster = (cluster) => {
    setCurrentCluster(cluster);
    handleClusterClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Healthy':
        return '#10b981';
      case 'Degraded':
        return '#f97316';
      default:
        return '#ef4444';
    }
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#141720',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        justifyContent: 'space-between',
        p: 2,
      }}
    >
      <Box>
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 2, mb: 2 }}>
          <LogoIcon sx={{ color: '#7c3aed', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.02em', color: '#fff' }}>
            Chaos Platform
          </Typography>
        </Box>

        {/* Navigation List */}
        <List sx={{ p: 0, '& .MuiListItem-root': { mb: 0.5 } }}>
          {menuItems.map((item) => {
            const isSelected = selectedView === item.value;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    setSelectedView(item.value);
                    if (mobileOpen) handleDrawerToggle();
                  }}
                  sx={{
                    borderRadius: 1.5,
                    py: 1.2,
                    px: 2,
                    bgcolor: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #7c3aed' : '3px solid transparent',
                    color: isSelected ? '#a78bfa' : '#9ca3af',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      color: '#fff',
                      '& .MuiListItemIcon-root': { color: '#fff' },
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isSelected ? '#a78bfa' : '#9ca3af',
                      transition: 'color 0.2s',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer Profile & Cluster Selection */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* User Profile */}
        <Box
          onClick={handleProfileClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
            transition: 'background-color 0.2s',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: '#4f46e5',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 700,
                width: 36,
                height: 36,
              }}
            >
              AD
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#f3f4f6', lineHeight: 1.2 }}>
                admin
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                Cluster Admin
              </Typography>
            </Box>
          </Box>
          <ArrowDownIcon sx={{ color: '#9ca3af', fontSize: 18 }} />
        </Box>

        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleProfileClose}
          PaperProps={{
            sx: {
              bgcolor: '#1e2230',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              width: 200,
              mt: -1,
            },
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <MenuItem onClick={handleProfileClose} sx={{ fontSize: '0.9rem' }}>My Profile</MenuItem>
          <MenuItem onClick={handleProfileClose} sx={{ fontSize: '0.9rem' }}>Account Settings</MenuItem>
          <Divider sx={{ opacity: 0.1 }} />
          <MenuItem onClick={handleProfileClose} sx={{ fontSize: '0.9rem', color: '#ef4444' }}>Logout</MenuItem>
        </Menu>

        {/* Cluster Switcher */}
        <Box
          onClick={handleClusterClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1,
            px: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
            transition: 'background-color 0.2s',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <CircleIcon sx={{ color: getStatusColor(clusterStatus), fontSize: 10 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#f3f4f6', fontSize: '0.85rem' }}>
              Cluster: {currentCluster}
            </Typography>
          </Box>
          <ArrowDownIcon sx={{ color: '#9ca3af', fontSize: 16 }} />
        </Box>

        <Menu
          anchorEl={clusterAnchor}
          open={Boolean(clusterAnchor)}
          onClose={handleClusterClose}
          PaperProps={{
            sx: {
              bgcolor: '#1e2230',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              width: 200,
              mt: -1,
            },
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <MenuItem onClick={() => handleSelectCluster('production')} sx={{ fontSize: '0.9rem' }}>
            <CircleIcon sx={{ color: '#10b981', fontSize: 8, mr: 1.5 }} /> production
          </MenuItem>
          <MenuItem onClick={() => handleSelectCluster('staging')} sx={{ fontSize: '0.9rem' }}>
            <CircleIcon sx={{ color: '#f97316', fontSize: 8, mr: 1.5 }} /> staging
          </MenuItem>
          <MenuItem onClick={() => handleSelectCluster('development')} sx={{ fontSize: '0.9rem' }}>
            <CircleIcon sx={{ color: '#ef4444', fontSize: 8, mr: 1.5 }} /> development
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none', bgcolor: '#141720' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop sidebar */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        {drawerContent}
      </Box>
    </>
  );
}
