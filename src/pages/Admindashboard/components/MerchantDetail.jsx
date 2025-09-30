import React, { useState } from 'react';
import { Box, Typography, Button, Stepper, Step, StepLabel, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './MerchantDetail.scss';

const MerchantDetail = ({ merchant, onBack }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Company Information',
    'Ultimate Beneficial Owner',
    'Payment Information',
    'Bank Details',
    'Risk Management',
    'KYC Documents'
  ];

  const stepStatuses = [
    { completed: true, status: 'completed' },
    { completed: true, status: 'completed' },
    { completed: true, status: 'completed' },
    { completed: false, status: 'pending' },
    { completed: false, status: 'pending' },
    { completed: false, status: 'pending' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < merchant.completedSteps) {
      return 'completed';
    } else if (stepIndex === merchant.completedSteps) {
      return 'in_progress';
    } else {
      return 'pending';
    }
  };

  const mockStepData = {
    companyInfo: {
      companyName: merchant.companyInfo?.companyName || 'Acme Corporation',
      countryOfIncorporation: merchant.companyInfo?.countryOfIncorporation || 'US',
      dateOfIncorporation: merchant.companyInfo?.dateOfIncorporation || '2020-01-15',
      incorporationNumber: '123456',
      companyEmail: 'admin@acme.com',
      contactPerson: {
        fullName: 'John Doe',
        phone: '+1-555-0123',
        email: 'john.doe@acme.com'
      },
      businessDescription: 'Technology solutions provider',
      sourceOfFunds: 'Business operations',
      licensingRequired: false
    },
    ubo: [
      {
        fullname: 'Alice Smith',
        nationality: 'American',
        residentialadress: 'New York, NY',
        persentageofownership: '60',
        souceoffunds: 'Business profits',
        pep: false
      }
    ],
    paymentInfo: {
      requredcurrency: {
        USD: true,
        EUR: false,
        GBP: false
      },
      exmonthlytransaction: {
        amountinusd: 50000,
        numberoftran: 120
      },
      avgtranssize: 250,
      paymentmethodtobesupported: {
        credit: true,
        mobilemoney: false,
        other: 'Bank Transfer'
      }
    },
    bankDetails: [
      {
        nameofbank: 'Chase Bank',
        swiftcode: 'CHASUS33XXX',
        jurisdiction: 'United States',
        settlementcurrency: 'USD'
      }
    ],
    riskManagement: {
      amlpolicy: true,
      officerdetails: {
        fullname: 'Jane Smith',
        telephonenumber: '+1-555-0456',
        email: 'jane.smith@acme.com'
      },
      historyofregulatoryfine: false,
      hereaboutus: 'Online search'
    },
    kycDocuments: {
      certincorporation: 'uploaded',
      bankstatement: 'uploaded',
      passportids: 'uploaded',
      proofofadress: 'pending'
    }
  };

  const renderStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <div className="step-content">
            <h4>Company Information</h4>
            <div className="data-grid">
              <div className="data-item">
                <label>Company Name:</label>
                <span>{mockStepData.companyInfo.companyName}</span>
              </div>
              <div className="data-item">
                <label>Country of Incorporation:</label>
                <span>{mockStepData.companyInfo.countryOfIncorporation}</span>
              </div>
              <div className="data-item">
                <label>Date of Incorporation:</label>
                <span>{mockStepData.companyInfo.dateOfIncorporation}</span>
              </div>
              <div className="data-item">
                <label>Incorporation Number:</label>
                <span>{mockStepData.companyInfo.incorporationNumber}</span>
              </div>
              <div className="data-item">
                <label>Company Email:</label>
                <span>{mockStepData.companyInfo.companyEmail}</span>
              </div>
              <div className="data-item">
                <label>Contact Person:</label>
                <span>{mockStepData.companyInfo.contactPerson.fullName}</span>
              </div>
              <div className="data-item">
                <label>Business Description:</label>
                <span>{mockStepData.companyInfo.businessDescription}</span>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="step-content">
            <h4>Ultimate Beneficial Owner</h4>
            {mockStepData.ubo.map((ubo, index) => (
              <div key={index} className="ubo-item">
                <h5>UBO #{index + 1}</h5>
                <div className="data-grid">
                  <div className="data-item">
                    <label>Full Name:</label>
                    <span>{ubo.fullname}</span>
                  </div>
                  <div className="data-item">
                    <label>Nationality:</label>
                    <span>{ubo.nationality}</span>
                  </div>
                  <div className="data-item">
                    <label>Residential Address:</label>
                    <span>{ubo.residentialadress}</span>
                  </div>
                  <div className="data-item">
                    <label>Ownership Percentage:</label>
                    <span>{ubo.persentageofownership}%</span>
                  </div>
                  <div className="data-item">
                    <label>Source of Funds:</label>
                    <span>{ubo.souceoffunds}</span>
                  </div>
                  <div className="data-item">
                    <label>PEP Status:</label>
                    <span>{ubo.pep ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h4>Payment Information</h4>
            <div className="data-grid">
              <div className="data-item">
                <label>Required Currencies:</label>
                <span>{Object.entries(mockStepData.paymentInfo.requredcurrency)
                  .filter(([_, value]) => value)
                  .map(([key, _]) => key)
                  .join(', ')}</span>
              </div>
              <div className="data-item">
                <label>Expected Monthly Transaction Amount:</label>
                <span>${mockStepData.paymentInfo.exmonthlytransaction.amountinusd.toLocaleString()}</span>
              </div>
              <div className="data-item">
                <label>Number of Transactions:</label>
                <span>{mockStepData.paymentInfo.exmonthlytransaction.numberoftran}</span>
              </div>
              <div className="data-item">
                <label>Average Transaction Size:</label>
                <span>${mockStepData.paymentInfo.avgtranssize}</span>
              </div>
              <div className="data-item">
                <label>Payment Methods:</label>
                <span>{Object.entries(mockStepData.paymentInfo.paymentmethodtobesupported)
                  .filter(([_, value]) => value)
                  .map(([key, _]) => key)
                  .join(', ')}</span>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h4>Bank Details</h4>
            {mockStepData.bankDetails.map((bank, index) => (
              <div key={index} className="bank-item">
                <h5>Bank #{index + 1}</h5>
                <div className="data-grid">
                  <div className="data-item">
                    <label>Bank Name:</label>
                    <span>{bank.nameofbank}</span>
                  </div>
                  <div className="data-item">
                    <label>SWIFT Code:</label>
                    <span>{bank.swiftcode}</span>
                  </div>
                  <div className="data-item">
                    <label>Jurisdiction:</label>
                    <span>{bank.jurisdiction}</span>
                  </div>
                  <div className="data-item">
                    <label>Settlement Currency:</label>
                    <span>{bank.settlementcurrency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="step-content">
            <h4>Risk Management</h4>
            <div className="data-grid">
              <div className="data-item">
                <label>AML Policy:</label>
                <span>{mockStepData.riskManagement.amlpolicy ? 'Yes' : 'No'}</span>
              </div>
              <div className="data-item">
                <label>Officer Name:</label>
                <span>{mockStepData.riskManagement.officerdetails.fullname}</span>
              </div>
              <div className="data-item">
                <label>Officer Phone:</label>
                <span>{mockStepData.riskManagement.officerdetails.telephonenumber}</span>
              </div>
              <div className="data-item">
                <label>Officer Email:</label>
                <span>{mockStepData.riskManagement.officerdetails.email}</span>
              </div>
              <div className="data-item">
                <label>Regulatory Fine History:</label>
                <span>{mockStepData.riskManagement.historyofregulatoryfine ? 'Yes' : 'No'}</span>
              </div>
              <div className="data-item">
                <label>How did you hear about us:</label>
                <span>{mockStepData.riskManagement.hereaboutus}</span>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="step-content">
            <h4>KYC Documents</h4>
            <div className="data-grid">
              {Object.entries(mockStepData.kycDocuments).map(([key, value]) => (
                <div key={key} className="data-item">
                  <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</label>
                  <Chip 
                    label={value === 'uploaded' ? 'Uploaded' : 'Pending'} 
                    color={value === 'uploaded' ? 'success' : 'warning'}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div>No data available</div>;
    }
  };

  if (!merchant) {
    return (
      <Box className="merchant-detail">
        <div className="empty-state">
          <Typography variant="h6">No merchant selected</Typography>
        </div>
      </Box>
    );
  }

  return (
    <Box className="merchant-detail">
      <div className="merchant-header">
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
          Back to Merchants
        </Button>
        
        <div className="merchant-title">
          <Typography variant="h4" className="merchant-name">
            {merchant.name}
          </Typography>
          <Chip 
            label={merchant.status.replace('_', ' ')} 
            color={getStatusColor(merchant.status)}
            size="medium"
          />
        </div>
      </div>

      <div className="merchant-overview">
        <div className="overview-cards">
          <div className="overview-card">
            <div className="card-label">Merchant ID</div>
            <div className="card-value">{merchant.id}</div>
          </div>
          <div className="overview-card">
            <div className="card-label">Email</div>
            <div className="card-value">{merchant.email}</div>
          </div>
          <div className="overview-card">
            <div className="card-label">Progress</div>
            <div className="card-value">{merchant.progress}%</div>
          </div>
          <div className="overview-card">
            <div className="card-label">Submitted</div>
            <div className="card-value">{formatDate(merchant.submittedAt)}</div>
          </div>
          <div className="overview-card">
            <div className="card-label">Last Activity</div>
            <div className="card-value">{formatDate(merchant.lastActivity)}</div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <Typography variant="h6" className="section-title">
          Onboarding Progress
        </Typography>
        <Stepper activeStep={merchant.completedSteps - 1} orientation="horizontal">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <div className="step-label">
                  <span className="step-name">{label}</span>
                  <Chip 
                    label={getStepStatus(index)} 
                    color={getStatusColor(getStepStatus(index))}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </div>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>

      <div className="step-details">
        <Typography variant="h6" className="section-title">
          Step Details
        </Typography>
        <div className="step-navigation">
          {steps.map((step, index) => (
            <button
              key={index}
              className={`step-nav-btn ${activeStep === index ? 'active' : ''}`}
              onClick={() => setActiveStep(index)}
            >
              {step}
            </button>
          ))}
        </div>
        <div className="step-content-container">
          {renderStepContent(activeStep)}
        </div>
      </div>
    </Box>
  );
};

export default MerchantDetail;


