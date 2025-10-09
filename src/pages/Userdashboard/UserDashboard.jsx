import React, { useState, useEffect } from 'react';
import './UserDashboard.scss';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import Footer from '../../components/Footer/Footer';
import CompanyInfo from './components/CompanyInfo';
import UltimateBeneficialOwner from './components/UltimateBeneficialOwner';
import PaymentInfo from './components/PaymentInfo';
import BankDetails from './components/BankDetails';
import RiskManagement from './components/RiskManagement';
import KYCDocuments from './components/KYCDocuments';
import Congratulations from './components/Congratulations';
import { Box, Button, ThemeProvider, Card, CardContent, Typography, Chip, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import theme from '../../theme/theme';

const UserDashboard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    companyInfo: {},
    ubo: [],
    paymentInfo: {},
    bankDetails: [],
    riskManagement: {},
    kycDocuments: {}
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [approvalReason, setApprovalReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  
  // Fetch approval status
  useEffect(() => {
    const fetchApprovalStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch user profile data to get completion summary
        const profileResponse = await fetch('https://complianceapis.mam-laka.com/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          console.log('User profile data for status:', userData);
          
          // Check onboarding status first, then fallback to completion summary
          const onboardingStatus = userData.onboardingStatus || userData.user?.onboardingStatus;
          
          if (onboardingStatus === 'approved') {
            setApprovalStatus('approved');
            // Get reason and notes from completion summary if available
            if (userData.completionSummary) {
              setApprovalReason(userData.completionSummary.approvalReason || '');
              setApprovalNotes(userData.completionSummary.approvalNotes || '');
            }
          } else if (onboardingStatus === 'rejected') {
            setApprovalStatus('rejected');
            // Get reason and notes from completion summary if available
            if (userData.completionSummary) {
              setApprovalReason(userData.completionSummary.approvalReason || '');
              setApprovalNotes(userData.completionSummary.approvalNotes || '');
            }
          } else if (onboardingStatus === 'pending') {
            setApprovalStatus('pending');
          } else {
            // Fallback to completion summary if onboardingStatus is not available
            if (userData.completionSummary) {
              const { approved, rejected, approvalReason, approvalNotes } = userData.completionSummary;
              
              if (approved === true) {
                setApprovalStatus('approved');
                setApprovalReason(approvalReason || '');
                setApprovalNotes(approvalNotes || '');
              } else if (rejected === true) {
                setApprovalStatus('rejected');
                setApprovalReason(approvalReason || '');
                setApprovalNotes(approvalNotes || '');
              } else {
                setApprovalStatus('pending');
              }
            } else {
              setApprovalStatus('pending');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching approval status:', error);
        setApprovalStatus('pending');
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchApprovalStatus();
  }, []);

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

  const steps = [
    "Company Infor",
    "UBO", 
    "Payment Infor",
    "Bank Details",
    "Risk Management Infor",
    "KYC Documents"
  ];

  const stepComponents = [
    <CompanyInfo key="company" />,
    <UltimateBeneficialOwner key="ubo" />,
    <PaymentInfo key="payment" />,
    <BankDetails key="bank" />,
    <RiskManagement key="riskmanagement" />,
    <KYCDocuments key="documents" />
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Render approval status component
  const renderApprovalStatus = () => {
    if (isLoadingStatus) {
      return (
        <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PendingIcon color="action" />
              Loading Status...
            </Typography>
          </CardContent>
        </Card>
      );
    }

    if (!approvalStatus) return null;

    const getStatusConfig = () => {
      switch (approvalStatus) {
        case 'approved':
          return {
            icon: <CheckCircleIcon />,
            color: 'success',
            bgColor: '#e8f5e8',
            text: 'APPROVED',
            message: 'Congratulations! Your application has been approved.',
            details: 'You can now access all features of the platform.'
          };
        case 'rejected':
          return {
            icon: <CancelIcon />,
            color: 'error',
            bgColor: '#ffebee',
            text: 'REJECTED',
            message: 'Your application has been rejected.',
            details: 'Please review the feedback and resubmit your application.'
          };
        case 'pending':
        default:
          return {
            icon: <PendingIcon />,
            color: 'warning',
            bgColor: '#fff3e0',
            text: 'PENDING REVIEW',
            message: '',
            details: 'Ones all Documents are uploaded, our team will review your application.'
          };
      }
    };

    const config = getStatusConfig();

    return (
      <Card sx={{ mb: 3, backgroundColor: config.bgColor, border: `2px solid ${config.color === 'success' ? '#4caf50' : config.color === 'error' ? '#f44336' : '#ff9800'}` }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ color: config.color === 'success' ? '#4caf50' : config.color === 'error' ? '#f44336' : '#ff9800' }}>
              {config.icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: config.color === 'success' ? '#2e7d32' : config.color === 'error' ? '#c62828' : '#ef6c00' }}>
                {config.text}
              </Typography>
              <Typography variant="body1" sx={{ color: config.color === 'success' ? '#2e7d32' : config.color === 'error' ? '#c62828' : '#ef6c00' }}>
                {config.message}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            {config.details}
          </Typography>

          {/* Show reason and notes if available */}
          {(approvalReason || approvalNotes) && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 1 }}>
              {approvalReason && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Reason:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#555' }}>
                    {approvalReason}
                  </Typography>
                </Box>
              )}
              {approvalNotes && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Additional Notes:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#555' }}>
                    {approvalNotes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="user-dashboard">
        <Header 
          currentStep={activeStep + 1} 
          totalSteps={steps.length}
          onMenuClick={() => {
            // Only toggle on mobile
            if (window.innerWidth < 1024) {
              setSidebarOpen(!sidebarOpen);
            }
          }}
        />
        
        <div className="dashboard-content">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => {
              // Only close on mobile
              if (window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
            currentStep={activeStep + 1}
          />
          
          <main className="main-content">
            <div className="content-wrapper">
              {/* Approval Status Component */}
              {renderApprovalStatus()}
              
              <div className="form-container">
                <Box sx={{ width: "100%" }}>
                  {activeStep === steps.length ? (
                    <div className="congratulations-container">
                      <Congratulations />
                    </div>
                  ) : (
                    <React.Fragment>
                      <Box sx={{ mb: 3 }}>
                        {stepComponents[activeStep]}
                      </Box>
                      <div className="step-navigation">
                        <Button
                          color="inherit"
                          disabled={activeStep === 0}
                          onClick={handleBack}
                          sx={{ mr: 1 }}
                        >
                          Back
                        </Button>
                        <Box sx={{ flex: "1 1 auto" }} />
                        <Button 
                          onClick={handleNext}
                          variant="contained"
                        >
                          {activeStep === steps.length - 1 ? "Finished!" : "Next"}
                        </Button>
                      </div>
                    </React.Fragment>
                  )}
                </Box>
              </div>
            </div>
          </main>
        </div>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default UserDashboard;
