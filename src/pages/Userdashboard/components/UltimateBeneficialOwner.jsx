import React, { useState, useEffect } from 'react';
import './UltimateBeneficialOwner.scss';
import { Alert, Snackbar } from '@mui/material';

const UltimateBeneficialOwner = () => {
  const [uboList, setUboList] = useState([
    {
      id: 1,
      fullname: '',
      nationality: '',
      residentialadress: '',
      persentageofownership: '',
      souceoffunds: '',
      pep: false,
      pepdetails: ''
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
          if (userData.forms?.ubo?.ubo && userData.forms.ubo.ubo.length > 0) {
            setUboList(userData.forms.ubo.ubo);
            setOriginalData(userData.forms.ubo.ubo);
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
          setIsReadOnly(statusData.forms?.ubo?.completed || false);
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
      setUboList(originalData);
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

  const handleInputChange = (uboId, field, value) => {
    if (isReadOnly && !isEditing) return; // Prevent changes in read-only mode
    
    setUboList(prev => prev.map(ubo => 
      ubo.id === uboId ? { ...ubo, [field]: value } : ubo
    ));
    
    // Clear error when user starts typing
    if (errors[`${uboId}-${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${uboId}-${field}`]: ''
      }));
    }
  };

  const addUbo = () => {
    if (isReadOnly && !isEditing) return; // Prevent adding in read-only mode
    
    const newId = Math.max(...uboList.map(ubo => ubo.id)) + 1;
    setUboList(prev => [...prev, {
      id: newId,
      fullname: '',
      nationality: '',
      residentialadress: '',
      persentageofownership: '',
      souceoffunds: '',
      pep: false,
      pepdetails: ''
    }]);
  };

  const removeUbo = (uboId) => {
    if (isReadOnly && !isEditing) return; // Prevent removing in read-only mode
    
    if (uboList.length > 1) {
      setUboList(prev => prev.filter(ubo => ubo.id !== uboId));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    uboList.forEach(ubo => {
      if (!ubo.fullname.trim()) newErrors[`${ubo.id}-fullname`] = 'Full name is required';
      if (!ubo.nationality.trim()) newErrors[`${ubo.id}-nationality`] = 'Nationality is required';
      if (!ubo.residentialadress.trim()) newErrors[`${ubo.id}-residentialadress`] = 'Residential address is required';
      if (!ubo.persentageofownership.trim()) newErrors[`${ubo.id}-persentageofownership`] = 'Percentage of ownership is required';
      if (!ubo.souceoffunds.trim()) newErrors[`${ubo.id}-souceoffunds`] = 'Source of funds is required';
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Transform data to match API structure
        const uboData = uboList.map(ubo => ({
          fullname: ubo.fullname,
          nationality: ubo.nationality,
          residentialadress: ubo.residentialadress,
          persentageofownership: ubo.persentageofownership,
          souceoffunds: ubo.souceoffunds,
          pep: ubo.pep,
          pepdetails: ubo.pepdetails
        }));

        const payload = {
          merchantid: localStorage.getItem('merchantId') || 'mid12345',
          ubo: uboData
        };

        // Use PUT for updates, POST for new submissions
        const method = originalData ? 'PUT' : 'POST';
        const response = await fetch('https://complianceapis.mam-laka.com/api/uboinfo', {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('UBO info submitted successfully:', result);
          const successMessage = originalData ? "UBO information updated successfully!" : "UBO information submitted successfully!";
          setAlert({
            open: true,
            message: successMessage,
            severity: "success"
          });
          
          // Update original data and set to read-only after successful save
          setOriginalData(uboList);
          setIsReadOnly(true);
          setIsEditing(false);
        } else {
          console.error('Failed to submit UBO info:', response.statusText);
          setAlert({
            open: true,
            message: "Failed to submit UBO information. Please try again.",
            severity: "error"
          });
        }
      } catch (error) {
        console.error('Error submitting UBO info:', error);
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
      <div className="ubo-form">
        <div className="form-header">
          <h2>Ultimate Beneficial Owner</h2>
          <p>Loading your data...</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ubo-form">
      <div className="form-header">
        <h2>Ultimate Beneficial Owner {uboList.length > 1 ? uboList.findIndex(ubo => ubo.id === uboList[0].id) + 1 : 1}</h2>
        <p>Please provide details of all ultimate beneficial owners</p>
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
            ✓ SUBMITTED - UBO information completed
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="kyc-form">
        {uboList.map((ubo, index) => (
          <div key={ubo.id} className="ubo-section">
            {uboList.length > 1 && (
              <div className="ubo-header">
                <h3>UBO {index + 1}</h3>
                <button 
                  type="button" 
                  className="remove-ubo-btn"
                  onClick={() => removeUbo(ubo.id)}
                >
                  Remove
                </button>
              </div>
            )}
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor={`fullname-${ubo.id}`}>Full Name *</label>
                <input
                  type="text"
                  id={`fullname-${ubo.id}`}
                  value={ubo.fullname}
                  onChange={(e) => handleInputChange(ubo.id, 'fullname', e.target.value)}
                  placeholder="Enter Full Name"
                  className={errors[`${ubo.id}-fullname`] ? 'error' : ''}
                />
                {errors[`${ubo.id}-fullname`] && <span className="error-message">{errors[`${ubo.id}-fullname`]}</span>}
              </div>

              <div className="form-group">
                <label htmlFor={`nationality-${ubo.id}`}>Nationality *</label>
                <input
                  type="text"
                  id={`nationality-${ubo.id}`}
                  value={ubo.nationality}
                  onChange={(e) => handleInputChange(ubo.id, 'nationality', e.target.value)}
                  placeholder="Enter Nationality"
                  className={errors[`${ubo.id}-nationality`] ? 'error' : ''}
                />
                {errors[`${ubo.id}-nationality`] && <span className="error-message">{errors[`${ubo.id}-nationality`]}</span>}
              </div>

              <div className="form-group">
                <label htmlFor={`residentialadress-${ubo.id}`}>Residential Address *</label>
                <input
                  type="text"
                  id={`residentialadress-${ubo.id}`}
                  value={ubo.residentialadress}
                  onChange={(e) => handleInputChange(ubo.id, 'residentialadress', e.target.value)}
                  placeholder="Enter Residential Address"
                  className={errors[`${ubo.id}-residentialadress`] ? 'error' : ''}
                />
                {errors[`${ubo.id}-residentialadress`] && <span className="error-message">{errors[`${ubo.id}-residentialadress`]}</span>}
              </div>

              <div className="form-group">
                <label htmlFor={`persentageofownership-${ubo.id}`}>Percentage of Ownership *</label>
                <input
                  type="number"
                  id={`persentageofownership-${ubo.id}`}
                  value={ubo.persentageofownership}
                  onChange={(e) => handleInputChange(ubo.id, 'persentageofownership', e.target.value)}
                  placeholder="Enter Percentage of Ownership"
                  min="0"
                  max="100"
                  step="0.01"
                  className={errors[`${ubo.id}-persentageofownership`] ? 'error' : ''}
                />
                {errors[`${ubo.id}-persentageofownership`] && <span className="error-message">{errors[`${ubo.id}-persentageofownership`]}</span>}
              </div>

              <div className="form-group">
                <label htmlFor={`souceoffunds-${ubo.id}`}>Source of Funds *</label>
                <input
                  type="text"
                  id={`souceoffunds-${ubo.id}`}
                  value={ubo.souceoffunds}
                  onChange={(e) => handleInputChange(ubo.id, 'souceoffunds', e.target.value)}
                  placeholder="Enter Source of Funds"
                  className={errors[`${ubo.id}-souceoffunds`] ? 'error' : ''}
                />
                {errors[`${ubo.id}-souceoffunds`] && <span className="error-message">{errors[`${ubo.id}-souceoffunds`]}</span>}
              </div>

              <div className="form-group full-width">
                <label>Is this person a Politically Exposed Person (PEP)?</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name={`pep-${ubo.id}`}
                      value="true"
                      checked={ubo.pep === true}
                      onChange={(e) => handleInputChange(ubo.id, 'pep', e.target.value === 'true')}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name={`pep-${ubo.id}`}
                      value="false"
                      checked={ubo.pep === false}
                      onChange={(e) => handleInputChange(ubo.id, 'pep', e.target.value === 'true')}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {ubo.pep && (
                <div className="form-group full-width">
                  <label htmlFor={`pepdetails-${ubo.id}`}>PEP Details</label>
                  <textarea
                    id={`pepdetails-${ubo.id}`}
                    value={ubo.pepdetails}
                    onChange={(e) => handleInputChange(ubo.id, 'pepdetails', e.target.value)}
                    placeholder="Enter PEP Details"
                    rows="3"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="add-ubo-section">
          <button type="button" className="add-ubo-btn" onClick={addUbo}>
            <span className="plus-icon">+</span>
            Add Ultimate Beneficial Owner
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

export default UltimateBeneficialOwner;
