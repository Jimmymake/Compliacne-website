import React, { useState, useEffect } from 'react';
import './CompanyInfo.scss';
import { Alert, Snackbar, CircularProgress } from '@mui/material';

const CompanyInfo = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    merchantUrls: '',
    dateOfIncorporation: '',
    incorporationNumber: '',
    companyEmail: '',
    countryOfIncorporation: '',
    contactPerson: {
      fullName: '',
      phone: '',
      email: ''
    },
    businessDescription: '',
    sourceOfFunds: '',
    purpose: '',
    licensingRequired: false,
    licenseInfo: {
      licencenumber: '',
      licencetype: '',
      jurisdiction: ''
    },
    bankname: '',
    swiftcode: '',
    targetCountries: [{
      region: '',
      percent: ''
    }],
    topCountries: [],
    previouslyUsedGateways: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);

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
          console.log('Company Info API Response:', userData);

          // Try different possible data structures
          let companyData = null;
          console.log('Full userData.forms:', userData.forms);
          console.log('userData.forms?.companyinformation:', userData.forms?.companyinformation);
          console.log('userData.forms?.companyinfor:', userData.forms?.companyinfor);

          // Check for companyinformation first (correct API response format)
          if (userData.forms?.companyinformation && Object.keys(userData.forms.companyinformation).length > 0) {
            companyData = userData.forms.companyinformation;
            console.log('Using companyinformation directly:', companyData);
          } else if (userData.forms?.companyinfor && Object.keys(userData.forms.companyinfor).length > 0) {
            companyData = userData.forms.companyinfor;
            console.log('Using companyinfor directly:', companyData);
          } else if (userData.forms?.companyinfor?.companyinfor && Object.keys(userData.forms.companyinfor.companyinfor).length > 0) {
            companyData = userData.forms.companyinfor.companyinfor;
            console.log('Using companyinfor.companyinfor:', companyData);
          }

          if (companyData) {
            console.log('Setting company info data:', companyData);
            console.log('Company data keys:', Object.keys(companyData));
            setFormData(companyData);
            setOriginalData(JSON.parse(JSON.stringify(companyData)));
            console.log('Original data set successfully');
          } else {
            console.log('No company data found in API response');
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
          console.log('Form Status API Response:', statusData);
          // Set read-only based on completion status - if completed, make it read-only
          const isCompleted = statusData.forms?.companyinformation?.completed || statusData.forms?.companyinfor?.completed || false;
          console.log('Company Info completed status:', isCompleted);
          setIsReadOnly(isCompleted);
        } else {
          // Fallback: if status API fails but we have data, assume it's completed
          if (formData.companyName && formData.companyName.trim() !== '') {
            console.log('Status API failed, but data exists - setting to read-only');
            setIsReadOnly(true);
          }
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
      setFormData(JSON.parse(JSON.stringify(originalData)));
    }
    setErrors({});
  };

  // Helper function to get input props for read-only state
  const getInputProps = (fieldName) => ({
    readOnly: isReadOnly && !isEditing,
    style: isReadOnly && !isEditing ? {
      cursor: 'not-allowed',
      opacity: 0.7
    } : {}
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('contactPerson.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [field]: value
        }
      }));
    } else if (name.startsWith('licenseInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        licenseInfo: {
          ...prev.licenseInfo,
          [field]: value
        }
      }));
    } else if (name.startsWith('targetCountries.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        targetCountries: [{
          ...prev.targetCountries[0],
          [field]: value
        }]
      }));
    } else if (name === 'licensingRequired') {
      setFormData(prev => ({
        ...prev,
        [name]: value === 'true'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
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

    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.merchantUrls.trim()) newErrors.merchantUrls = 'Merchant URL is required';
    if (!formData.dateOfIncorporation.trim()) newErrors.dateOfIncorporation = 'Date of incorporation is required';
    if (!formData.incorporationNumber.trim()) newErrors.incorporationNumber = 'Company registration number is required';
    if (!formData.companyEmail.trim()) newErrors.companyEmail = 'Company email is required';
    if (!formData.contactPerson.fullName.trim()) newErrors['contactPerson.fullName'] = 'Contact person name is required';
    if (!formData.contactPerson.phone.trim()) newErrors['contactPerson.phone'] = 'Contact person phone is required';
    if (!formData.contactPerson.email.trim()) newErrors['contactPerson.email'] = 'Contact person email is required';
    if (!formData.businessDescription.trim()) newErrors.businessDescription = 'Business description is required';
    if (!formData.sourceOfFunds.trim()) newErrors.sourceOfFunds = 'Source of funds is required';
    if (!formData.purpose.trim()) newErrors.purpose = 'Business purpose is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Add merchantid to the payload
        const payload = {
          merchantid: localStorage.getItem('merchantId') || 'MIDcwebu34f3ff3f3443f4f',
          ...formData
        };

        // Use PUT for updates, POST for new submissions (same pattern as UBO)
        const method = originalData ? 'PUT' : 'POST';
        const response = await fetch('http://localhost:4000/api/companyinfor', {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Company info submitted successfully:', result);
          const successMessage = originalData ? "Company information updated successfully!" : "Company information submitted successfully!";
          setAlert({
            open: true,
            message: successMessage,
            severity: "success"
          });

          // Update original data with the current form data and set to read-only after successful save
          setOriginalData(JSON.parse(JSON.stringify(formData)));
          setIsReadOnly(true);
          setIsEditing(false);
        } else {
          console.error('Failed to submit company info:', response.statusText);
          setAlert({
            open: true,
            message: "Failed to submit company information. Please try again.",
            severity: "error"
          });
        }
      } catch (error) {
        console.error('Error submitting company info:', error);
        setAlert({
          open: true,
          message: "Network error. Please check your connection and try again.",
          severity: "error"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Debug logging
  console.log('CompanyInfo Render State:', {
    isLoading,
    isReadOnly,
    isEditing,
    hasOriginalData: !!originalData,
    originalDataKeys: originalData ? Object.keys(originalData) : []
  });

  if (isLoading) {
    return (
      <div className="company-info-form">
        <div className="loading-container">
          <CircularProgress />
          <p>Loading company information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="company-info-form">
      <div className="form-header">
        <div className="header-content">
          <div>
            <h2>Company Information</h2>
            <p>Please provide your company details for verification</p>
          </div>
          {/* <div className="header-actions">
            {(originalData || (formData.companyName && formData.companyName.trim() !== '')) && isReadOnly && !isEditing ? (
              <button 
                type="button" 
                className="btn-edit" 
                onClick={handleEdit}
              >
                Edit
              </button>
            ) : null}
          </div> */}
      
        </div>
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
            ✓ SUBMITTED - Company  information completed
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="kyc-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="companyName">Company name *</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Enter Company Name"
              className={errors.companyName ? 'error' : ''}
              {...getInputProps('companyName')}
            />
            {errors.companyName && <span className="error-message">{errors.companyName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="merchantUrls">Merchant URL *</label>
            <input
              type="url"
              id="merchantUrls"
              name="merchantUrls"
              value={formData.merchantUrls}
              onChange={handleInputChange}
              placeholder="Enter Merchant URL"
              className={errors.merchantUrls ? 'error' : ''}
              {...getInputProps('merchantUrls')}
            />
            {errors.merchantUrls && <span className="error-message">{errors.merchantUrls}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dateOfIncorporation">Date of incorporation *</label>
            <div className="input-with-icon">
              <input
                type="date"
                id="dateOfIncorporation"
                name="dateOfIncorporation"
                value={formData.dateOfIncorporation}
                onChange={handleInputChange}
                className={errors.dateOfIncorporation ? 'error' : ''}
                {...getInputProps('dateOfIncorporation')}
              />
              <span className="calendar-icon">📅</span>
            </div>
            {errors.dateOfIncorporation && <span className="error-message">{errors.dateOfIncorporation}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="incorporationNumber">Company Reg Number *</label>
            <input
              type="text"
              id="incorporationNumber"
              name="incorporationNumber"
              value={formData.incorporationNumber}
              onChange={handleInputChange}
              placeholder="Enter Company Reg Number"
              className={errors.incorporationNumber ? 'error' : ''}
              {...getInputProps('incorporationNumber')}
            />
            {errors.incorporationNumber && <span className="error-message">{errors.incorporationNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="companyEmail">Company Email *</label>
            <input
              type="email"
              id="companyEmail"
              name="companyEmail"
              value={formData.companyEmail}
              onChange={handleInputChange}
              placeholder="Enter Company Email"
              className={errors.companyEmail ? 'error' : ''}
              {...getInputProps('companyEmail')}
            />
            {errors.companyEmail && <span className="error-message">{errors.companyEmail}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="countryOfIncorporation">Country of Incorporation *</label>
            <select
            placeholder="Enter Country of Incorporation"
              id="countryOfIncorporation"
              name="countryOfIncorporation"
              value={formData.countryOfIncorporation}
              onChange={handleInputChange}
              {...getInputProps('countryOfIncorporation')}
            >
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="contactPerson.fullName">Contact Person Full Name *</label>
            <input
              type="text"
              id="contactPerson.fullName"
              name="contactPerson.fullName"
              value={formData.contactPerson.fullName}
              onChange={handleInputChange}
              placeholder="Enter Full Name"
              className={errors['contactPerson.fullName'] ? 'error' : ''}
              {...getInputProps('contactPerson.fullName')}
            />
            {errors['contactPerson.fullName'] && <span className="error-message">{errors['contactPerson.fullName']}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactPerson.phone">Contact Person Phone Number *</label>
            <input
              type="tel"
              id="contactPerson.phone"
              name="contactPerson.phone"
              value={formData.contactPerson.phone}
              onChange={handleInputChange}
              placeholder="Enter Phone Number"
              className={errors['contactPerson.phone'] ? 'error' : ''}
              {...getInputProps('contactPerson.phone')}
            />
            {errors['contactPerson.phone'] && <span className="error-message">{errors['contactPerson.phone']}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactPerson.email">Contact Person Email *</label>
            <input
              type="email"
              id="contactPerson.email"
              name="contactPerson.email"
              value={formData.contactPerson.email}
              onChange={handleInputChange}
              placeholder="Enter Contact Person Email"
              className={errors['contactPerson.email'] ? 'error' : ''}
              {...getInputProps('contactPerson.email')}
            />
            {errors['contactPerson.email'] && <span className="error-message">{errors['contactPerson.email']}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="businessDescription">Business Description/Industry *</label>
            <textarea
              id="businessDescription"
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleInputChange}
              placeholder="Enter Business Description/Industry"
              rows="3"
              className={errors.businessDescription ? 'error' : ''}
              {...getInputProps('businessDescription')}
            />
            {errors.businessDescription && <span className="error-message">{errors.businessDescription}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="sourceOfFunds">Company Source of Funds and Wealth *</label>
            <textarea
              id="sourceOfFunds"
              name="sourceOfFunds"
              value={formData.sourceOfFunds}
              onChange={handleInputChange}
              placeholder="Enter Company Source of Funds and Wealth"
              rows="3"
              className={errors.sourceOfFunds ? 'error' : ''}
              {...getInputProps('sourceOfFunds')}
            />
            {errors.sourceOfFunds && <span className="error-message">{errors.sourceOfFunds}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="purpose">Purpose and Intended Nature of Business Relationship with Us *</label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="Enter Purpose and Intended Nature of Business Relationship with Us"
              rows="3"
              className={errors.purpose ? 'error' : ''}
              {...getInputProps('purpose')}
            />
            {errors.purpose && <span className="error-message">{errors.purpose}</span>}
          </div>

          <div className="form-group full-width">
            <label>Are the Activities of the Company Subjected to Licensing (If Yes: License Number, Type, and Jurisdiction:)</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="licensingRequired"
                  value="true"
                  checked={formData.licensingRequired === true}
                  onChange={handleInputChange}
                  disabled={isReadOnly && !isEditing}
                />
                <span>Yes</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="licensingRequired"
                  value="false"
                  checked={formData.licensingRequired === false}
                  onChange={handleInputChange}
                  disabled={isReadOnly && !isEditing}
                />
                <span>No</span>
              </label>
            </div>

            {formData.licensingRequired && (
              <div className="conditional-fields">
                <input
                  type="text"
                  name="licenseInfo.licencenumber"
                  value={formData.licenseInfo.licencenumber}
                  onChange={handleInputChange}
                  placeholder="2342234"
                  {...getInputProps('licenseInfo.licencenumber')}
                />
                <input
                  type="text"
                  name="licenseInfo.licencetype"
                  value={formData.licenseInfo.licencetype}
                  onChange={handleInputChange}
                  placeholder="Enter Type"
                  {...getInputProps('licenseInfo.licencetype')}
                />
                <input
                  type="text"
                  name="licenseInfo.jurisdiction"
                  value={formData.licenseInfo.jurisdiction}
                  onChange={handleInputChange}
                  placeholder="Enter Jurisdiction"
                  {...getInputProps('licenseInfo.jurisdiction')}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="bankname">Bank Name</label>
            <input
              type="text"
              id="bankname"
              name="bankname"
              value={formData.bankname}
              onChange={handleInputChange}
              placeholder="Enter Bank Name"
              {...getInputProps('bankname')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="swiftcode">BIC/SWIFT Code</label>
            <input
              type="text"
              id="swiftcode"
              name="swiftcode"
              value={formData.swiftcode}
              onChange={handleInputChange}
              placeholder="Enter SWIFT Code"
              {...getInputProps('swiftcode')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="targetCountries.region">Target Markets - Region</label>
            <input
              type="text"
              id="targetCountries.region"
              name="targetCountries.region"
              value={formData.targetCountries[0].region}
              onChange={handleInputChange}
              placeholder="Enter Region"
              {...getInputProps('targetCountries.region')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="targetCountries.percent">Target Markets - Percentage</label>
            <input
              type="number"
              id="targetCountries.percent"
              name="targetCountries.percent"
              value={formData.targetCountries[0].percent}
              onChange={handleInputChange}
              placeholder="Enter Percentage"
              min="0"
              max="100"
              {...getInputProps('targetCountries.percent')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="topCountries">Top Countries of Operation</label>
            <input
              type="text"
              id="topCountries"
              name="topCountries"
              value={formData.topCountries.join(', ')}
              onChange={(e) => {
                const countries = e.target.value.split(',').map(country => country.trim()).filter(country => country);
                setFormData(prev => ({
                  ...prev,
                  topCountries: countries
                }));
              }}
              placeholder="Enter Top Countries"
              {...getInputProps('topCountries')}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="previouslyUsedGateways">Previously Used Payment Gateways (if applicable)</label>
            <input
              type="text"
              id="previouslyUsedGateways"
              name="previouslyUsedGateways"
              value={formData.previouslyUsedGateways}
              onChange={handleInputChange}
              placeholder="Enter Previously Used Payment Gateways"
              {...getInputProps('previouslyUsedGateways')}
            />
          </div>
        </div>

        {/* <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting || (isReadOnly && !isEditing)}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {originalData && Object.keys(originalData).length > 0 ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              originalData ? 'Update & Continue' : 'Save & Continue'
            )}
          </button>
        </div> */}

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
                {(() => {
                  const buttonText = originalData ? 'Update & Continue' : 'Save & Continue';
                  console.log('Button text decision:', { hasOriginalData: !!originalData, originalDataKeys: originalData ? Object.keys(originalData) : [], buttonText });
                  return buttonText;
                })()}
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

export default CompanyInfo;
