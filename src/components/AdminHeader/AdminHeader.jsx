import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Badge, 
  Menu, 
  MenuItem, 
  Avatar, 
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Dashboard,
  People,
  Assessment
} from '@mui/icons-material';
import './AdminHeader.scss';

const AdminHeader = ({ onMenuClick, unreadNotifications = 0 }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  const handleProfile = () => {
    // Get current admin's merchant ID from localStorage or token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode token to get merchant ID (simple base64 decode for JWT payload)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const merchantId = payload.merchantId;
        
        if (merchantId) {
          // Navigate to admin detail page
          navigate(`/AdminDashboard/merchant/${merchantId}`);
        } else {
          console.error('No merchant ID found in token');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    handleUserMenuClose();
  };


  const mockNotifications = [
    {
      id: 1,
      title: 'New Merchant Application',
      message: 'Tech Solutions Ltd has submitted their KYC application',
      time: '2 minutes ago',
      type: 'new_merchant',
      read: false
    },
    {
      id: 2,
      title: 'KYC Completed',
      message: 'Acme Corporation has completed their onboarding process',
      time: '1 hour ago',
      type: 'completion',
      read: false
    },
    {
      id: 3,
      title: 'Document Review Required',
      message: 'Global Trading Co needs document verification',
      time: '3 hours ago',
      type: 'review',
      read: true
    }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_merchant': return '🆕';
      case 'completion': return '✅';
      case 'review': return '📋';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_merchant': return '#3b82f6';
      case 'completion': return '#22c55e';
      case 'review': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <AppBar position="fixed" className="admin-header" elevation={0}>
      <Toolbar className="admin-toolbar">
        {/* Left Section - Menu & Logo */}
        <div className="header-left">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            className="menu-button"
          >
            <MenuIcon />
          </IconButton>
          
          {/* <div className="header-brand"> */}
          <div className="brand-logo">
            <img 
              src={logo} 
              alt="MAMLAKA HUB Logo" 
              style={{ 
                width: '100px', 
                height: '100px', 
                objectFit: 'contain' 
              }} 
            />
          </div>
            <div className="brand-text">
              <Typography variant="h6" className="brand-title">
                MAMLAKA HUB & SPOKE
              </Typography>
              {/* <Typography variant="caption" className="brand-subtitle">
                SPOKE TRADE NETWORK
              </Typography> */}
            </div>
          </div>
        {/* </div> */}

        {/* Right Section - Notifications and User Menu */}
        <div className="header-right">
          {/* Admin Name Chip */}
          <Chip
            label={(() => {
              const token = localStorage.getItem('token');
              if (token) {
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  return payload.fullname || 'Admin User';
                } catch (error) {
                  return 'Admin User';
                }
              }
              return 'Admin User';
            })()}
            size="small"
            sx={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              fontSize: '0.75rem',
              height: '28px',
              mr: 1,
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />
          
          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationOpen}
            className="notification-button"
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={unreadNotifications} color="error" max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          {/* User Menu */}
          <IconButton
            color="inherit"
            onClick={handleUserMenuOpen}
            className="user-button"
          >
            <Avatar className="user-avatar" sx={{ width: 32, height: 32 }}>
              {(() => {
                const token = localStorage.getItem('token');
                if (token) {
                  try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    return payload.fullname ? payload.fullname.charAt(0).toUpperCase() : 'A';
                  } catch (error) {
                    return 'A';
                  }
                }
                return 'A';
              })()}
            </Avatar>
          </IconButton>
        </div>
      </Toolbar>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        className="notification-menu"
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <div className="notification-header">
          <Typography variant="h6">Notifications</Typography>
          <Typography variant="caption" color="text.secondary">
            {unreadNotifications} unread
          </Typography>
        </div>
        <Divider />
        
        {mockNotifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          mockNotifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
            >
              <div className="notification-content">
                <div 
                  className="notification-icon"
                  style={{ color: getNotificationColor(notification.type) }}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-details">
                  <Typography variant="subtitle2" className="notification-title">
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" className="notification-message">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" className="notification-time">
                    {notification.time}
                  </Typography>
                </div>
              </div>
            </MenuItem>
          ))
        )}
        
        <Divider />
        <MenuItem onClick={handleNotificationClose}>
          <Typography variant="body2" color="primary">
            View All Notifications
          </Typography>
        </MenuItem>
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        className="user-menu"
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <div className="user-menu-header">
          <Avatar className="user-avatar-large">
            {(() => {
              const token = localStorage.getItem('token');
              if (token) {
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  return payload.fullname ? payload.fullname.charAt(0).toUpperCase() : 'A';
                } catch (error) {
                  return 'A';
                }
              }
              return 'A';
            })()}
          </Avatar>
        <div className="user-info">
          <Typography variant="subtitle1">
            {(() => {
              const token = localStorage.getItem('token');
              if (token) {
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  return payload.fullname || 'Admin User';
                } catch (error) {
                  return 'Admin User';
                }
              }
              return 'Admin User';
            })()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {(() => {
              const token = localStorage.getItem('token');
              if (token) {
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  return payload.email || 'admin@example.com';
                } catch (error) {
                  return 'admin@example.com';
                }
              }
              return 'admin@example.com';
            })()}
          </Typography>
        </div>
        </div>
        <Divider />
        
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default AdminHeader;