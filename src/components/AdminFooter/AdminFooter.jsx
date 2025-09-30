import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Tooltip,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Refresh,
  CloudDone,
  Security,
  Speed,
  Storage,
  NetworkCheck,
  BugReport,
  Settings
} from '@mui/icons-material';
import './AdminFooter.scss';

const AdminFooter = () => {
  const [systemStatus, setSystemStatus] = useState({
    uptime: '99.9%',
    responseTime: '45ms',
    activeUsers: 1247,
    systemLoad: 23,
    lastUpdate: new Date()
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const systemMetrics = [
    {
      id: 'uptime',
      label: 'Uptime',
      value: systemStatus.uptime,
      icon: <CloudDone />,
      color: 'success',
      tooltip: 'System availability over the last 30 days'
    },
    {
      id: 'response',
      label: 'Response Time',
      value: systemStatus.responseTime,
      icon: <Speed />,
      color: 'primary',
      tooltip: 'Average API response time'
    },
    {
      id: 'users',
      label: 'Active Users',
      value: systemStatus.activeUsers.toLocaleString(),
      icon: <NetworkCheck />,
      color: 'info',
      tooltip: 'Currently active users'
    },
    {
      id: 'load',
      label: 'System Load',
      value: `${systemStatus.systemLoad}%`,
      icon: <Storage />,
      color: systemStatus.systemLoad > 80 ? 'error' : 'warning',
      tooltip: 'Current system resource utilization'
    }
  ];

  const quickActions = [
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: <Refresh />,
      action: handleRefresh
    },
    {
      id: 'security',
      label: 'Security Check',
      icon: <Security />,
      action: () => console.log('Security check')
    },
    {
      id: 'logs',
      label: 'View Logs',
      icon: <BugReport />,
      action: () => console.log('View logs')
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <Settings />,
      action: () => console.log('System settings')
    }
  ];

  function handleRefresh() {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setSystemStatus(prev => ({
        ...prev,
        lastUpdate: new Date(),
        responseTime: `${Math.floor(Math.random() * 20) + 30}ms`,
        activeUsers: Math.floor(Math.random() * 200) + 1200,
        systemLoad: Math.floor(Math.random() * 30) + 15
      }));
      setIsRefreshing(false);
    }, 1500);
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#22c55e';
      case 'primary': return '#3b82f6';
      case 'info': return '#06b6d4';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatLastUpdate = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours}h ago`;
    }
  };

  return (
    <Box className="admin-footer">
      <div className="footer-content">
        {/* System Status Section */}
        <div className="status-section">
          <div className="status-header">
            <Typography variant="subtitle2" className="status-title">
              System Status
            </Typography>
            <Chip 
              label="All Systems Operational" 
              color="success" 
              size="small"
              className="status-chip"
            />
          </div>
          
          <div className="metrics-grid">
            {systemMetrics.map((metric) => (
              <div key={metric.id} className="metric-item">
                <Tooltip title={metric.tooltip} arrow>
                  <div className="metric-content">
                    <div 
                      className="metric-icon"
                      style={{ color: getStatusColor(metric.color) }}
                    >
                      {metric.icon}
                    </div>
                    <div className="metric-details">
                      <Typography variant="caption" className="metric-label">
                        {metric.label}
                      </Typography>
                      <Typography variant="body2" className="metric-value">
                        {metric.value}
                      </Typography>
                    </div>
                  </div>
                </Tooltip>
                {metric.id === 'load' && (
                  <LinearProgress
                    variant="determinate"
                    value={systemStatus.systemLoad}
                    className="load-progress"
                    sx={{
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getStatusColor(metric.color)
                      }
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="actions-section">
          <Typography variant="subtitle2" className="actions-title">
            Quick Actions
          </Typography>
          <div className="actions-grid">
            {quickActions.map((action) => (
              <Tooltip key={action.id} title={action.label} arrow>
                <IconButton
                  onClick={action.action}
                  className={`action-button ${action.id === 'refresh' && isRefreshing ? 'refreshing' : ''}`}
                  disabled={action.id === 'refresh' && isRefreshing}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Footer Info Section */}
        <div className="info-section">
          <div className="footer-brand">
            <div className="brand-logo">
              <CloudDone className="logo-icon" />
            </div>
            <div className="brand-text">
              <Typography variant="subtitle2" className="brand-title">
                Compliance Admin
              </Typography>
              <Typography variant="caption" className="brand-subtitle">
                v2.1.0 • Last updated {formatLastUpdate(systemStatus.lastUpdate)}
              </Typography>
            </div>
          </div>
          
          <div className="footer-links">
            <Typography variant="caption" className="footer-link">
              Privacy Policy
            </Typography>
            <Typography variant="caption" className="footer-link">
              Terms of Service
            </Typography>
            <Typography variant="caption" className="footer-link">
              Support
            </Typography>
          </div>
        </div>
      </div>
      
      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <Typography variant="caption" className="copyright">
            © 2025 Compliance Web. All rights reserved.
          </Typography>
          <div className="footer-status">
            <div className="status-indicator">
              <div className="status-dot online"></div>
              <Typography variant="caption" className="status-text">
                All systems operational
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default AdminFooter;