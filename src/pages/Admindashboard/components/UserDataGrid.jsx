import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import './UserDataGrid.scss';

const UserDataGrid = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://complianceapis.mam-laka.com/api/user/profiles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setStatistics(data.statistics || {});
        setPagination(data.pagination || {});
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getCompletionPercentage = (completionSummary) => {
    if (!completionSummary) return 0;
    
    // Fixed 6 required steps
    const requiredSteps = [
      'companyinformation',
      'ubo', 
      'paymentandprosessing',
      'settlmentbankdetails',
      'riskmanagement',
      'kycdocs'
    ];
    
    // Count completed steps from the required list
    const completed = requiredSteps.filter(step => completionSummary[step] === true).length;
    const total = 6; // Fixed total steps
    
    return Math.round((completed / total) * 100);
  };

  const getStepStatus = (stepData) => {
    if (!stepData) return 'Not Started';
    if (stepData.completed) return 'Completed';
    return 'In Progress';
  };

  const columns = [
    {
      field: 'user',
      headerName: 'User',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            {params.value.fullname?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.value.fullname}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.value.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'merchantid',
      headerName: 'Merchant ID',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.row.user.merchantid}
        </Typography>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.user.role}
          color={params.row.user.role === 'admin' ? 'primary' : 'default'}
          size="small"
          icon={params.row.user.role === 'admin' ? <BusinessIcon /> : <PersonIcon />}
        />
      ),
    },
    {
      field: 'onboardingStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.user.onboardingStatus}
          color={getStatusColor(params.row.user.onboardingStatus)}
          size="small"
          icon={params.row.user.onboardingStatus === 'pending' ? <PendingIcon /> : <CompletedIcon />}
        />
      ),
    },
    {
      field: 'completionPercentage',
      headerName: 'Progress',
      width: 150,
      renderCell: (params) => {
        const percentage = getCompletionPercentage(params.row.completionSummary);
        return (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {percentage}%
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'companyinformation',
      headerName: 'Company Info',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStepStatus(params.row.companyinformation)}
          color={params.row.companyinformation?.completed ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'ubo',
      headerName: 'UBO',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={getStepStatus(params.row.ubo)}
          color={params.row.ubo?.completed ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'kycdocs',
      headerName: 'KYC Docs',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={getStepStatus(params.row.kycdocs)}
          color={params.row.kycdocs?.completed ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.row.user.createdAt).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton size="small" color="primary">
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" color="secondary">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const StatCard = ({ title, value, color = 'primary', icon }) => (
    <Card className="stat-card">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="div" color={`${color}.main`} fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Box className="stat-icon" color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box className="user-data-grid">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="user-data-grid">
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={statistics.totalUsers || 0}
            color="primary"
            icon={<PersonIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Users"
            value={statistics.pendingUsers || 0}
            color="warning"
            icon={<PendingIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved Users"
            value={statistics.approvedUsers || 0}
            color="success"
            icon={<CompletedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Admins"
            value={statistics.totalAdmins || 0}
            color="info"
            icon={<BusinessIcon />}
          />
        </Grid>
      </Grid>

      {/* Data Grid */}
      <Paper className="data-grid-container">
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2">
              User Management
            </Typography>
            <Button variant="contained" onClick={fetchUsers}>
              Refresh
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row) => row.user.id}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            checkboxSelection
            disableRowSelectionOnClick
            className="custom-data-grid"
            sx={{
              border: 0,
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(91, 141, 239, 0.1)',
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default UserDataGrid;
