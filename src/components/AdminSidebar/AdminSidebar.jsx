import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Typography,
  Box,
  Chip,
  Badge
} from '@mui/material';
import {
  Dashboard,
  People,
  Assessment,
  Notifications,
  Settings,
  PersonAdd,
  Business,
  Security,
  Analytics,
  Support,
  Logout
} from '@mui/icons-material';
import { useLogout } from '../../utils/logout';
import './AdminSidebar.scss';

const AdminSidebar = ({ isOpen, onClose, activeView, onViewChange, unreadNotifications = 0 }) => {
  const handleLogout = useLogout();

  const menuItems = [
    {
      id: 'overview',
      title: 'Dashboard Overview',
      icon: <Dashboard />,
      path: '/admin/overview',
      badge: null
    },
    {
      id: 'merchants',
      title: 'Merchant Management',
      icon: <People />,
      path: '/admin/merchants',
      badge: null
    },
    {
      id: 'user-management',
      title: 'User Management',
      icon: <PersonAdd />,
      path: '/admin/users',
      badge: null
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Notifications />,
      path: '/admin/notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null
    },
    {
      id: 'admin-management',
      title: 'Admin Management',
      icon: <PersonAdd />,
      path: '/admin/management',
      badge: null
    }
  ];

  const analyticsItems = [
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      icon: <Analytics />,
      path: '/admin/analytics',
      badge: null
    },
    {
      id: 'assessments',
      title: 'Risk Assessments',
      icon: <Assessment />,
      path: '/admin/assessments',
      badge: null
    }
  ];

  const systemItems = [
    {
      id: 'settings',
      title: 'System Settings',
      icon: <Settings />,
      path: '/admin/settings',
      badge: null
    },
    {
      id: 'security',
      title: 'Security Center',
      icon: <Security />,
      path: '/admin/security',
      badge: null
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: <Support />,
      path: '/admin/support',
      badge: null
    }
  ];

  const handleItemClick = (itemId) => {
    onViewChange(itemId);
    onClose();
  };

  const handleLogoutClick = () => {
    handleLogout();
  };

  const renderMenuItem = (item) => (
    <ListItem key={item.id} disablePadding className="sidebar-item">
      <ListItemButton
        onClick={() => handleItemClick(item.id)}
        className={`sidebar-button ${activeView === item.id ? 'active' : ''}`}
      >
        <ListItemIcon className="sidebar-icon">
          {item.badge ? (
            <Badge badgeContent={item.badge} color="error" max={99}>
              {item.icon}
            </Badge>
          ) : (
            item.icon
          )}
        </ListItemIcon>
        <ListItemText 
          primary={item.title}
          className="sidebar-text"
        />
        {activeView === item.id && (
          <div className="active-indicator"></div>
        )}
      </ListItemButton>
    </ListItem>
  );

  const renderMenuSection = (items, title) => (
    <Box className="menu-section">
      <Typography variant="overline" className="section-title">
        {title}
      </Typography>
      <List className="menu-list">
        {items.map(renderMenuItem)}
      </List>
    </Box>
  );

  // Determine if we're on desktop (persistent) or mobile (temporary)
  const isDesktop = window.innerWidth >= 1024;
  
  return (
    <>
      {/* Mobile Overlay - only show on mobile */}
      {isOpen && !isDesktop && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
        />
      )}
      
      <Drawer
        variant={isDesktop ? "persistent" : "temporary"}
        open={isOpen}
        onClose={onClose}
        className={`admin-sidebar-drawer ${isDesktop ? 'desktop-sticky' : ''}`}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        <Box className="admin-sidebar">
          {/* Sidebar Header */}
          <Box className="sidebar-header">
            <div className="header-content">
              <div className="brand-logo">
                <Business className="logo-icon" />
              </div>
              <div className="brand-text">
                <Typography variant="h6" className="brand-title">
                  Admin Panel
                </Typography>
                <Typography variant="caption" className="brand-subtitle">
                  Compliance Management
                </Typography>
              </div>
            </div>
            <div className="header-stats">
              <Chip 
                label="Live" 
                color="success" 
                size="small" 
                className="status-chip"
              />
            </div>
          </Box>

          <Divider className="sidebar-divider" />

          {/* Main Navigation */}
          <Box className="sidebar-content">
            {renderMenuSection(menuItems, 'Main')}
            
            <Divider className="section-divider" />
            
            {renderMenuSection(analyticsItems, 'Analytics')}
            
            <Divider className="section-divider" />
            
            {renderMenuSection(systemItems, 'System')}
          </Box>

          {/* Sidebar Footer */}
          <Box className="sidebar-footer">
            <Divider className="footer-divider" />
            
            <div className="footer-stats">
              <div className="stat-item">
                <Typography variant="caption" className="stat-label">
                  System Status
                </Typography>
                <div className="status-indicator">
                  <div className="status-dot online"></div>
                  <Typography variant="caption" className="status-text">
                    All Systems Operational
                  </Typography>
                </div>
              </div>
            </div>
            
            <ListItem disablePadding className="logout-item">
              <ListItemButton
                onClick={handleLogoutClick}
                className="logout-button"
              >
                <ListItemIcon className="logout-icon">
                  <Logout />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout"
                  className="logout-text"
                />
              </ListItemButton>
            </ListItem>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default AdminSidebar;