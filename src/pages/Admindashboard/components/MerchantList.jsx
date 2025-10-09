import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { TextField, InputAdornment } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
import './MerchantList.scss';
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
  Checkbox,
  Tabs,
  Tab
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  AllInclusive as AllIcon,
  PlayArrow as InProgressIcon,
  Cancel as RejectedIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import './UserDataGrid.scss';



const MerchantList = ({ merchants, onMerchantSelect, onMerchantDetail, initialFilter = 'all', onOpenListGrid }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [activeTab, setActiveTab] = useState(0);
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
      const response = await fetch('https://complianceapis.mam-laka.com/api/user/profiles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Users API Response:', data);
        console.log('Users data structure:', data.users?.map(u => ({
          id: u.user?.id,
          name: u.user?.fullname,
          email: u.user?.email,
          role: u.user?.role,
          onboardingStatus: u.user?.onboardingStatus,
          merchantid: u.user?.merchantid
        })));
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

  // Tab configuration with correct business flow logic
  const statusTabs = [
    {
      label: 'All Users',
      value: 'all',
      count: users.length,
      icon: <AllIcon />,
      color: 'primary',
      description: 'All registered users'
    },
    // {
    //   label: 'In Progress',
    //   value: 'in_progress',
    //   count: users.filter(u => u.user.onboardingStatus === 'in_progress' && u.user.role !== 'admin').length,
    //   icon: <InProgressIcon />,
    //   color: 'info',
    //   description: 'Fast registered, not started forms'
    // },
    {
      label: 'Pending Review',
      value: 'pending',
      count: users.filter(u => u.user.onboardingStatus === 'pending' && u.user.role !== 'admin').length,
      icon: <PendingIcon />,
      color: 'warning',
      description: 'Started forms, waiting for admin approval'
    },
    {
      label: 'Approved',
      value: 'approved',
      count: users.filter(u => u.user.onboardingStatus === 'approved' && u.user.role !== 'admin').length,
      icon: <CompletedIcon />,
      color: 'success',
      description: 'Admin approved users'
    },
    {
      label: 'Rejected',
      value: 'rejected',
      count: users.filter(u => u.user.onboardingStatus === 'rejected' && u.user.role !== 'admin').length,
      icon: <RejectedIcon />,
      color: 'error',
      description: 'Admin rejected users'
    },
    {
      label: 'Admins',
      value: 'admin',
      count: users.filter(u => u.user.role === 'admin').length,
      icon: <AdminIcon />,
      color: 'secondary',
      description: 'System administrators'
    }
  ];

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setStatusFilter(statusTabs[newValue].value);
    setPage(0); // Reset to first page when changing tabs
  };

  // Filter users based on selected tab and search
  const filteredUsers = users.filter(user => {
    let matchesStatus;
    if (statusFilter === 'all') {
      matchesStatus = true; // Show all users
    } else if (statusFilter === 'admin') {
      matchesStatus = user.user.role === 'admin'; // Filter by role for admin tab
    } else {
      // For other tabs, filter by onboarding status AND exclude admins
      matchesStatus = user.user.onboardingStatus === statusFilter && user.user.role !== 'admin';
    }

    const matchesSearch = searchTerm === '' ||
      user.user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user.merchantid?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Debug logging for pending and approved tabs
  if (statusFilter === 'pending') {
    console.log('Pending tab debug:', {
      totalUsers: users.length,
      statusFilter,
      pendingUsers: users.filter(u => u.user.onboardingStatus === 'pending'),
      nonAdminUsers: users.filter(u => u.user.role !== 'admin'),
      pendingNonAdminUsers: users.filter(u => u.user.onboardingStatus === 'pending' && u.user.role !== 'admin'),
      filteredUsers: filteredUsers.length,
      searchTerm
    });
  }

  if (statusFilter === 'approved') {
    console.log('Approved tab debug:', {
      totalUsers: users.length,
      statusFilter,
      approvedUsers: users.filter(u => u.user.onboardingStatus === 'approved'),
      nonAdminUsers: users.filter(u => u.user.role !== 'admin'),
      approvedNonAdminUsers: users.filter(u => u.user.onboardingStatus === 'approved' && u.user.role !== 'admin'),
      filteredUsers: filteredUsers.length,
      searchTerm,
      allUserStatuses: users.map(u => ({ 
        name: u.user.fullname, 
        status: u.user.onboardingStatus, 
        role: u.user.role 
      }))
    });
  }

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


  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'admin': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box className="user-data-grid">
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Users"
            value={users.length}
            color="primary"
            icon={<PersonIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Pending Review"
            value={users.filter(u => u.user.onboardingStatus === 'pending' && u.user.role !== 'admin').length}
            color="warning"
            icon={<PendingIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Approved Users"
            value={users.filter(u => u.user.onboardingStatus === 'approved' && u.user.role !== 'admin').length}
            color="success"
            icon={<CompletedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Rejected Users"
            value={users.filter(u => u.user.onboardingStatus === 'rejected' && u.user.role !== 'admin').length}
            color="error"
            icon={<RejectedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Admins"
            value={users.filter(u => u.user.role === 'admin').length}
            color="info"
            icon={<AdminIcon />}
          />
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: 400 }}>
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <input
              type="text"
              placeholder="Search by name, email, or merchant ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0); // Reset to first page when searching
              }}
              style={{
                border: 'none',
                outline: 'none',
                flexGrow: 1,
                padding: '8px 12px',
                fontSize: '14px',
                backgroundColor: 'transparent',
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {filteredUsers.length} of {users.length} users
          </Typography>
        </Box>
      </Paper>

      {/* Status Filter Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 48,
              px: 3,
            },
            '& .Mui-selected': {
              color: 'primary.main',
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            }
          }}
        >
          {statusTabs.map((tab, index) => (
            <Tooltip key={tab.value} title={tab.description} placement="top">
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: activeTab === index ? `${tab.color}.main` : 'text.secondary'
                    }}>
                      {tab.icon}
                      <span>{tab.label}</span>
                    </Box>
                    <Chip
                      label={tab.count}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        backgroundColor: activeTab === index ? `${tab.color}.main` : 'grey.300',
                        color: activeTab === index ? 'white' : 'text.secondary',
                        '& .MuiChip-label': {
                          px: 1,
                        }
                      }}
                    />
                  </Box>
                }
              />
            </Tooltip>
          ))}
        </Tabs>
      </Paper>

      {/* Data Table */}
      <Paper className="data-grid-container">
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2">
                User Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {statusTabs[activeTab]?.description} • {filteredUsers.length} users
                {statusFilter !== 'all' && statusFilter !== 'admin' && (
                  <span> • Excluding admins</span>
                )}
                {statusFilter === 'pending' && (
                  <span> • Debug: {users.filter(u => u.user.onboardingStatus === 'pending').length} pending users found</span>
                )}
                {statusFilter === 'approved' && (
                  <span> • Debug: {users.filter(u => u.user.onboardingStatus === 'approved').length} approved users found</span>
                )}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {selected.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {selected.length} selected
                  </Typography>
                  {/* <Button 
                        variant="outlined" 
                        size="small"
                        color="error"
                        onClick={() => {
                          // Handle bulk delete
                          console.log('Bulk delete selected users:', selected);
                        }}
                      >
                        Delete
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small"
                        color="primary"
                        onClick={() => {
                          // Handle bulk approve
                          console.log('Bulk approve selected users:', selected);
                        }}
                      >
                        Approve
                      </Button> */}
                </Box>
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
                <TableCell sx={{ minWidth: 100 }}>Role</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Progress</TableCell>
                {filteredUsers.some(user => user.user.role !== 'admin') ? (
                  <>
                    <TableCell sx={{ minWidth: 120 }}>Company Info</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>UBO</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>Payment Info</TableCell>
                    <TableCell sx={{ minWidth: 130 }}>settlementbankdetail</TableCell>
                    <TableCell sx={{ minWidth: 130 }}>Risk Management</TableCell>
                    <TableCell sx={{ minWidth: 130 }}>kycdocs</TableCell>


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
                      <TableCell>
                        <Chip
                          label={userData.user.role}
                          color={userData.user.role === 'admin' ? 'secondary' : 'default'}
                          size="small"
                          icon={userData.user.role === 'admin' ? <BusinessIcon /> : <PersonIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={userData.user.onboardingStatus}
                          color={getStatusColor(userData.user.onboardingStatus)}
                          size="small"
                          icon={
                            userData.user.onboardingStatus === 'pending' ? <PendingIcon /> : 
                            userData.user.onboardingStatus === 'approved' ? <CompletedIcon /> :
                            userData.user.onboardingStatus === 'rejected' ? <RejectedIcon /> :
                            <CompletedIcon />
                          }
                          sx={{
                            ...(userData.user.onboardingStatus === 'approved' && {
                              backgroundColor: '#4caf50',
                              color: 'white',
                              fontWeight: 'bold',
                              '& .MuiChip-icon': {
                                color: 'white'
                              }
                            })
                          }}
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
                               label={getStepStatus(userData.paymentandprosessing, userData.completionSummary, 'paymentandprosessing')}
                               color={userData.completionSummary?.paymentandprosessing ? 'success' : 'default'}
                               size="small"
                             />
                           </TableCell>
                           <TableCell>
                             <Chip
                               label={getStepStatus(userData.settlmentbankdetails, userData.completionSummary, 'settlmentbankdetails')}
                               color={userData.completionSummary?.settlmentbankdetails ? 'success' : 'default'}
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
                               label={getStepStatus(userData.kycdocs, userData.completionSummary, 'kycdocs')}
                               color={userData.completionSummary?.kycdocs ? 'success' : 'default'}
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
                          {/* <Tooltip title="Edit">
                                <IconButton 
                                  size="small" 
                                  color="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Edit user:', userData.user.id);
                                    // Add edit functionality here
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip> */}
                          {/* <Tooltip title="Delete">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Are you sure you want to delete ${userData.user.fullname}?`)) {
                                      console.log('Delete user:', userData.user.id);
                                      // Add delete functionality here
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip> */}
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

export default MerchantList;


