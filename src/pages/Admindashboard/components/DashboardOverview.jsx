import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import './DashboardOverview.scss';

const DashboardOverview = ({ merchants, notifications }) => {
  // Calculate statistics
  const totalMerchants = merchants.length;
  const completedMerchants = merchants.filter(m => m.status === 'completed').length;
  const inProgressMerchants = merchants.filter(m => m.status === 'in_progress').length;
  const pendingMerchants = merchants.filter(m => m.status === 'pending').length;
  const rejectedMerchants = merchants.filter(m => m.status === 'rejected').length;
  
  const completionRate = totalMerchants > 0 ? Math.round((completedMerchants / totalMerchants) * 100) : 0;
  const avgProgress = totalMerchants > 0 ? Math.round(merchants.reduce((sum, m) => sum + m.progress, 0) / totalMerchants) : 0;
  
  // Recent activity (last 7 days)
  const recentMerchants = merchants.filter(m => {
    const submittedDate = new Date(m.submittedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return submittedDate >= weekAgo;
  }).length;

  const metrics = [
    {
      title: 'Total Merchants',
      value: totalMerchants,
      change: '+12%',
      changeType: 'positive',
      icon: '👥'
    },
    {
      title: 'Completed',
      value: completedMerchants,
      change: '+8%',
      changeType: 'positive',
      icon: '✅'
    },
    {
      title: 'In Progress',
      value: inProgressMerchants,
      change: '+15%',
      changeType: 'positive',
      icon: '🔄'
    },
    {
      title: 'Pending',
      value: pendingMerchants,
      change: '-5%',
      changeType: 'negative',
      icon: '⏳'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      change: '+3%',
      changeType: 'positive',
      icon: '📊'
    },
    {
      title: 'Avg Progress',
      value: `${avgProgress}%`,
      change: '+7%',
      changeType: 'positive',
      icon: '📈'
    }
  ];

  const recentActivity = [
    {
      type: 'new_merchant',
      message: 'New merchant application from Tech Solutions Ltd',
      timestamp: '2 hours ago',
      icon: '🆕'
    },
    {
      type: 'completion',
      message: 'Acme Corporation completed KYC process',
      timestamp: '1 day ago',
      icon: '✅'
    },
    {
      type: 'rejection',
      message: 'Digital Payments Inc application rejected',
      timestamp: '3 days ago',
      icon: '❌'
    },
    {
      type: 'update',
      message: 'Global Trading Co updated company information',
      timestamp: '5 days ago',
      icon: '📝'
    }
  ];

  return (
    <Box className="dashboard-overview">
      <Typography variant="h4" className="page-title" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Typography variant="body1" className="page-subtitle" gutterBottom>
        Welcome back! Here's what's happening with your merchant onboarding.
      </Typography>

      {/* Metrics Grid */}
      <Grid container spacing={14} className="metrics-grid">
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index} spacing={50}>
            <div className="metric-card">
              <div className="metric-icon">{metric.icon}</div>
              <div className="metric-value">{metric.value}</div>
              <div className="metric-label">{metric.title}</div>
              <div className={`metric-change ${metric.changeType}`}>
                {metric.change} from last week
              </div>
            </div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Charts Section */}
        {/* <Grid item xs={12} lg={8}>
          <div className="chart-container">
            <div className="chart-header">
              <Typography variant="h6">Merchant Onboarding Trends</Typography>
            </div>
            <div className="chart-placeholder">
              📊 Chart visualization will be implemented here
              <br />
              <small>Integration with Chart.js or similar library</small>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <Typography variant="h6">Status Distribution</Typography>
            </div>
            <div className="chart-placeholder">
              🥧 Pie chart showing merchant status distribution
              <br />
              <small>Completed: {completedMerchants} | In Progress: {inProgressMerchants} | Pending: {pendingMerchants} | Rejected: {rejectedMerchants}</small>
            </div>
          </div>
        </Grid> */}

        {/* Recent Activity */}
        {/* <Grid item xs={12} lg={4}>
          <div className="admin-card">
            <div className="admin-card-header">
              <Typography variant="h6">Recent Activity</Typography>
              <span className="activity-count">{recentActivity.length}</span>
            </div>
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-content">
                    <div className="activity-message">{activity.message}</div>
                    <div className="activity-timestamp">{activity.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          {/* <div className="admin-card">
            <div className="admin-card-header">
              <Typography variant="h6">Quick Stats</Typography>
            </div>
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-label">This Week</span>
                <span className="stat-value">{recentMerchants} new applications</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Processing Time</span>
                <span className="stat-value">Avg 3.2 days</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Success Rate</span>
                <span className="stat-value">{completionRate}%</span>
              </div>
            </div>
          </div>
        </Grid>  */}
      </Grid>
    </Box>
  );
};

export default DashboardOverview;


