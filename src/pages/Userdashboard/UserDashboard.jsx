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
import { Box, Button, ThemeProvider } from '@mui/material';
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
