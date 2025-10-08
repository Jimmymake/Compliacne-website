import React, { useState } from 'react';
import { Box, Typography, Button, Stepper, Step, StepLabel, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import './MerchantDetail.scss';

const MerchantDetail = ({ merchant, onBack }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvalReason, setApprovalReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  const steps = [
    'Company Information',
    'Ultimate Beneficial Owner',
    'Payment Information',
    'Bank Details',
    'Risk Management',
    'KYC Documents'
  ];

  // Get real step statuses from merchant data
  const getStepStatuses = () => {
    if (!merchant.fullUserData) return [];
    
    const completionSummary = merchant.fullUserData.completionSummary;
    const stepKeys = ['companyinformation', 'ubo', 'paymentandprosessing', 'settlmentbankdetails', 'riskmanagement', 'kycdocs'];
    
    return stepKeys.map(key => ({
      completed: completionSummary[key] || false,
      status: completionSummary[key] ? 'completed' : 'pending'
    }));
  };

  const stepStatuses = getStepStatuses();

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
    if (!merchant.fullUserData?.completionSummary) {
      return 'pending';
    }
    
    const completionSummary = merchant.fullUserData.completionSummary;
    const stepKeys = ['companyinformation', 'ubo', 'paymentandprosessing', 'settlmentbankdetails', 'riskmanagement', 'kycdocs'];
    const stepKey = stepKeys[stepIndex];
    
    if (completionSummary[stepKey]) {
      return 'completed';
    } else {
      return 'pending';
    }
  };

  const getActiveStep = () => {
    if (!merchant.fullUserData?.completionSummary) {
      return 0;
    }
    
    const completionSummary = merchant.fullUserData.completionSummary;
    const stepKeys = ['companyinformation', 'ubo', 'paymentandprosessing', 'settlmentbankdetails', 'riskmanagement', 'kycdocs'];
    
    // Find the last completed step
    let lastCompletedIndex = -1;
    for (let i = 0; i < stepKeys.length; i++) {
      if (completionSummary[stepKeys[i]]) {
        lastCompletedIndex = i;
      }
    }
    
    // Return the next step after the last completed one, or 0 if none completed
    return lastCompletedIndex + 1;
  };

  const getProgressPercentage = () => {
    if (!merchant.fullUserData?.completionSummary) {
      return 0;
    }
    
    const completionSummary = merchant.fullUserData.completionSummary;
    const completed = Object.values(completionSummary).filter(Boolean).length;
    const total = Object.keys(completionSummary).length;
    return Math.round((completed / total) * 100);
  };

  // Check if all required documents are completed for approval
  const isAllDocumentsCompleted = () => {
    if (!merchant.fullUserData?.completionSummary) {
      return false;
    }
    
    const completionSummary = merchant.fullUserData.completionSummary;
    const requiredSteps = [
      'companyinformation',
      'ubo', 
      'paymentandprosessing',
      'settlmentbankdetails',
      'riskmanagement',
      'kycdocs'
    ];
    
    // Check if all required steps are completed (true)
    return requiredSteps.every(step => completionSummary[step] === true);
  };

  // Helper function to render data with different colors
  const renderDataWithColors = (data, fallbackText = 'No data submitted') => {
    const hasData = data && data !== 'N/A' && data !== '';
    return (
      <span style={{ 
        color: hasData ? '#2e7d32' : '#9e9e9e', // Green for data, gray for no data
        fontWeight: hasData ? '500' : '400'
      }}>
        {data || fallbackText}
      </span>
    );
  };

  // Helper function to render document links
  const renderDocumentLink = (documentName) => {
    const hasDocument = documentName && documentName !== 'N/A' && documentName !== '';
    
    if (!hasDocument) {
      return (
        <span style={{ 
          color: '#9e9e9e',
          fontWeight: '400'
        }}>
          No data submitted
        </span>
      );
    }

    // Check if it's a URL or just a filename
    const isUrl = documentName.startsWith('http') || documentName.startsWith('https');
    
    return (
      <a 
        href={isUrl ? documentName : `#`} 
        target={isUrl ? "_blank" : "_self"}
        rel={isUrl ? "noopener noreferrer" : ""}
        style={{ 
          color: '#2e7d32',
          fontWeight: '500',
          textDecoration: 'underline',
          cursor: 'pointer'
        }}
        onClick={(e) => {
          if (!isUrl) {
            e.preventDefault();
            // Handle file download or preview logic here
            console.log('Download document:', documentName);
          }
        }}
      >
        {documentName}
      </a>
    );
  };

  // Helper function to render website links
  const renderWebsiteLinks = (websites) => {
    if (!websites || !Array.isArray(websites) || websites.length === 0) {
      return (
        <span style={{ 
          color: '#9e9e9e',
          fontWeight: '400'
        }}>
          No data submitted
        </span>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {websites.map((website, index) => (
          <a 
            key={index}
            href={website} 
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              color: '#2e7d32',
              fontWeight: '500',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            {website}
          </a>
        ))}
      </div>
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(getRealStepData());
  };

  const handleSave = () => {
    // Here you would typically save the data to your backend
    console.log('Saving edited data:', editedData);
    setIsEditing(false);
    // You could also call an onSave prop here to update the parent component
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleApproveDialogClose = () => {
    setApproveDialogOpen(false);
    setApprovalReason('');
    setApprovalNotes('');
  };

  const handleRejectDialogClose = () => {
    setRejectDialogOpen(false);
    setRejectionReason('');
    setRejectionNotes('');
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      // API call to approve the merchant
      const token = localStorage.getItem('token');
      const merchantId = merchant.id || merchant.fullUserData?.user?.merchantid;
      
      const requestBody = JSON.stringify({
        "reason": approvalReason || "All documents verified and requirements met",
        "notes": approvalNotes || "Approved after thorough review of all compliance documents"
      });

      const response = await fetch(`http://localhost:4000/api/admin/approve-merchant/${merchantId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: requestBody
      });

      if (response.ok) {
        console.log('Merchant approved successfully');
        handleApproveDialogClose();
        
        // Update local state to reflect the approval
        if (merchant.fullUserData?.completionSummary) {
          merchant.fullUserData.completionSummary.approved = true;
          merchant.fullUserData.completionSummary.rejected = false;
          merchant.fullUserData.completionSummary.approvalReason = approvalReason || "All documents verified and requirements met";
          merchant.fullUserData.completionSummary.approvalNotes = approvalNotes || "Approved after thorough review of all compliance documents";
        }
        
        // Update onboarding status
        if (merchant.fullUserData?.user) {
          merchant.fullUserData.user.onboardingStatus = 'approved';
        }
        
        // Navigate back to refresh the list
        onBack();
      } else {
        console.error('Failed to approve merchant');
        alert('Failed to approve merchant. Please try again.');
      }
    } catch (error) {
      console.error('Error approving merchant:', error);
      alert('Error approving merchant. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      // API call to reject the merchant
      const token = localStorage.getItem('token');
      const merchantId = merchant.id || merchant.fullUserData?.user?.merchantid;
      
      const requestBody = JSON.stringify({
        "reason": rejectionReason || "Application does not meet compliance requirements",
        "notes": rejectionNotes || "Rejected due to incomplete or insufficient documentation"
      });

      const response = await fetch(`http://localhost:4000/api/admin/reject-merchant/${merchantId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: requestBody
      });

      if (response.ok) {
        console.log('Merchant rejected successfully');
        handleRejectDialogClose();
        
        // Update local state to reflect the rejection
        if (merchant.fullUserData?.completionSummary) {
          merchant.fullUserData.completionSummary.approved = false;
          merchant.fullUserData.completionSummary.rejected = true;
          merchant.fullUserData.completionSummary.approvalReason = rejectionReason || "Application does not meet compliance requirements";
          merchant.fullUserData.completionSummary.approvalNotes = rejectionNotes || "Rejected due to incomplete or insufficient documentation";
        }
        
        // Update onboarding status
        if (merchant.fullUserData?.user) {
          merchant.fullUserData.user.onboardingStatus = 'rejected';
        }
        
        // Navigate back to refresh the list
        onBack();
      } else {
        console.error('Failed to reject merchant');
        alert('Failed to reject merchant. Please try again.');
      }
    } catch (error) {
      console.error('Error rejecting merchant:', error);
      alert('Error rejecting merchant. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Extract real data from the merchant's API data
  const getRealStepData = () => {
    const userData = merchant.fullUserData;
    console.log('Bank Details Data:', userData.settlmentbankdetails);
    
    return {
      companyInfo: {
        companyName: userData.companyinformation?.companyName || userData.user.fullname,
        merchantUrls: userData.companyinformation?.merchantUrls,
        dateOfIncorporation: userData.companyinformation?.dateOfIncorporation,
        incorporationNumber: userData.companyinformation?.incorporationNumber,
        countryOfIncorporation: userData.companyinformation?.countryOfIncorporation,
        companyEmail: userData.companyinformation?.companyEmail || userData.user.email,
        contactPerson: {
          fullName: userData.companyinformation?.contactPerson?.fullName,
          phone: userData.companyinformation?.contactPerson?.phone,
          email: userData.companyinformation?.contactPerson?.email
        },
        businessDescription: userData.companyinformation?.businessDescription,
        sourceOfFunds: userData.companyinformation?.sourceOfFunds,
        purpose: userData.companyinformation?.purpose,
        licensingRequired: userData.companyinformation?.licensingRequired,
        licenseInfo: {
          licencenumber: userData.companyinformation?.licenseInfo?.licencenumber,
          licencetype: userData.companyinformation?.licenseInfo?.licencetype,
          jurisdiction: userData.companyinformation?.licenseInfo?.jurisdiction
        },
        bankname: userData.companyinformation?.bankname,
        swiftcode: userData.companyinformation?.swiftcode,
        targetCountries: userData.companyinformation?.targetCountries,
        topCountries: userData.companyinformation?.topCountries,
        previouslyUsedGateways: userData.companyinformation?.previouslyUsedGateways
      },
      ubo: userData.ubo?.ubo || [],
      paymentInfo: {
        requredcurrency: userData.paymentandprosessing?.requredcurrency || { USD: false, EUR: false, GBP: false },
        exmonthlytransaction: userData.paymentandprosessing?.exmonthlytransaction || { amountinusd: 0, numberoftran: 0 },
        avgtranssize: userData.paymentandprosessing?.avgtranssize || 0,
        paymentmethodtobesupported: userData.paymentandprosessing?.paymentmethodtobesupported || { credit: false, mobilemoney: false, other: '' },
        chargebackrefungrate: userData.paymentandprosessing?.chargebackrefungrate || 'N/A'
      },
      bankDetails: (() => {
        const bankData = userData.settlmentbankdetails;
        if (!bankData) return [];
        
        // Handle different possible structures
        if (Array.isArray(bankData)) {
          return bankData;
        } else if (bankData.settlementbankdetail && Array.isArray(bankData.settlementbankdetail)) {
          return bankData.settlementbankdetail;
        } else if (bankData.settlementbankdetails && Array.isArray(bankData.settlementbankdetails)) {
          return bankData.settlementbankdetails;
        }
        
        return [];
      })(),
      riskManagement: {
        amlpolicy: userData.riskmanagement?.amlpolicy || false,
        officerdetails: userData.riskmanagement?.officerdetails || { fullname: 'N/A', telephonenumber: 'N/A', email: 'N/A' },
        historyofregulatoryfine: userData.riskmanagement?.historyofregulatoryfine || false,
        hereaboutus: userData.riskmanagement?.hereaboutus || 'N/A',
        indroducer: userData.riskmanagement?.indroducer || null
      },
      kycDocuments: {
        certincorporation: userData.kycdocs?.certincorporation || 'N/A',
        cr2forpatnership: userData.kycdocs?.cr2forpatnership || 'N/A',
        cr2forshareholders: userData.kycdocs?.cr2forshareholders || 'N/A',
        kracert: userData.kycdocs?.kracert || 'N/A',
        bankstatement: userData.kycdocs?.bankstatement || 'N/A',
        passportids: userData.kycdocs?.passportids || 'N/A',
        shareholderpassportid: userData.kycdocs?.shareholderpassportid || 'N/A',
        websiteipadress: userData.kycdocs?.websiteipadress || [],
        proofofbomain: userData.kycdocs?.proofofbomain || 'N/A',
        proofofadress: userData.kycdocs?.proofofadress || 'N/A'
      }
    };
  };

  const renderStepContent = (stepIndex) => {
    const currentData = isEditing ? editedData : getRealStepData();
    const stepStatus = stepStatuses[stepIndex];
    
    switch (stepIndex) {
      case 0:
        return (
          <div className="step-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h4>Company Information</h4>
              {stepStatus.completed && (
                <div style={{ 
                  color: '#4caf50', 
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  backgroundColor: '#e8f5e8',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #4caf50',
                  display: 'inline-block'
                }}>
                  ✓ SUBMITTED
                </div>
              )}
            </div>
            <div className="data-grid">
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Company Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.companyInfo?.companyName || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'companyName', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.companyName)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Merchant URLs:</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={currentData.companyInfo?.merchantUrls || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'merchantUrls', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.merchantUrls)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Date of Incorporation:</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={currentData.companyInfo?.dateOfIncorporation || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'dateOfIncorporation', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.dateOfIncorporation)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Incorporation Number:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.companyInfo?.incorporationNumber || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'incorporationNumber', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.incorporationNumber)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Country of Incorporation:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.companyInfo?.countryOfIncorporation || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'countryOfIncorporation', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.countryOfIncorporation)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Company Email:</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={currentData.companyInfo?.companyEmail || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'companyEmail', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.companyEmail)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Contact Person Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.companyInfo?.contactPerson?.fullName || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'contactPerson', { 
                      ...currentData.companyInfo?.contactPerson, 
                      fullName: e.target.value 
                    })}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.contactPerson?.fullName)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Contact Person Phone:</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={currentData.companyInfo?.contactPerson?.phone || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'contactPerson', { 
                      ...currentData.companyInfo?.contactPerson, 
                      phone: e.target.value 
                    })}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.contactPerson?.phone)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Contact Person Email:</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={currentData.companyInfo?.contactPerson?.email || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'contactPerson', { 
                      ...currentData.companyInfo?.contactPerson, 
                      email: e.target.value 
                    })}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.contactPerson?.email)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Business Description:</label>
                {isEditing ? (
                  <textarea
                    value={currentData.companyInfo?.businessDescription || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'businessDescription', e.target.value)}
                    className="edit-textarea"
                    rows="3"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.businessDescription)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Source of Funds:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.companyInfo?.sourceOfFunds || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'sourceOfFunds', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.sourceOfFunds)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Purpose:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.companyInfo?.purpose || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'purpose', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.purpose)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Licensing Required:</label>
                {isEditing ? (
                  <select
                    value={currentData.companyInfo?.licensingRequired ? 'true' : 'false'}
                    onChange={(e) => handleInputChange('companyInfo', 'licensingRequired', e.target.value === 'true')}
                    className="edit-input"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span style={{ 
                    color: currentData.companyInfo?.licensingRequired !== undefined ? '#2e7d32' : '#9e9e9e',
                    fontWeight: currentData.companyInfo?.licensingRequired !== undefined ? '500' : '400'
                  }}>
                    {currentData.companyInfo?.licensingRequired !== undefined 
                      ? (currentData.companyInfo.licensingRequired ? 'Yes' : 'No')
                      : 'No data submitted'
                    }
                  </span>
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>License Number:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.companyInfo?.licenseInfo?.licencenumber || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'licenseInfo', { 
                      ...currentData.companyInfo?.licenseInfo, 
                      licencenumber: e.target.value 
                    })}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.licenseInfo?.licencenumber)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>License Type:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.companyInfo?.licenseInfo?.licencetype || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'licenseInfo', { 
                      ...currentData.companyInfo?.licenseInfo, 
                      licencetype: e.target.value 
                    })}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.licenseInfo?.licencetype)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>License Jurisdiction:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.companyInfo?.licenseInfo?.jurisdiction || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'licenseInfo', { 
                      ...currentData.companyInfo?.licenseInfo, 
                      jurisdiction: e.target.value 
                    })}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.licenseInfo?.jurisdiction)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Bank Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.companyInfo?.bankname || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'bankname', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.bankname)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>SWIFT Code:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.companyInfo?.swiftcode || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'swiftcode', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.swiftcode)
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Target Countries:</label>
                {isEditing ? (
                  <textarea
                    value={currentData.companyInfo?.targetCountries?.map(tc => `${tc.region}: ${tc.percent}%`).join(', ') || ''}
                    onChange={(e) => {
                      // This would need more complex handling for editing arrays
                      console.log('Target countries editing not implemented yet');
                    }}
                    className="edit-textarea"
                    rows="2"
                  />
                ) : (
                  <span style={{ 
                    color: currentData.companyInfo?.targetCountries?.length > 0 ? '#2e7d32' : '#9e9e9e',
                    fontWeight: currentData.companyInfo?.targetCountries?.length > 0 ? '500' : '400'
                  }}>
                    {currentData.companyInfo?.targetCountries?.length > 0 
                      ? currentData.companyInfo.targetCountries.map(tc => `${tc.region}: ${tc.percent}%`).join(', ')
                      : 'No data submitted'
                    }
                  </span>
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Top Countries:</label>
                {isEditing ? (
                  <textarea
                    value={currentData.companyInfo?.topCountries?.join(', ') || ''}
                    onChange={(e) => {
                      // This would need more complex handling for editing arrays
                      console.log('Top countries editing not implemented yet');
                    }}
                    className="edit-textarea"
                    rows="2"
                  />
                ) : (
                  <span style={{ 
                    color: currentData.companyInfo?.topCountries?.length > 0 ? '#2e7d32' : '#9e9e9e',
                    fontWeight: currentData.companyInfo?.topCountries?.length > 0 ? '500' : '400'
                  }}>
                    {currentData.companyInfo?.topCountries?.length > 0 
                      ? currentData.companyInfo.topCountries.join(', ')
                      : 'No data submitted'
                    }
                  </span>
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Previously Used Gateways:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentData.companyInfo?.previouslyUsedGateways || ''}
                    onChange={(e) => handleInputChange('companyInfo', 'previouslyUsedGateways', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  renderDataWithColors(currentData.companyInfo?.previouslyUsedGateways)
                )}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="step-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h4>Ultimate Beneficial Owner</h4>
              {stepStatus.completed && (
                <div style={{ 
                  color: '#4caf50', 
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  backgroundColor: '#e8f5e8',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #4caf50',
                  display: 'inline-block'
                }}>
                  ✓ SUBMITTED
                </div>
              )}
            </div>
            {currentData.ubo && currentData.ubo.length > 0 ? (
              currentData.ubo.map((ubo, index) => (
                <div key={index} className="ubo-item">
                  <h5>UBO #{index + 1}</h5>
                  <div className="data-grid">
                    <div className="data-item">
                      <label style={{ color: '#1976d2', fontWeight: '600' }}>Full Name:</label>
                      {renderDataWithColors(ubo.fullname)}
                    </div>
                    <div className="data-item">
                      <label style={{ color: '#1976d2', fontWeight: '600' }}>Nationality:</label>
                      {renderDataWithColors(ubo.nationality)}
                    </div>
                    <div className="data-item">
                      <label style={{ color: '#1976d2', fontWeight: '600' }}>Residential Address:</label>
                      {renderDataWithColors(ubo.residentialadress)}
                    </div>
                    <div className="data-item">
                      <label style={{ color: '#1976d2', fontWeight: '600' }}>Ownership Percentage:</label>
                      {renderDataWithColors(ubo.persentageofownership ? `${ubo.persentageofownership}%` : null)}
                    </div>
                    <div className="data-item">
                      <label style={{ color: '#1976d2', fontWeight: '600' }}>Source of Funds:</label>
                      {renderDataWithColors(ubo.souceoffunds)}
                    </div>
                    <div className="data-item">
                      <label style={{ color: '#1976d2', fontWeight: '600' }}>PEP Status:</label>
                      <span style={{ 
                        color: ubo.pep !== undefined ? '#2e7d32' : '#9e9e9e',
                        fontWeight: ubo.pep !== undefined ? '500' : '400'
                      }}>
                        {ubo.pep !== undefined ? (ubo.pep ? 'Yes' : 'No') : 'No data submitted'}
                      </span>
                    </div>
                    <div className="data-item">
                      <label style={{ color: '#1976d2', fontWeight: '600' }}>PEP Details:</label>
                      {renderDataWithColors(ubo.pepdetails)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                color: '#9e9e9e', 
                fontStyle: 'italic', 
                textAlign: 'center', 
                padding: '2rem',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                border: '1px dashed #ccc'
              }}>
                No UBO data submitted
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h4>Payment Information</h4>
              {stepStatus.completed && (
                <div style={{ 
                  color: '#4caf50', 
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  backgroundColor: '#e8f5e8',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #4caf50',
                  display: 'inline-block'
                }}>
                  ✓ SUBMITTED
                </div>
              )}
            </div>
            <div className="data-grid">
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Required Currencies:</label>
                <span style={{ 
                  color: currentData.paymentInfo.requredcurrency ? '#2e7d32' : '#9e9e9e',
                  fontWeight: currentData.paymentInfo.requredcurrency ? '500' : '400'
                }}>
                  {currentData.paymentInfo.requredcurrency ? 
                    Object.entries(currentData.paymentInfo.requredcurrency)
                      .filter(([_, value]) => value === true)
                      .map(([key, _]) => key)
                      .join(', ') + 
                    (currentData.paymentInfo.requredcurrency.other ? 
                      (Object.entries(currentData.paymentInfo.requredcurrency).filter(([_, value]) => value === true).length > 0 ? ', ' : '') + 
                      currentData.paymentInfo.requredcurrency.other : '')
                    : 'No data submitted'
                  }
                </span>
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Expected Monthly Transaction Amount:</label>
                {renderDataWithColors(
                  currentData.paymentInfo.exmonthlytransaction?.amountinusd ? 
                    `$${currentData.paymentInfo.exmonthlytransaction.amountinusd.toLocaleString()}` : null
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Number of Transactions:</label>
                {renderDataWithColors(currentData.paymentInfo.exmonthlytransaction?.numberoftran)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Average Transaction Size:</label>
                {renderDataWithColors(
                  currentData.paymentInfo.avgtranssize ? 
                    `$${currentData.paymentInfo.avgtranssize}` : null
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Payment Methods:</label>
                <span style={{ 
                  color: currentData.paymentInfo.paymentmethodtobesupported ? '#2e7d32' : '#9e9e9e',
                  fontWeight: currentData.paymentInfo.paymentmethodtobesupported ? '500' : '400'
                }}>
                  {currentData.paymentInfo.paymentmethodtobesupported ? 
                    Object.entries(currentData.paymentInfo.paymentmethodtobesupported)
                      .filter(([_, value]) => value === true)
                      .map(([key, _]) => key)
                      .join(', ') + 
                    (currentData.paymentInfo.paymentmethodtobesupported.other ? 
                      (Object.entries(currentData.paymentInfo.paymentmethodtobesupported).filter(([_, value]) => value === true).length > 0 ? ', ' : '') + 
                      currentData.paymentInfo.paymentmethodtobesupported.other : '')
                    : 'No data submitted'
                  }
                </span>
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Chargeback/Refund Rate:</label>
                {renderDataWithColors(currentData.paymentInfo.chargebackrefungrate)}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h4>Bank Details</h4>
              {stepStatus.completed && (
                <div style={{ 
                  color: '#4caf50', 
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  backgroundColor: '#e8f5e8',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #4caf50',
                  display: 'inline-block'
                }}>
                  ✓ SUBMITTED
                </div>
              )}
            </div>
            {currentData.bankDetails && currentData.bankDetails.length > 0 ? (
              currentData.bankDetails.map((bank, index) => (
                <div key={index} className="bank-item">
                  <h5>Bank #{index + 1}</h5>
                  <div className="data-grid">
                    <div className="data-item">
                      <label style={{ color: '#1976d2', fontWeight: '600' }}>Bank Name:</label>
                      {renderDataWithColors(bank.nameofbank)}
                    </div>
                    <div className="data-item">
                      <label style={{ color: '#1976d2', fontWeight: '600' }}>SWIFT Code:</label>
                      {renderDataWithColors(bank.swiftcode)}
                    </div>
                    <div className="data-item">
                      <label style={{ color: '#1976d2', fontWeight: '600' }}>Jurisdiction:</label>
                      {renderDataWithColors(bank.jurisdiction)}
                    </div>
                    <div className="data-item">
                      <label style={{ color: '#1976d2', fontWeight: '600' }}>Settlement Currency:</label>
                      {renderDataWithColors(bank.settlementcurrency)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                color: '#9e9e9e', 
                fontStyle: 'italic', 
                textAlign: 'center', 
                padding: '2rem',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                border: '1px dashed #ccc'
              }}>
                No bank details submitted
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="step-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h4>Risk Management</h4>
              {stepStatus.completed && (
                <div style={{ 
                  color: '#4caf50', 
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  backgroundColor: '#e8f5e8',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #4caf50',
                  display: 'inline-block'
                }}>
                  ✓ SUBMITTED
                </div>
              )}
            </div>
            <div className="data-grid">
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>AML Policy:</label>
                <span style={{ 
                  color: currentData.riskManagement.amlpolicy !== undefined ? '#2e7d32' : '#9e9e9e',
                  fontWeight: currentData.riskManagement.amlpolicy !== undefined ? '500' : '400'
                }}>
                  {currentData.riskManagement.amlpolicy !== undefined 
                    ? (currentData.riskManagement.amlpolicy ? 'Yes' : 'No')
                    : 'No data submitted'
                  }
                </span>
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Officer Name:</label>
                {renderDataWithColors(currentData.riskManagement.officerdetails.fullname)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Officer Phone:</label>
                {renderDataWithColors(currentData.riskManagement.officerdetails.telephonenumber)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Officer Email:</label>
                {renderDataWithColors(currentData.riskManagement.officerdetails.email)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Regulatory Fine History:</label>
                <span style={{ 
                  color: currentData.riskManagement.historyofregulatoryfine !== undefined ? '#2e7d32' : '#9e9e9e',
                  fontWeight: currentData.riskManagement.historyofregulatoryfine !== undefined ? '500' : '400'
                }}>
                  {currentData.riskManagement.historyofregulatoryfine !== undefined 
                    ? (currentData.riskManagement.historyofregulatoryfine ? 'Yes' : 'No')
                    : 'No data submitted'
                  }
                </span>
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>How did you hear about us:</label>
                {renderDataWithColors(currentData.riskManagement.hereaboutus)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Introducer Name:</label>
                {renderDataWithColors(currentData.riskManagement.indroducer?.name)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Introducer Position:</label>
                {renderDataWithColors(currentData.riskManagement.indroducer?.position)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Introducer Date:</label>
                {renderDataWithColors(currentData.riskManagement.indroducer?.date ? 
                  new Date(currentData.riskManagement.indroducer.date).toLocaleDateString() : null
                )}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Introducer Signature:</label>
                {renderDataWithColors(currentData.riskManagement.indroducer?.signature)}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="step-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h4>KYC Documents</h4>
              {stepStatus.completed && (
                <div style={{ 
                  color: '#4caf50', 
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  backgroundColor: '#e8f5e8',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #4caf50',
                  display: 'inline-block'
                }}>
                  ✓ SUBMITTED
                </div>
              )}
            </div>
            <div className="data-grid">
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Certificate of Incorporation:</label>
                {renderDocumentLink(currentData.kycDocuments.certincorporation)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>CR2 for Partnership:</label>
                {renderDocumentLink(currentData.kycDocuments.cr2forpatnership)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>CR2 for Shareholders:</label>
                {renderDocumentLink(currentData.kycDocuments.cr2forshareholders)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>KRA Certificate:</label>
                {renderDocumentLink(currentData.kycDocuments.kracert)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Bank Statement:</label>
                {renderDocumentLink(currentData.kycDocuments.bankstatement)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Passport IDs:</label>
                {renderDocumentLink(currentData.kycDocuments.passportids)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Shareholder Passport ID:</label>
                {renderDocumentLink(currentData.kycDocuments.shareholderpassportid)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Website IP Address:</label>
                {renderWebsiteLinks(currentData.kycDocuments.websiteipadress)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Proof of Domain:</label>
                {renderDocumentLink(currentData.kycDocuments.proofofbomain)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>Proof of Address:</label>
                {renderDocumentLink(currentData.kycDocuments.proofofadress)}
              </div>
              <div className="data-item">
                <label style={{ color: '#1976d2', fontWeight: '600' }}>PEP Form:</label>
                {renderDocumentLink(currentData.kycDocuments.pepform)}
              </div>
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
          <Typography variant="h6">Loading merchant details...</Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
            Please wait while we fetch the merchant information.
          </Typography>
          <Button
            onClick={onBack}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Back to Merchants
          </Button>
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
                Edit Details
              </Button>
              
              {/* Show approve/reject buttons for merchants that are not already approved or rejected */}
              {(() => {
                // Use onboardingStatus first, then fallback to completionSummary
                const onboardingStatus = merchant.fullUserData?.user?.onboardingStatus || merchant.fullUserData?.onboardingStatus;
                
                let isApproved = false;
                let isRejected = false;
                
                if (onboardingStatus === 'approved') {
                  isApproved = true;
                } else if (onboardingStatus === 'rejected') {
                  isRejected = true;
                } else {
                  // Fallback to completionSummary
                  isApproved = merchant.fullUserData?.completionSummary?.approved === true;
                  isRejected = merchant.fullUserData?.completionSummary?.rejected === true;
                }
                
                console.log('Merchant Status Debug:', {
                  onboardingStatus,
                  isApproved,
                  isRejected,
                  completionSummary: merchant.fullUserData?.completionSummary
                });
                
                return !isApproved && !isRejected;
              })() && (
                <>
                  <Button
                    onClick={() => setApproveDialogOpen(true)}
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    disabled={!isAllDocumentsCompleted()}
                    sx={{
                      backgroundColor: isAllDocumentsCompleted() ? '#22c55e' : '#6b7280',
                      '&:hover': {
                        backgroundColor: isAllDocumentsCompleted() ? '#16a34a' : '#6b7280'
                      },
                      '&:disabled': {
                        backgroundColor: '#6b7280',
                        color: '#9ca3af'
                      }
                    }}
                    title={!isAllDocumentsCompleted() ? 'All documents must be completed before approval' : 'Approve merchant'}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => setRejectDialogOpen(true)}
                    variant="contained"
                    startIcon={<CancelIcon />}
                    sx={{
                      backgroundColor: '#ef4444',
                      '&:hover': {
                        backgroundColor: '#dc2626'
                      }
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
            </Box>
          )}
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
            <div className="card-value">{getProgressPercentage()}%</div>
          </div>
          <div className="overview-card">
            <div className="card-label">Submitted</div>
            <div className="card-value">{formatDate(merchant.submittedAt)}</div>
          </div>
          <div className="overview-card">
            <div className="card-label">Last Activity</div>
            <div className="card-value">{formatDate(merchant.lastActivity)}</div>
          </div>
          <div className="overview-card">
            <div className="card-label">Status</div>
            <div className="card-value">
              {(() => {
                // Use onboardingStatus first, then fallback to completionSummary
                const onboardingStatus = merchant.fullUserData?.user?.onboardingStatus || merchant.fullUserData?.onboardingStatus;
                const completionSummary = merchant.fullUserData?.completionSummary;
                
                if (onboardingStatus === 'approved') {
                  return (
                    <div>
                      <span style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ APPROVED</span>
                      {completionSummary?.approvalReason && (
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                          <strong>Reason:</strong> {completionSummary.approvalReason}
                        </div>
                      )}
                      {completionSummary?.approvalNotes && (
                        <div style={{ marginTop: '4px', fontSize: '14px', color: '#666' }}>
                          <strong>Notes:</strong> {completionSummary.approvalNotes}
                        </div>
                      )}
                    </div>
                  );
                } else if (onboardingStatus === 'rejected') {
                  return (
                    <div>
                      <span style={{ color: '#f44336', fontWeight: 'bold' }}>✗ REJECTED</span>
                      {completionSummary?.approvalReason && (
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                          <strong>Reason:</strong> {completionSummary.approvalReason}
                        </div>
                      )}
                      {completionSummary?.approvalNotes && (
                        <div style={{ marginTop: '4px', fontSize: '14px', color: '#666' }}>
                          <strong>Notes:</strong> {completionSummary.approvalNotes}
                        </div>
                      )}
                    </div>
                  );
                } else if (onboardingStatus === 'pending') {
                  return <span style={{ color: '#ff9800', fontWeight: 'bold' }}>⏳ PENDING</span>;
                } else {
                  // Fallback to completionSummary
                  if (completionSummary?.approved) {
                    return (
                      <div>
                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ APPROVED</span>
                        {completionSummary?.approvalReason && (
                          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                            <strong>Reason:</strong> {completionSummary.approvalReason}
                          </div>
                        )}
                        {completionSummary?.approvalNotes && (
                          <div style={{ marginTop: '4px', fontSize: '14px', color: '#666' }}>
                            <strong>Notes:</strong> {completionSummary.approvalNotes}
                          </div>
                        )}
                      </div>
                    );
                  } else if (completionSummary?.rejected) {
                    return (
                      <div>
                        <span style={{ color: '#f44336', fontWeight: 'bold' }}>✗ REJECTED</span>
                        {completionSummary?.approvalReason && (
                          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                            <strong>Reason:</strong> {completionSummary.approvalReason}
                          </div>
                        )}
                        {completionSummary?.approvalNotes && (
                          <div style={{ marginTop: '4px', fontSize: '14px', color: '#666' }}>
                            <strong>Notes:</strong> {completionSummary.approvalNotes}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return <span style={{ color: '#ff9800', fontWeight: 'bold' }}>⏳ PENDING</span>;
                  }
                }
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <Typography variant="h6" className="section-title">
          Onboarding Progress
        </Typography>
        <Stepper activeStep={getActiveStep()} orientation="horizontal">
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

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        aria-labelledby="approve-dialog-title"
      >
        <DialogTitle id="approve-dialog-title">
          Approve Merchant
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve <strong>{merchant.name}</strong>? 
            This will change their status to "Approved" and they will be able to access all features.
          </DialogContentText>
          {!isAllDocumentsCompleted() && (
            <DialogContentText sx={{ color: '#f44336', mt: 2, fontWeight: 'bold' }}>
              ⚠️ Warning: Not all required documents are completed. 
              Please ensure all steps (Company Information, UBO, Payment Info, Bank Details, Risk Management, KYC Docs) are completed before approval.
            </DialogContentText>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Reason for Approval"
              value={approvalReason}
              onChange={(e) => setApprovalReason(e.target.value)}
              placeholder="e.g., All documents verified and requirements met"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
            />
            <TextField
              label="Additional Notes"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="e.g., Approved after thorough review of all compliance documents"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleApproveDialogClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={isProcessing || !isAllDocumentsCompleted()}
            startIcon={<CheckCircleIcon />}
            sx={{
              backgroundColor: isAllDocumentsCompleted() ? '#22c55e' : '#6b7280',
              '&:hover': {
                backgroundColor: isAllDocumentsCompleted() ? '#16a34a' : '#6b7280'
              },
              '&:disabled': {
                backgroundColor: '#6b7280',
                color: '#9ca3af'
              }
            }}
          >
            {isProcessing ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        aria-labelledby="reject-dialog-title"
      >
        <DialogTitle id="reject-dialog-title">
          Reject Merchant
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject <strong>{merchant.name}</strong>? 
            This will change their status to "Rejected" and they will not be able to access the system.
          </DialogContentText>
          
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Reason for Rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Application does not meet compliance requirements"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              required
            />
            <TextField
              label="Additional Notes"
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              placeholder="e.g., Rejected due to incomplete or insufficient documentation"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleRejectDialogClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={isProcessing || !rejectionReason.trim()}
            startIcon={<CancelIcon />}
          >
            {isProcessing ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MerchantDetail;


