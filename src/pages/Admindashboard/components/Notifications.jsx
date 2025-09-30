import React, { useState } from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import MarkAsReadIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';
import './Notifications.scss';

const Notifications = ({ notifications, setNotifications }) => {
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
    { value: 'new_merchant', label: 'New Merchants', count: notifications.filter(n => n.type === 'new_merchant').length },
    { value: 'completion', label: 'Completions', count: notifications.filter(n => n.type === 'completion').length },
    { value: 'rejection', label: 'Rejections', count: notifications.filter(n => n.type === 'rejection').length }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_merchant': return '🆕';
      case 'completion': return '✅';
      case 'rejection': return '❌';
      case 'update': return '📝';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_merchant': return '#3b82f6';
      case 'completion': return '#22c55e';
      case 'rejection': return '#ef4444';
      case 'update': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <Box className="notifications-page">
      <div className="page-header">
        <Typography variant="h4" className="page-title">
          Notifications
        </Typography>
        <Typography variant="body1" className="page-subtitle">
          Stay updated with merchant activities and system alerts
        </Typography>
      </div>

      {/* Filter Tabs */}
      <div className="filter-section">
        <div className="filter-tabs">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`filter-tab ${filter === option.value ? 'active' : ''}`}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
              <span className="count-badge">{option.count}</span>
            </button>
          ))}
        </div>
        
        {filter === 'unread' && notifications.filter(n => !n.read).length > 0 && (
          <button className="mark-all-read-btn" onClick={markAllAsRead}>
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <Typography variant="h6" className="empty-title">
              No notifications found
            </Typography>
            <Typography variant="body2" className="empty-subtitle">
              {filter === 'all' 
                ? 'You\'re all caught up!' 
                : `No ${filter} notifications at the moment`
              }
            </Typography>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
            >
              <div className="notification-content">
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-details">
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-meta">
                    <span className="timestamp">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                    <Chip
                      label={notification.type.replace('_', ' ')}
                      size="small"
                      sx={{
                        backgroundColor: `${getNotificationColor(notification.type)}20`,
                        color: getNotificationColor(notification.type),
                        border: `1px solid ${getNotificationColor(notification.type)}40`,
                        fontSize: '0.625rem',
                        height: '20px'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="notification-actions">
                {!notification.read && (
                  <IconButton
                    size="small"
                    onClick={() => markAsRead(notification.id)}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        color: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)'
                      }
                    }}
                  >
                    <MarkAsReadIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={() => deleteNotification(notification.id)}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      color: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="notification-stats">
        <div className="stat-card">
          <div className="stat-value">{notifications.length}</div>
          <div className="stat-label">Total Notifications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{notifications.filter(n => !n.read).length}</div>
          <div className="stat-label">Unread</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {notifications.filter(n => {
              const date = new Date(n.timestamp);
              const today = new Date();
              return date.toDateString() === today.toDateString();
            }).length}
          </div>
          <div className="stat-label">Today</div>
        </div>
      </div>
    </Box>
  );
};

export default Notifications;


