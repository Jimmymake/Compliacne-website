import React, { useState } from 'react';
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
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  Dashboard,
  People,
  Assessment,
  Security
} from '@mui/icons-material';
import './AdminHeader.scss';

const AdminHeader = ({ onMenuClick, unreadNotifications = 0 }) => {
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
    console.log('Navigate to profile');
    handleUserMenuClose();
  };

  const handleSettings = () => {
    console.log('Navigate to settings');
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
          
          <div className="header-brand">
            <div className="brand-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="brand-text">
              <Typography variant="h6" className="brand-title">
                MAMLAKA HUB
              </Typography>
              <Typography variant="caption" className="brand-subtitle">
                SPOKE TRADE NETWORK
              </Typography>
            </div>
          </div>
        </div>

        {/* Center Section - Search (Optional) */}
        <div className="header-center">
          {/* Search can be added here if needed */}
        </div>

        {/* Right Section - Notifications & User Menu */}
        <div className="header-right">
          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationOpen}
            className="notification-button"
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
              J
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
          <Avatar className="user-avatar-large">J</Avatar>
        <div className="user-info">
          <Typography variant="subtitle1">Jimmy Mayeku</Typography>
          <Typography variant="caption" color="text.secondary">
            jimmy@mamlakahub.com
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
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Security fontSize="small" />
          </ListItemIcon>
          <ListItemText>Security</ListItemText>
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