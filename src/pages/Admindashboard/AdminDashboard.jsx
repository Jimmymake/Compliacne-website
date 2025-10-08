import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './AdminDashboard.scss';
import AdminHeader from '../../components/AdminHeader/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import AdminFooter from '../../components/AdminFooter/AdminFooter';
import MerchantList from './components/MerchantList';
import MerchantDetail from './components/MerchantDetail';
import AdminDetail from './components/AdminDetail';
import Notifications from './components/Notifications';
import AdminManagement from './components/AdminManagement';
import UserDataGridSimple from './components/UserDataGridSimple';
import { Box, ThemeProvider } from '@mui/material';
import theme from '../../theme/theme';

const AdminDashboard = () => {
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeView, setActiveView] = useState('merchants');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedMerchantForDataGrid, setSelectedMerchantForDataGrid] = useState(null);
  const [merchantListFilter, setMerchantListFilter] = useState('all');
  
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

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4000/api/user/profiles', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Transform API data to merchant format
          const transformedMerchants = transformUsersToMerchants(data.users);
          setMerchants(transformedMerchants);
          
          // Generate notifications based on recent activity
          const generatedNotifications = generateNotifications(data.users);
          setNotifications(generatedNotifications);
        } else {
          console.error('Failed to fetch user profiles');
          // Fallback to empty arrays if API fails
          setMerchants([]);
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty arrays if API fails
        setMerchants([]);
        setNotifications([]);
      }
    };

    fetchData();
  }, []);

  // Handle URL-based merchant selection
  useEffect(() => {
    if (merchantId && merchants.length > 0) {
      const merchant = merchants.find(m => m.id === merchantId);
      if (merchant) {
        setSelectedMerchant(merchant);
        setActiveView('merchant-detail');
      } else {
        // Merchant not found, redirect to merchants list
        navigate('/AdminDashboard');
        setActiveView('merchants');
      }
    } else if (location.pathname === '/AdminDashboard' && !merchantId) {
      // On base dashboard route, show merchants
      setActiveView('merchants');
      setSelectedMerchant(null);
    }
  }, [merchantId, merchants, navigate, location.pathname]);

  // Transform API user data to merchant format
  const transformUsersToMerchants = (users) => {
    return users
      .filter(userData => userData.user.role === 'user' || userData.user.role === 'merchant' || userData.user.role === 'admin') // Include all user types
      .map(userData => {
        const user = userData.user;
        const completionSummary = userData.completionSummary;
        
        // Calculate completion statistics
        const totalSteps = 6;
        const completedSteps = Object.values(completionSummary).filter(Boolean).length;
        const progress = Math.round((completedSteps / totalSteps) * 100);
        
        // Determine status based on completion
        let status;
        if (completedSteps === totalSteps) {
          status = 'completed';
        } else if (completedSteps >= 3) {
          status = 'in_progress';
        } else if (completedSteps > 0) {
          status = 'pending';
        } else {
          status = 'pending';
        }
        
        // Get company name from company information or use fullname as fallback
        const companyName = userData.companyinformation?.companyName || user.fullname;
        
        return {
          id: user.merchantid,
          name: companyName,
          email: user.email,
          role: user.role, // Add role information
          status: user.role === 'admin' ? 'admin' : status, // Admins have special status
          progress: user.role === 'admin' ? 100 : progress, // Admins are considered 100% complete
          completedSteps: user.role === 'admin' ? totalSteps : completedSteps,
          totalSteps: totalSteps,
          submittedAt: user.createdAt,
          lastActivity: user.updatedAt,
          companyInfo: {
            companyName: companyName,
            countryOfIncorporation: userData.companyinformation?.countryOfIncorporation || 'N/A',
            dateOfIncorporation: userData.companyinformation?.dateOfIncorporation || user.createdAt
          },
          // Include full user data for detailed view
          fullUserData: userData
        };
      });
  };

  // Generate notifications based on user activity
  const generateNotifications = (users) => {
    const notifications = [];
    let notificationId = 1;
    
    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    users.forEach(userData => {
      const user = userData.user;
      const createdDate = new Date(user.createdAt);
      const updatedDate = new Date(user.updatedAt);
      
      // New merchant notification
      if (createdDate > sevenDaysAgo && (user.role === 'user' || user.role === 'merchant')) {
        notifications.push({
          id: notificationId++,
          type: 'new_merchant',
          message: `New merchant application from ${userData.companyinformation?.companyName || user.fullname}`,
          timestamp: user.createdAt,
          read: false
        });
      }
      
      // Completion notification
      const completedSteps = Object.values(userData.completionSummary).filter(Boolean).length;
      if (completedSteps === 6 && updatedDate > sevenDaysAgo) {
        notifications.push({
          id: notificationId++,
          type: 'completion',
          message: `${userData.companyinformation?.companyName || user.fullname} completed KYC process`,
          timestamp: user.updatedAt,
          read: false
        });
      }
      
      // Progress notification for significant updates
      if (completedSteps >= 3 && completedSteps < 6 && updatedDate > sevenDaysAgo) {
        notifications.push({
          id: notificationId++,
          type: 'progress',
          message: `${userData.companyinformation?.companyName || user.fullname} updated their application (${completedSteps}/6 steps completed)`,
          timestamp: user.updatedAt,
          read: Math.random() > 0.5 // Randomly mark some as read
        });
      }
    });
    
    // Sort by timestamp (newest first)
    return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const handleMerchantSelect = (merchant) => {
    setSelectedMerchant(merchant);
    setSelectedMerchantForDataGrid(merchant);
    setActiveView('user-management');
  };

  const handleMerchantDetail = (merchant) => {
    navigate(`/AdminDashboard/merchant/${merchant.id}`);
  };

  const handleBackToList = () => {
    navigate('/AdminDashboard');
    setActiveView('merchants');
  };

  const handleBackToAllUsers = () => {
    setSelectedMerchantForDataGrid(null);
    setActiveView('user-management');
  };

  const handleViewChange = (view) => {
    // If we're currently on a merchant detail page and changing views, navigate back to base dashboard
    if (merchantId && view !== 'merchant-detail') {
      navigate('/AdminDashboard');
    }
    setActiveView(view);
    setSelectedMerchant(null);
    if (view !== 'merchants') {
      setMerchantListFilter('all');
    }
  };


  const handleOpenListGrid = (filter, merchant) => {
    // Set the selected merchant for the data grid
    setSelectedMerchantForDataGrid(merchant);
    // Switch to user management view to show the grid
    setActiveView('user-management');
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const renderContent = () => {
    switch (activeView) {
      case 'merchants':
        return <MerchantList merchants={merchants} onMerchantSelect={handleMerchantSelect} onMerchantDetail={handleMerchantDetail} initialFilter={merchantListFilter} onOpenListGrid={handleOpenListGrid} />;
      case 'merchant-detail':
        // Check if the selected merchant is an admin
        if (selectedMerchant && selectedMerchant.role === 'admin') {
          return <AdminDetail admin={selectedMerchant} onBack={handleBackToList} />;
        }
        return <MerchantDetail merchant={selectedMerchant} onBack={handleBackToList} />;
      case 'notifications':
        return <Notifications notifications={notifications} setNotifications={setNotifications} />;
      case 'admin-management':
        return <AdminManagement />;
      case 'user-management':
        return <UserDataGridSimple selectedMerchant={selectedMerchantForDataGrid} onBackToAll={handleBackToAllUsers} />;
      default:
        return <MerchantList merchants={merchants} onMerchantSelect={handleMerchantSelect} onMerchantDetail={handleMerchantDetail} initialFilter={merchantListFilter} onOpenListGrid={handleOpenListGrid} />;
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
