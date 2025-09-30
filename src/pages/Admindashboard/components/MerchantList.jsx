import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './MerchantList.scss';

const MerchantList = ({ merchants, onMerchantSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Merchants', count: merchants.length },
    { value: 'completed', label: 'Completed', count: merchants.filter(m => m.status === 'completed').length },
    { value: 'in_progress', label: 'In Progress', count: merchants.filter(m => m.status === 'in_progress').length },
    { value: 'pending', label: 'Pending', count: merchants.filter(m => m.status === 'pending').length },
    { value: 'rejected', label: 'Rejected', count: merchants.filter(m => m.status === 'rejected').length }
  ];

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || merchant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'in_progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <Box className="merchant-list">
      <div className="page-header">
        <Typography variant="h4" className="page-title">
          Merchant Management
        </Typography>
        <Typography variant="body1" className="page-subtitle">
          Manage and track merchant onboarding progress
        </Typography>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <TextField
          fullWidth
          placeholder="Search merchants by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#5b8def',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 1,
              },
            },
          }}
        />

        <div className="filter-tabs">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={`filter-tab ${statusFilter === option.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
              <span className="count-badge">{option.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <Typography variant="body2" color="text.secondary">
          Showing {filteredMerchants.length} of {merchants.length} merchants
        </Typography>
      </div>

      {/* Merchant Cards */}
      <div className="merchants-grid">
        {filteredMerchants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <Typography variant="h6" className="empty-title">
              No merchants found
            </Typography>
            <Typography variant="body2" className="empty-subtitle">
              Try adjusting your search or filter criteria
            </Typography>
          </div>
        ) : (
          filteredMerchants.map((merchant) => (
            <div
              key={merchant.id}
              className="merchant-card"
              onClick={() => onMerchantSelect(merchant)}
            >
              <div className="merchant-header">
                <div className="merchant-info">
                  <h4>{merchant.name}</h4>
                  <p className="merchant-email">{merchant.email}</p>
                  <p className="merchant-id">ID: {merchant.id}</p>
                </div>
                <div className="merchant-status">
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: `${getStatusColor(merchant.status)}20`,
                      color: getStatusColor(merchant.status),
                      borderColor: `${getStatusColor(merchant.status)}40`
                    }}
                  >
                    {merchant.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="merchant-progress">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-percentage">{merchant.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${merchant.progress}%`,
                      backgroundColor: getStatusColor(merchant.status)
                    }}
                  />
                </div>
                <div className="progress-steps">
                  {merchant.completedSteps} of {merchant.totalSteps} steps completed
                </div>
              </div>

              <div className="merchant-meta">
                <div className="meta-item">
                  <span className="meta-label">Submitted:</span>
                  <span className="meta-value">{formatDate(merchant.submittedAt)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Last Activity:</span>
                  <span className="meta-value">{formatDate(merchant.lastActivity)}</span>
                </div>
                {merchant.rejectionReason && (
                  <div className="meta-item rejection-reason">
                    <span className="meta-label">Rejection Reason:</span>
                    <span className="meta-value">{merchant.rejectionReason}</span>
                  </div>
                )}
              </div>

              <div className="merchant-actions">
                <button className="view-details-btn">
                  View Details →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Box>
  );
};

export default MerchantList;


