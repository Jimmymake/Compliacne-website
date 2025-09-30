import React, { useState, useEffect } from 'react';
import './AdminDashboard.scss';
import AdminHeader from '../../components/AdminHeader/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import AdminFooter from '../../components/AdminFooter/AdminFooter';
import DashboardOverview from './components/DashboardOverview';
import MerchantList from './components/MerchantList';
import MerchantDetail from './components/MerchantDetail';
import Notifications from './components/Notifications';
import AdminManagement from './components/AdminManagement';
import UserDataGridSimple from './components/UserDataGridSimple';
import { Box, ThemeProvider } from '@mui/material';
import theme from '../../theme/theme';

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedMerchantForDataGrid, setSelectedMerchantForDataGrid] = useState(null);
  
  // Make sidebar always open on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock data for development
  useEffect(() => {
    // Mock merchants data
    const mockMerchants = [
      {
        id: 'MID001',
        name: 'Acme Corporation',
        email: 'admin@acme.com',
        status: 'completed',
        progress: 100,
        completedSteps: 6,
        totalSteps: 6,
        submittedAt: '2024-01-15T10:30:00Z',
        lastActivity: '2024-01-15T14:20:00Z',
        companyInfo: {
          companyName: 'Acme Corporation',
          countryOfIncorporation: 'US',
          dateOfIncorporation: '2020-01-15'
        }
      },
      {
        id: 'MID002',
        name: 'Tech Solutions Ltd',
        email: 'info@techsolutions.com',
        status: 'in_progress',
        progress: 60,
        completedSteps: 3,
        totalSteps: 6,
        submittedAt: '2024-01-14T09:15:00Z',
        lastActivity: '2024-01-16T11:45:00Z',
        companyInfo: {
          companyName: 'Tech Solutions Ltd',
          countryOfIncorporation: 'UK',
          dateOfIncorporation: '2019-03-22'
        }
      },
      {
        id: 'MID003',
        name: 'Global Trading Co',
        email: 'contact@globaltrading.com',
        status: 'pending',
        progress: 20,
        completedSteps: 1,
        totalSteps: 6,
        submittedAt: '2024-01-16T16:20:00Z',
        lastActivity: '2024-01-16T16:20:00Z',
        companyInfo: {
          companyName: 'Global Trading Co',
          countryOfIncorporation: 'CA',
          dateOfIncorporation: '2021-07-10'
        }
      },
      {
        id: 'MID004',
        name: 'Digital Payments Inc',
        email: 'support@digitalpayments.com',
        status: 'rejected',
        progress: 40,
        completedSteps: 2,
        totalSteps: 6,
        submittedAt: '2024-01-12T13:10:00Z',
        lastActivity: '2024-01-13T09:30:00Z',
        rejectionReason: 'Incomplete documentation',
        companyInfo: {
          companyName: 'Digital Payments Inc',
          countryOfIncorporation: 'US',
          dateOfIncorporation: '2022-05-18'
        }
      }
    ];

    // Mock notifications
    const mockNotifications = [
      {
        id: 1,
        type: 'new_merchant',
        message: 'New merchant application from Tech Solutions Ltd',
        timestamp: '2024-01-16T11:45:00Z',
        read: false
      },
      {
        id: 2,
        type: 'completion',
        message: 'Acme Corporation completed KYC process',
        timestamp: '2024-01-15T14:20:00Z',
        read: false
      },
      {
        id: 3,
        type: 'rejection',
        message: 'Digital Payments Inc application rejected',
        timestamp: '2024-01-13T09:30:00Z',
        read: true
      }
    ];

    setMerchants(mockMerchants);
    setNotifications(mockNotifications);
  }, []);

  const handleMerchantSelect = (merchant) => {
    setSelectedMerchant(merchant);
    setSelectedMerchantForDataGrid(merchant);
    setActiveView('user-management');
  };

  const handleBackToList = () => {
    setSelectedMerchant(null);
    setActiveView('merchants');
  };

  const handleBackToAllUsers = () => {
    setSelectedMerchantForDataGrid(null);
    setActiveView('user-management');
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setSelectedMerchant(null);
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <DashboardOverview merchants={merchants} notifications={notifications} />;
      case 'merchants':
        return <MerchantList merchants={merchants} onMerchantSelect={handleMerchantSelect} />;
      case 'merchant-detail':
        return <MerchantDetail merchant={selectedMerchant} onBack={handleBackToList} />;
      case 'notifications':
        return <Notifications notifications={notifications} setNotifications={setNotifications} />;
      case 'admin-management':
        return <AdminManagement />;
      case 'user-management':
        return <UserDataGridSimple selectedMerchant={selectedMerchantForDataGrid} onBackToAll={handleBackToAllUsers} />;
      default:
        return <DashboardOverview merchants={merchants} notifications={notifications} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="admin-dashboard">
        <AdminHeader 
          onMenuClick={() => {
            // Only toggle on mobile
            if (window.innerWidth < 1024) {
              setSidebarOpen(!sidebarOpen);
            }
          }}
          unreadNotifications={getUnreadNotificationsCount()}
        />
        
        <div className="dashboard-content">
          <AdminSidebar 
            isOpen={sidebarOpen} 
            onClose={() => {
              // Only close on mobile
              if (window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
            activeView={activeView}
            onViewChange={handleViewChange}
            unreadNotifications={getUnreadNotificationsCount()}
          />
          
          <main className="main-content">
            <div className="content-wrapper">
              <Box sx={{ width: "100%" }}>
                {renderContent()}
              </Box>
            </div>
          </main>
        </div>
        
        <AdminFooter />
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboard;
