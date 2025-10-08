import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Cancel as RejectedIcon
} from '@mui/icons-material';

import './UserDataGrid.scss';
import './MerchantList.scss';

const UserDataGridSimple = ({ selectedMerchant = null, onBackToAll = null }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/user/profiles', {
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
    const completed = Object.values(completionSummary).filter(Boolean).length;
    const total = Object.keys(completionSummary).length;
    return Math.round((completed / total) * 100);
  };

  const getStepStatus = (stepData, completionSummary, stepKey) => {
    // Use completionSummary if available, otherwise fall back to stepData
    if (completionSummary && stepKey) {
      return completionSummary[stepKey] ? 'SUBMITTED' : 'Not Started';
    }
    if (!stepData) return 'Not Started';
    if (stepData.completed) return 'SUBMITTED';
    return 'In Progress';
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredUsers.map((user) => user.user.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Handle viewing user details - navigate to merchant detail page
  const handleViewDetails = (userData) => {
    // Create a merchant object from user data to match the expected format
    const merchantData = {
      id: userData.user.merchantid,
      name: userData.companyinformation?.companyName || userData.user.fullname,
      email: userData.user.email,
      status: userData.user.onboardingStatus,
      progress: getCompletionPercentage(userData.completionSummary),
      completedSteps: Object.values(userData.completionSummary).filter(Boolean).length,
      totalSteps: 6,
      submittedAt: userData.user.createdAt,
      lastActivity: userData.user.updatedAt,
      companyInfo: {
        companyName: userData.companyinformation?.companyName || userData.user.fullname,
        countryOfIncorporation: userData.companyinformation?.countryOfIncorporation || 'N/A',
        dateOfIncorporation: userData.companyinformation?.dateOfIncorporation || userData.user.createdAt
      },
      fullUserData: userData
    };
    
    // Navigate to merchant detail page
    navigate(`/AdminDashboard/merchant/${userData.user.merchantid}`);
  };

  // Filter users based on selected merchant
  const filteredUsers = selectedMerchant 
    ? users.filter(user => user.user.merchantid === selectedMerchant.id)
    : users;

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
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Users"
            value={statistics.totalUsers || 0}
            color="primary"
            icon={<PersonIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Pending Users"
            value={statistics.pendingUsers || 0}
            color="warning"
            icon={<PendingIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Approved Users"
            value={statistics.approvedUsers || 0}
            color="success"
            icon={<CompletedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Rejected Users"
            value={statistics.rejectedUsers || 0}
            color="error"
            icon={<RejectedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Admins"
            value={statistics.totalAdmins || 0}
            color="info"
            icon={<BusinessIcon />}
          />
        </Grid>
      </Grid>

      {/* Data Table */}
      <Paper className="data-grid-container">
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2">
                {selectedMerchant ? `${selectedMerchant.name} - User Management` : 'User Management'}
              </Typography>
              {selectedMerchant && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Merchant ID: {selectedMerchant.id} | Status: {selectedMerchant.status}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedMerchant && onBackToAll && (
                <Button 
                  variant="outlined" 
                  onClick={onBackToAll}
                  sx={{ color: 'text.secondary', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  Back to All Users
                </Button>
              )}
              <Button variant="contained" onClick={fetchUsers}>
                Refresh
              </Button>
            </Box>
          </Box>
        </Box>
        
        <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
          <Table stickyHeader sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < filteredUsers.length}
                    checked={filteredUsers.length > 0 && selected.length === filteredUsers.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 200 }}>User</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Merchant ID</TableCell>
                {/* <TableCell>Role</TableCell> */}
                <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Progress</TableCell>
                {filteredUsers.some(user => user.user.role !== 'admin') ? (
                  <>
                    <TableCell sx={{ minWidth: 120 }}>Company Info</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>UBO</TableCell>
                    <TableCell sx={{ minWidth: 130 }}>Risk Management</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>Payment Info</TableCell>
                  </>
                ) : null}
                <TableCell sx={{ minWidth: 100 }}>Created</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((userData) => {
                  const isItemSelected = isSelected(userData.user.id);
                  const labelId = `enhanced-table-checkbox-${userData.user.id}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, userData.user.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={userData.user.id}
                      selected={isItemSelected}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'rgba(91, 141, 239, 0.1)' 
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(91, 141, 239, 0.2)',
                          '&:hover': {
                            backgroundColor: 'rgba(91, 141, 239, 0.3)',
                          },
                        },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {userData.user.fullname?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {userData.user.fullname}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {userData.user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {userData.user.merchantid}
                        </Typography>
                      </TableCell>
                      {/* <TableCell>
                        <Chip
                          label={userData.user.role}
                          color={userData.user.role === 'admin' ? 'primary' : 'default'}
                          size="small"
                          icon={userData.user.role === 'admin' ? <BusinessIcon /> : <PersonIcon />}
                        />
                      </TableCell> */}
                      <TableCell>
                        <Chip
                          label={userData.user.onboardingStatus}
                          color={getStatusColor(userData.user.onboardingStatus)}
                          size="small"
                          icon={userData.user.onboardingStatus === 'pending' ? <PendingIcon /> : <CompletedIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: 120 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={getCompletionPercentage(userData.completionSummary)}
                              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {getCompletionPercentage(userData.completionSummary)}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      {userData.user.role !== 'admin' ? (
                        <>
                          <TableCell>
                            <Chip
                              label={getStepStatus(userData.companyinformation, userData.completionSummary, 'companyinformation')}
                              color={userData.completionSummary?.companyinformation ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStepStatus(userData.ubo, userData.completionSummary, 'ubo')}
                              color={userData.completionSummary?.ubo ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStepStatus(userData.riskmanagement, userData.completionSummary, 'riskmanagement')}
                              color={userData.completionSummary?.riskmanagement ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStepStatus(userData.paymentandprosessing, userData.completionSummary, 'paymentandprosessing')}
                              color={userData.completionSummary?.paymentandprosessing ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </>
                      ) : null}
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(userData.user.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row selection
                                handleViewDetails(userData);
                              }}
                            >
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
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default UserDataGridSimple;
