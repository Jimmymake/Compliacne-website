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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  
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

  // Handle file selection for digital signature
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setAlert({
        open: true,
        message: "Please upload a valid image file (JPEG, PNG, or GIF)",
        severity: "error"
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setAlert({
        open: true,
        message: "File size must be less than 5MB",
        severity: "error"
      });
      return;
    }

    // Store the file for later upload
    setSelectedFile(file);
    setAlert({
      open: true,
      message: "File selected successfully! Click 'Save & Continue' to upload.",
      severity: "success"
    });
  };

  // Upload file to API with enhanced error handling and URL extraction
  const uploadSignatureFile = async (file, retryCount = 0) => {
    const formData = new FormData();
    // Use the actual file name instead of hardcoded name to preserve file extension
    const fileName = file.name || `signature.${file.type.split('/')[1] || 'png'}`;
    formData.append("file", file, fileName);

    const requestOptions = {
      method: "POST",
      body: formData,
      redirect: "follow"
    };

    try {
      console.log(`Uploading signature file: ${fileName} (attempt ${retryCount + 1})`);
      
      const response = await fetch("https://images.cradlevoices.com/", requestOptions);
      
      if (!response.ok) {
        const errorMessage = `Server error: ${response.status} ${response.statusText}`;
        console.error('Upload failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const result = await response.text();
      console.log('Upload response:', result);
      
      // Parse the response to check for errors and extract URL
      try {
        const parsedResult = JSON.parse(result);
        
        // Check for various error formats
        if (parsedResult.status === 'error') {
          const errorMsg = parsedResult.message || 'Upload failed';
          console.error('Server returned error:', errorMsg);
          throw new Error(errorMsg);
        }
        
        // Check for success indicators and extract URL
        if (parsedResult.status === 'success') {
          // Extract URL from the response structure
          if (parsedResult.file && parsedResult.file.url) {
            return parsedResult.file.url;
          } else if (parsedResult.url) {
            return parsedResult.url;
          } else if (parsedResult.fileUrl) {
            return parsedResult.fileUrl;
          }
          // If no URL found but status is success, return the full response
          return result;
        }
        
        // If no clear status, assume success if we got a response
        return result;
        
      } catch (parseError) {
        // If response is not JSON, check if it looks like an error
        if (result.toLowerCase().includes('error') || result.toLowerCase().includes('failed')) {
          throw new Error(`Upload failed: ${result}`);
        }
        // If it's not JSON and doesn't contain error keywords, assume it's a URL
        return result;
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Retry logic for network errors (up to 2 retries)
      if (retryCount < 2 && (
        error.message.includes('NetworkError') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('timeout')
      )) {
        console.log(`Retrying upload (attempt ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return uploadSignatureFile(file, retryCount + 1);
      }
      
      // Enhanced error messages based on error type
      let userFriendlyMessage = 'Upload failed. Please try again.';
      
      if (error.message.includes('File type')) {
        userFriendlyMessage = 'Invalid file type. Please upload a valid image file (JPEG, PNG, or GIF).';
      } else if (error.message.includes('size') || error.message.includes('too large')) {
        userFriendlyMessage = 'File is too large. Please upload a file smaller than 5MB.';
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        userFriendlyMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('Server error: 413')) {
        userFriendlyMessage = 'File is too large for the server. Please upload a smaller file.';
      } else if (error.message.includes('Server error: 415')) {
        userFriendlyMessage = 'File type not supported. Please upload a different file format.';
      } else if (error.message.includes('Server error: 500')) {
        userFriendlyMessage = 'Server error. Please try again in a few moments.';
      } else if (error.message.includes('Server error: 400')) {
        userFriendlyMessage = 'Invalid file. Please check the file and try again.';
      }
      
      throw new Error(userFriendlyMessage);
    }
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
    setSelectedFile(null);
    setUploadProgress('');
    setIsUploadingFile(false);
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
        setIsUploading(true);
        
        // Upload signature file if one is selected
        let signatureResponse = formData.indroducer.signature;
        if (selectedFile) {
          try {
            setIsUploadingFile(true);
            setUploadProgress('uploading');
            signatureResponse = await uploadSignatureFile(selectedFile);
            setUploadProgress('completed');
            console.log('Signature uploaded successfully:', signatureResponse);
          } catch (uploadError) {
            console.error('Signature upload error:', uploadError);
            setUploadProgress('failed');
            setAlert({
              open: true,
              message: `Failed to upload signature: ${uploadError.message}. Please try again.`,
              severity: "error"
            });
            setIsUploading(false);
            setIsUploadingFile(false);
            return;
          } finally {
            setIsUploadingFile(false);
          }
        }

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
            signature: signatureResponse
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
          
          // Update form data with the uploaded signature response
          const updatedFormData = {
            ...formData,
            indroducer: {
              ...formData.indroducer,
              signature: signatureResponse
            }
          };
          
          // Update original data and set to read-only after successful save
          setOriginalData(updatedFormData);
          setFormData(updatedFormData);
          setSelectedFile(null); // Clear selected file
          setUploadProgress(''); // Clear upload progress
          setIsUploadingFile(false); // Clear uploading state
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
      } finally {
        setIsUploading(false);
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
            ✓ SUBMITTED - Risk assessment completed
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
                placeholder="Enter Full Name"
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
                placeholder="Enter Telephone Number"
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
                placeholder="Enter Email Address"
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
            <div className="others-input">
              <input
                type="text"
                id="hereaboutus"
                name="hereaboutus"
                value={formData.hereaboutus}
                onChange={handleInputChange}
                placeholder="Enter Where  You heard About Us?"
                className={errors.hereaboutus ? 'error' : ''}
              />
            </div>
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
                placeholder="Enter Introducer name"
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
                placeholder="Enter position"
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
            <label htmlFor="signature-upload">Digital Signature</label>
            <div className="file-upload-container">
              <input
                type="file"
                id="signature-upload"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={isReadOnly && !isEditing}
              />
              <label htmlFor="signature-upload" className="file-upload-label">
                {isUploadingFile ? (
                  <span>Uploading...</span>
                ) : uploadProgress === 'failed' ? (
                  <span>Upload Failed - Click to Retry</span>
                ) : (
                  <span>Choose Signature Image</span>
                )}
              </label>
              {selectedFile && (
                <div className="uploaded-file-info">
                  <span className="file-name">
                    {isUploadingFile ? (
                      <>⏳ {selectedFile.name} uploading...</>
                    ) : uploadProgress === 'completed' ? (
                      <>✅ {selectedFile.name} uploaded</>
                    ) : uploadProgress === 'failed' ? (
                      <>❌ {selectedFile.name} failed</>
                    ) : (
                      <>✓ {selectedFile.name} selected</>
                    )}
                  </span>
                  <button 
                    type="button" 
                    className="remove-file-btn"
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadProgress('');
                    }}
                    disabled={isReadOnly && !isEditing}
                  >
                    Remove
                  </button>
                </div>
              )}
              {formData.indroducer.signature && !selectedFile && (
                <div className="uploaded-file-info">
                  <div className="file-info-content">
                    <span className="file-name">✓ </span>
                    <a 
                      href={formData.indroducer.signature} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="file-url"
                      style={{
                        color: '#007bff',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        wordBreak: 'break-all'
                      }}
                    >
                      {formData.indroducer.signature}
                    </a>
                  </div>
                  <button 
                    type="button" 
                    className="remove-file-btn"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      indroducer: {
                        ...prev.indroducer,
                        signature: ''
                      }
                    }))}
                    disabled={isReadOnly && !isEditing}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
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
              <button type="submit" className="btn-primary" disabled={isUploading}>
                {isUploading ? 'Uploading...' : (originalData ? 'Update & Continue' : 'Save & Continue')}
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

export default RiskManagement;
