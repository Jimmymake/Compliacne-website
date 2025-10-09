import React, { useState, useEffect } from 'react';
import './BankDetails.scss';
import { Alert, Snackbar } from '@mui/material';

const BankDetails = () => {
  const [bankList, setBankList] = useState([
    {
      id: 1,
      nameofbank: '',
      swiftcode: '',
      jurisdiction: '',
      settlementcurrency: ''
    }
  ]);

  const [originalData, setOriginalData] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert(prev => ({ ...prev, open: false }));
  };

  // Fetch user data and form status on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch user profile data
        const profileResponse = await fetch('https://complianceapis.mam-laka.com/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          if (userData.forms?.settlmentbankdetails?.settlementbankdetail && userData.forms.settlmentbankdetails.settlementbankdetail.length > 0) {
            setBankList(userData.forms.settlmentbankdetails.settlementbankdetail);
            setOriginalData(userData.forms.settlmentbankdetails.settlementbankdetail);
          }
        }

        // Fetch form status
        const statusResponse = await fetch('https://complianceapis.mam-laka.com/api/user/form-status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          // Set read-only based on completion status - if completed, make it read-only
          setIsReadOnly(statusData.forms?.settlmentbankdetails?.completed || false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle edit mode toggle
  const handleEdit = () => {
    setIsEditing(true);
    setIsReadOnly(false);
  };

  // Handle cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    setIsReadOnly(true);
    if (originalData) {
      setBankList(originalData);
    }
    setErrors({});
  };

  // Helper function to get input props for read-only state
  const getInputProps = () => ({
    readOnly: isReadOnly && !isEditing,
    style: isReadOnly && !isEditing ? { 
      backgroundColor: '#f5f5f5', 
      cursor: 'not-allowed',
      color: '#666'
    } : {}
  });

  const handleInputChange = (bankId, field, value) => {
    if (isReadOnly && !isEditing) return; // Prevent changes in read-only mode
    
    setBankList(prev => prev.map(bank => 
      bank.id === bankId ? { ...bank, [field]: value } : bank
    ));
    
    // Clear error when user starts typing
    if (errors[`${bankId}-${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${bankId}-${field}`]: ''
      }));
    }
  };

  const addBank = () => {
    if (isReadOnly && !isEditing) return; // Prevent adding in read-only mode
    
    const newId = Math.max(...bankList.map(bank => bank.id)) + 1;
    setBankList(prev => [...prev, {
      id: newId,
      nameofbank: '',
      swiftcode: '',
      jurisdiction: '',
      settlementcurrency: ''
    }]);
  };

  const removeBank = (bankId) => {
    if (isReadOnly && !isEditing) return; // Prevent removing in read-only mode
    
    if (bankList.length > 1) {
      setBankList(prev => prev.filter(bank => bank.id !== bankId));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    bankList.forEach(bank => {
      if (!bank.nameofbank.trim()) newErrors[`${bank.id}-nameofbank`] = 'Bank name is required';
      if (!bank.swiftcode.trim()) newErrors[`${bank.id}-swiftcode`] = 'SWIFT code is required';
      if (!bank.jurisdiction.trim()) newErrors[`${bank.id}-jurisdiction`] = 'Jurisdiction is required';
      if (!bank.settlementcurrency.trim()) newErrors[`${bank.id}-settlementcurrency`] = 'Settlement currency is required';
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Transform data to match API structure
        const settlementbankdetail = bankList.map(bank => ({
          nameofbank: bank.nameofbank,
          swiftcode: bank.swiftcode,
          jurisdiction: bank.jurisdiction,
          settlementcurrency: bank.settlementcurrency
        }));

        const payload = {
          merchantid: localStorage.getItem('merchantId') || 'mid1234567890',
          completed: true,
          settlementbankdetail: settlementbankdetail
        };

        // Use PUT for updates, POST for new submissions
        const method = originalData ? 'PUT' : 'POST';
        const response = await fetch('https://complianceapis.mam-laka.com/api/settlementbank', {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Bank details submitted successfully:', result);
          const successMessage = originalData ? "Bank details updated and submitted successfully!" : "Bank details submitted successfully!";
          setAlert({
            open: true,
            message: successMessage,
            severity: "success"
          });
          
          // Update original data and set to read-only after successful save
          setOriginalData(bankList);
          setIsReadOnly(true);
          setIsEditing(false);
        } else {
          console.error('Failed to submit bank details:', response.statusText);
          setAlert({
            open: true,
            message: "Failed to submit bank details. Please try again.",
            severity: "error"
          });
        }
      } catch (error) {
        console.error('Error submitting bank details:', error);
        setAlert({
          open: true,
          message: "Network error. Please check your connection and try again.",
          severity: "error"
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bank-details-form">
        <div className="form-header">
          <h2>Bank Details</h2>
          <p>Loading your data...</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-details-form">
      <div className="form-header">
        <h2>Bank Details {bankList.length > 1 ? bankList.findIndex(bank => bank.id === bankList[0].id) + 1 : 1}</h2>
        <p>Please provide your banking information</p>
        {isReadOnly && !isEditing && (
          <div style={{ 
            color: '#4caf50', 
            fontSize: '1rem', 
            marginTop: '0.5rem',
            fontWeight: 'bold',
            backgroundColor: '#e8f5e8',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '1px solid #4caf50',
            display: 'inline-block'
          }}>
            ✓ SUBMITTED - Form completed successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="kyc-form">
        {bankList.map((bank, index) => (
          <div key={bank.id} className="bank-section">
            {bankList.length > 1 && (
              <div className="bank-header">
                <h3>Bank {index + 1}</h3>
                <button 
                  type="button" 
                  className="remove-bank-btn"
                  onClick={() => removeBank(bank.id)}
                >
                  Remove
                </button>
              </div>
            )}
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor={`nameofbank-${bank.id}`}>Name of Bank *</label>
                <input
                  type="text"
                  id={`nameofbank-${bank.id}`}
                  value={bank.nameofbank}
                  onChange={(e) => handleInputChange(bank.id, 'nameofbank', e.target.value)}
                  placeholder="Enter name of the Bank"
                  className={errors[`${bank.id}-nameofbank`] ? 'error' : ''}
                />
                {errors[`${bank.id}-nameofbank`] && <span className="error-message">{errors[`${bank.id}-nameofbank`]}</span>}
              </div>

              <div className="form-group">
                <label htmlFor={`swiftcode-${bank.id}`}>SWIFT Code *</label>
                <input
                  type="text"
                  id={`swiftcode-${bank.id}`}
                  value={bank.swiftcode}
                  onChange={(e) => handleInputChange(bank.id, 'swiftcode', e.target.value)}
                  placeholder="Enter swiftcode"
                  className={errors[`${bank.id}-swiftcode`] ? 'error' : ''}
                />
                {errors[`${bank.id}-swiftcode`] && <span className="error-message">{errors[`${bank.id}-swiftcode`]}</span>}
              </div>

              <div className="form-group">
                <label htmlFor={`jurisdiction-${bank.id}`}>Jurisdiction *</label>
                <input
                  type="text"
                  id={`jurisdiction-${bank.id}`}
                  value={bank.jurisdiction}
                  onChange={(e) => handleInputChange(bank.id, 'jurisdiction', e.target.value)}
                  placeholder="Enter Jurisdiction"
                  className={errors[`${bank.id}-jurisdiction`] ? 'error' : ''}
                />
                {errors[`${bank.id}-jurisdiction`] && <span className="error-message">{errors[`${bank.id}-jurisdiction`]}</span>}
              </div>

              <div className="form-group">
                <label htmlFor={`settlementcurrency-${bank.id}`}>Settlement Currency *</label>
                <input
                  type="text"
                  id={`settlementcurrency-${bank.id}`}
                  value={bank.settlementcurrency}
                  onChange={(e) => handleInputChange(bank.id, 'settlementcurrency', e.target.value)}
                  placeholder="Enter Settlement Currency"
                  className={errors[`${bank.id}-settlementcurrency`] ? 'error' : ''}
                />
                {errors[`${bank.id}-settlementcurrency`] && <span className="error-message">{errors[`${bank.id}-settlementcurrency`]}</span>}
              </div>
            </div>
          </div>
        ))}

        <div className="add-bank-section">
          <button type="button" className="add-bank-btn" onClick={addBank}>
            <span className="plus-icon">+</span>
            Add Bank Details
          </button>
        </div>

        <div className="form-actions">
          {isReadOnly && !isEditing ? (
            <button type="button" onClick={handleEdit} className="btn-secondary">
              Update
            </button>
          ) : (
            <>
              {isEditing && (
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              )}
              <button type="submit" className="btn-primary">
                {originalData ? 'Update & Continue' : 'Save & Continue'}
              </button>
            </>
          )}
        </div>
      </form>
      
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          zIndex: 9999, // Ensure it appears above the header (header is typically z-index 1200)
          '& .MuiSnackbar-root': {
            zIndex: 9999
          }
        }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          sx={{ 
            width: '100%',
            zIndex: 9999,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default BankDetails;
