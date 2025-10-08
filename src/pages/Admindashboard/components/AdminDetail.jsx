import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import './AdminDetail.scss';

const AdminDetail = ({ admin, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!admin) {
    return (
      <Box className="admin-detail">
        <div className="empty-state">
          <Typography variant="h6">Loading admin details...</Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
            Please wait while we fetch the admin information.
          </Typography>
          <Button
            onClick={onBack}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Back to Users
          </Button>
        </div>
      </Box>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving admin data...');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete admin ${admin.name}?`)) {
      console.log('Deleting admin:', admin.id);
      // Handle delete logic here
    }
  };

  return (
    <Box className="admin-detail">
      {/* Header */}
      <div className="admin-header">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Back to Users
        </Button>
        
        <div className="admin-title">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'secondary.main',
                fontSize: '2rem'
              }}
            >
              <AdminIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" className="admin-name">
                {admin.name || admin.fullname || 'Admin User'}
              </Typography>
              <Chip 
                label="Administrator" 
                color="secondary"
                size="medium"
                icon={<AdminIcon />}
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
        </div>
        
        <div className="action-buttons">
          {isEditing ? (
            <>
              <Button
                onClick={handleCancel}
                variant="outlined"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                sx={{
                  backgroundColor: '#5b8def',
                  '&:hover': {
                    backgroundColor: '#4a7bc8'
                  }
                }}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={handleEdit}
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Edit Admin
              </Button>
              <Button
                onClick={handleDelete}
                variant="contained"
                startIcon={<DeleteIcon />}
                sx={{
                  backgroundColor: '#ef4444',
                  '&:hover': {
                    backgroundColor: '#dc2626'
                  }
                }}
              >
                Delete Admin
              </Button>
            </Box>
          )}
        </div>
      </div>

      {/* Admin Information */}
      <div className="admin-content">
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Card className="info-card">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Full Name"
                      secondary={admin.name || admin.fullname || 'N/A'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Address"
                      secondary={admin.email || 'N/A'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Role"
                      secondary="System Administrator"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Created Date"
                      secondary={formatDate(admin.createdAt)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* System Information */}
          <Grid item xs={12} md={6}>
            <Card className="info-card">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon color="primary" />
                  System Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AdminIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Admin ID"
                      secondary={admin.id || admin.merchantid || 'N/A'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Access Level"
                      secondary="Full System Access"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Updated"
                      secondary={formatDate(admin.updatedAt)}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip 
                          label="Active" 
                          color="success" 
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Admin Statistics */}
          <Grid item xs={12}>
            <Card className="info-card">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsIcon color="primary" />
                  Admin Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {admin.totalActions || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Actions
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {admin.approvedMerchants || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Approved Merchants
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {admin.pendingReviews || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Reviews
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {admin.rejectedMerchants || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rejected Merchants
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </Box>
  );
};

export default AdminDetail;



