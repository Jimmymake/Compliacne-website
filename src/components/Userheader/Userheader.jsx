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
  Business,
  Security,
  Help
} from '@mui/icons-material';
import './Userheader.scss';

const Userheader = ({ onMenuClick, unreadNotifications = 0 }) => {
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
      title: 'KYC Progress Update',
      message: 'Your company information has been reviewed and approved',
      time: '5 minutes ago',
      type: 'progress',
      read: false
    },
    {
      id: 2,
      title: 'Document Required',
      message: 'Please upload your bank statement for verification',
      time: '1 hour ago',
      type: 'document',
      read: false
    },
    {
      id: 3,
      title: 'Welcome to Compliance Web',
      message: 'Complete your KYC process to get started',
      time: '2 days ago',
      type: 'welcome',
      read: true
    }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'progress': return '📈';
      case 'document': return '📄';
      case 'welcome': return '👋';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'progress': return '#22c55e';
      case 'document': return '#f59e0b';
      case 'welcome': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <AppBar position="fixed" className="user-header" elevation={0}>
      <Toolbar className="user-toolbar">
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

        {/* Center Section - Progress Indicator */}
        <div className="header-center">
          <div className="progress-indicator">
            <Typography variant="caption" className="progress-label">
              KYC Progress
            </Typography>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '33%' }}></div>
            </div>
            <Typography variant="caption" className="progress-text">
              2 of 6 steps completed
            </Typography>
          </div>
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
            <Business fontSize="small" />
          </ListItemIcon>
          <ListItemText>Company Info</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Help fontSize="small" />
          </ListItemIcon>
          <ListItemText>Help & Support</ListItemText>
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

export default Userheader;
