import React from 'react';
import {
  Box,
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
} from '@mui/icons-material';

const drawerWidth = 240;

export default function Sidebar({
  selectedView,
  setSelectedView,
  clusterStatus,
  currentCluster,
  onOpenPalette,
}) {
  const [profileAnchor, setProfileAnchor] = React.useState(null);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, value: 'dashboard' },
    { text: 'Experiments', icon: <ExperimentsIcon />, value: 'experiments' },
    { text: 'Results', icon: <ResultsIcon />, value: 'results' },
    { text: 'Settings', icon: <SettingsIcon />, value: 'settings' },
  ];

  const handleProfileClick = (event) => setProfileAnchor(event.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

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

        {/* Search Shortcut box */}
        <Box
          onClick={onOpenPalette}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 1.5,
            px: 1.5,
            py: 1,
            mb: 3,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
          }}
        >
          <Typography variant="body2" sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            Search controls...
          </Typography>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.08)', px: 0.8, py: 0.2, borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'monospace' }}>
              Ctrl+K
            </Typography>
          </Box>
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
                      fontSize: '0.95rem',
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
        {/* Cluster Status Widget */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: clusterStatus === 'Healthy' ? '#10b981' : clusterStatus === 'Degraded' ? '#f97316' : '#ef4444',
              boxShadow: `0 0 8px ${clusterStatus === 'Healthy' ? '#10b981' : clusterStatus === 'Degraded' ? '#f97316' : '#ef4444'}`,
              animation: clusterStatus !== 'Healthy' ? 'statusPulse 2s infinite ease-in-out' : 'none',
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              CLUSTER STATUS
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>
              {currentCluster}
            </Typography>
          </Box>
        </Box>

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
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      {drawerContent}
    </Box>
  );
}
