import React, { useState, useEffect } from 'react';
import './RiskManagement.scss';
import { Alert, Snackbar } from '@mui/material';

const RiskManagement = () => {
  const [formData, setFormData] = useState({
    completed: true,
    amlpolicy: false,
    officerdetails: {
      fullname: '',
      telephonenumber: '',
      email: ''
    },
    historyofregulatoryfine: false,
    hereaboutus: '',
    indroducer: {
      name: '',
      position: '',
      date: '',
      signature: ''
    }
  });

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
        const profileResponse = await fetch('http://localhost:4000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          if (userData.forms?.riskmanagement) {
            setFormData(userData.forms.riskmanagement);
            setOriginalData(userData.forms.riskmanagement);
          }
        }

        // Fetch form status
        const statusResponse = await fetch('http://localhost:4000/api/user/form-status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          // Set read-only based on completion status - if completed, make it read-only
          setIsReadOnly(statusData.forms?.riskmanagement?.completed || false);
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
      setFormData(originalData);
    }
    setErrors({});
  };

  // Helper function to get input props for read-only state
  const getInputProps = (fieldName) => ({
    readOnly: isReadOnly && !isEditing,
    style: isReadOnly && !isEditing ? { 
      backgroundColor: '#f5f5f5', 
      cursor: 'not-allowed',
      color: '#666'
    } : {}
  });

  const handleInputChange = (e) => {
    if (isReadOnly && !isEditing) return; // Prevent changes in read-only mode
    
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('officerdetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        officerdetails: {
          ...prev.officerdetails,
          [field]: value
        }
      }));
    } else if (name.startsWith('indroducer.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        indroducer: {
          ...prev.indroducer,
          [field]: value
        }
      }));
    } else if (name === 'amlpolicy') {
      setFormData(prev => ({
        ...prev,
        [name]: value === 'true'
      }));
    } else if (name === 'historyofregulatoryfine') {
      setFormData(prev => ({
        ...prev,
        [name]: value === 'true'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.officerdetails.fullname.trim()) newErrors['officerdetails.fullname'] = 'Officer full name is required';
    if (!formData.officerdetails.telephonenumber.trim()) newErrors['officerdetails.telephonenumber'] = 'Officer telephone number is required';
    if (!formData.officerdetails.email.trim()) newErrors['officerdetails.email'] = 'Officer email is required';
    if (!formData.hereaboutus.trim()) newErrors.hereaboutus = 'This field is required';
    if (!formData.indroducer.name.trim()) newErrors['indroducer.name'] = 'Introducer name is required';
    if (!formData.indroducer.position.trim()) newErrors['indroducer.position'] = 'Introducer position is required';
    if (!formData.indroducer.date.trim()) newErrors['indroducer.date'] = 'Introducer date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Transform data to match API structure
        const payload = {
          merchantid: localStorage.getItem('merchantId') || 'MID987654',
          completed: formData.completed,
          amlpolicy: formData.amlpolicy,
          officerdetails: {
            fullname: formData.officerdetails.fullname,
            telephonenumber: formData.officerdetails.telephonenumber,
            email: formData.officerdetails.email
          },
          historyofregulatoryfine: formData.historyofregulatoryfine,
          hereaboutus: formData.hereaboutus,
          indroducer: {
            name: formData.indroducer.name,
            position: formData.indroducer.position,
            date: formData.indroducer.date ? new Date(formData.indroducer.date).toISOString() : '',
            signature: formData.indroducer.signature
          }
        };

        // Use PUT for updates, POST for new submissions
        const method = originalData ? 'PUT' : 'POST';
        const response = await fetch('http://localhost:4000/api/riskmanagementinfo', {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Risk management info submitted successfully:', result);
          const successMessage = originalData ? "Risk management information updated successfully!" : "Risk management information submitted successfully!";
          setAlert({
            open: true,
            message: successMessage,
            severity: "success"
          });
          
          // Update original data and set to read-only after successful save
          setOriginalData(formData);
          setIsReadOnly(true);
          setIsEditing(false);
        } else {
          console.error('Failed to submit risk management info:', response.statusText);
          setAlert({
            open: true,
            message: "Failed to submit risk management information. Please try again.",
            severity: "error"
          });
        }
      } catch (error) {
        console.error('Error submitting risk management info:', error);
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
      <div className="risk-management-form">
        <div className="form-header">
          <h2>Compliance and Risk Management</h2>
          <p>Loading your data...</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="risk-management-form">
      <div className="form-header">
        <h2>Compliance and Risk Management</h2>
        <p>Please fill out the following information to ensure compliance with regulatory requirements and risk management protocols. Note: All fields marked with an asterisk (*) are required.</p>
        {isReadOnly && !isEditing && (
          <div style={{ color: '#7ef9a3', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            ✓ Form completed - Click "Update" to make changes
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="kyc-form">
        <div className="form-section">
          <div className="form-group">
            <label>Does The Company Have an AML/KYC Policy in Place (If Yes: Attach Copy)</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="amlpolicy"
                  value="true"
                  checked={formData.amlpolicy === true}
                  onChange={handleInputChange}
                />
                <span>Yes</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="amlpolicy"
                  value="false"
                  checked={formData.amlpolicy === false}
                  onChange={handleInputChange}
                />
                <span>No</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Compliance Officer Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="officerdetails.fullname">Full Name *</label>
              <input
                type="text"
                id="officerdetails.fullname"
                name="officerdetails.fullname"
                value={formData.officerdetails.fullname}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={errors['officerdetails.fullname'] ? 'error' : ''}
              />
              {errors['officerdetails.fullname'] && <span className="error-message">{errors['officerdetails.fullname']}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="officerdetails.telephonenumber">Telephone Number *</label>
              <input
                type="tel"
                id="officerdetails.telephonenumber"
                name="officerdetails.telephonenumber"
                value={formData.officerdetails.telephonenumber}
                onChange={handleInputChange}
                placeholder="+254700123456"
                className={errors['officerdetails.telephonenumber'] ? 'error' : ''}
              />
              {errors['officerdetails.telephonenumber'] && <span className="error-message">{errors['officerdetails.telephonenumber']}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="officerdetails.email">Email *</label>
              <input
                type="email"
                id="officerdetails.email"
                name="officerdetails.email"
                value={formData.officerdetails.email}
                onChange={handleInputChange}
                placeholder="johndoe@example.com"
                className={errors['officerdetails.email'] ? 'error' : ''}
              />
              {errors['officerdetails.email'] && <span className="error-message">{errors['officerdetails.email']}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>History of Regulatory Actions or Fines (If Yes: Attach Details)</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="historyofregulatoryfine"
                  value="true"
                  checked={formData.historyofregulatoryfine === true}
                  onChange={handleInputChange}
                />
                <span>Yes</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="historyofregulatoryfine"
                  value="false"
                  checked={formData.historyofregulatoryfine === false}
                  onChange={handleInputChange}
                />
                <span>No</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label htmlFor="hereaboutus">Where Did You Hear About Us? *</label>
            <input
              type="text"
              id="hereaboutus"
              name="hereaboutus"
              value={formData.hereaboutus}
              onChange={handleInputChange}
              placeholder="Through a business partner"
              className={errors.hereaboutus ? 'error' : ''}
            />
            {errors.hereaboutus && <span className="error-message">{errors.hereaboutus}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Introducer Person/Company</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="indroducer.name">Name *</label>
              <input
                type="text"
                id="indroducer.name"
                name="indroducer.name"
                value={formData.indroducer.name}
                onChange={handleInputChange}
                placeholder="Jane Smith"
                className={errors['indroducer.name'] ? 'error' : ''}
              />
              {errors['indroducer.name'] && <span className="error-message">{errors['indroducer.name']}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="indroducer.position">Position *</label>
              <input
                type="text"
                id="indroducer.position"
                name="indroducer.position"
                value={formData.indroducer.position}
                onChange={handleInputChange}
                placeholder="Business Consultant"
                className={errors['indroducer.position'] ? 'error' : ''}
              />
              {errors['indroducer.position'] && <span className="error-message">{errors['indroducer.position']}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="indroducer.date">Date *</label>
              <div className="input-with-icon">
                <input
                  type="date"
                  id="indroducer.date"
                  name="indroducer.date"
                  value={formData.indroducer.date}
                  onChange={handleInputChange}
                  className={errors['indroducer.date'] ? 'error' : ''}
                />
                <span className="calendar-icon">📅</span>
              </div>
              {errors['indroducer.date'] && <span className="error-message">{errors['indroducer.date']}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Signature</h3>
          <div className="form-group">
            <label htmlFor="indroducer.signature">Digital Signature</label>
            <textarea
              id="indroducer.signature"
              name="indroducer.signature"
              value={formData.indroducer.signature}
              onChange={handleInputChange}
              placeholder="JaneSmithSignature.png"
              rows="3"
            />
          </div>
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
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RiskManagement;
