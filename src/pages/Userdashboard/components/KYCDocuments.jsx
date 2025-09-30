import React, { useState, useEffect } from 'react';
import './KYCDocuments.scss';
import { Alert, Snackbar } from '@mui/material';

const KYCDocuments = () => {
  const [documents, setDocuments] = useState({
    completed: false,
    certincorporation: null,
    cr2forpatnership: null,
    cr2forshareholders: null,
    kracert: null,
    bankstatement: null,
    passportids: null,
    shareholderpassportid: null,
    websiteipadress: '',
    proofofbomain: null,
    proofofadress: null
  });

  const [originalData, setOriginalData] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  
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
          if (userData.forms?.kycdocs) {
            setDocuments(userData.forms.kycdocs);
            setOriginalData(userData.forms.kycdocs);
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
          setIsReadOnly(statusData.forms?.kycdocs?.completed || false);
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
      setDocuments(originalData);
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

  const documentList = [
    {
      key: 'certincorporation',
      label: 'Certificate of Incorporation*',
      required: true,
      type: 'file'
    },
    {
      key: 'cr2forpatnership',
      label: 'CR 2 for Partnership*',
      required: true,
      type: 'file'
    },
    {
      key: 'cr2forshareholders',
      label: 'CR 2 for Shareholders*',
      required: true,
      type: 'file'
    },
    {
      key: 'kracert',
      label: 'KRA Certificate*',
      required: true,
      type: 'file'
    },
    {
      key: 'bankstatement',
      label: 'Bank Statement*',
      required: true,
      type: 'file'
    },
    {
      key: 'passportids',
      label: 'Passport IDs*',
      required: true,
      type: 'file'
    },
    {
      key: 'shareholderpassportid',
      label: 'Shareholder Passport ID*',
      required: true,
      type: 'file'
    },
    {
      key: 'websiteipadress',
      label: 'Website and IP Addresses*',
      required: true,
      type: 'text'
    },
    {
      key: 'proofofbomain',
      label: 'Proof of Domain*',
      required: true,
      type: 'file'
    },
    {
      key: 'proofofadress',
      label: 'Proof of Address*',
      required: true,
      type: 'file'
    }
  ];

  const uploadFileToImageService = async (file) => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const requestOptions = {
      method: "POST",
      body: formData,
      redirect: "follow"
    };

    try {
      const response = await fetch("https://images.cradlevoices.com/", requestOptions);
      const result = await response.json();
      
      if (result.status === "success") {
        return result.file.url;
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  const handleFileChange = (documentKey, file) => {
    if (isReadOnly && !isEditing) return; // Prevent changes in read-only mode
    
    setDocuments(prev => ({
      ...prev,
      [documentKey]: file
    }));
    
    // Clear error when user uploads a file
    if (errors[documentKey]) {
      setErrors(prev => ({
        ...prev,
        [documentKey]: ''
      }));
    }
  };

  const handleTextChange = (documentKey, value) => {
    if (isReadOnly && !isEditing) return; // Prevent changes in read-only mode
    
    setDocuments(prev => ({
      ...prev,
      [documentKey]: value
    }));
    
    // Clear error when user types
    if (errors[documentKey]) {
      setErrors(prev => ({
        ...prev,
        [documentKey]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    documentList.forEach(doc => {
      if (doc.required && !documents[doc.key]) {
        newErrors[doc.key] = `${doc.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setUploading(true);
      
      try {
        // Upload all files to image service first
        const uploadedFiles = {};
        
        for (const doc of documentList) {
          if (doc.type === 'file' && documents[doc.key]) {
            try {
              const fileUrl = await uploadFileToImageService(documents[doc.key]);
              uploadedFiles[doc.key] = fileUrl;
            } catch (error) {
              console.error(`Failed to upload ${doc.key}:`, error);
              setAlert({
                open: true,
                message: `Failed to upload ${doc.label}. Please try again.`,
                severity: "error"
              });
              setUploading(false);
              return;
            }
          } else if (doc.type === 'text') {
            uploadedFiles[doc.key] = documents[doc.key];
          }
        }

        // Prepare payload for API
        const payload = {
          merchantid: localStorage.getItem('merchantId') || 'MID123456',
          completed: false,
          certincorporation: uploadedFiles.certincorporation || '',
          cr2forpatnership: uploadedFiles.cr2forpatnership || '',
          cr2forshareholders: uploadedFiles.cr2forshareholders || '',
          kracert: uploadedFiles.kracert || '',
          bankstatement: uploadedFiles.bankstatement || '',
          passportids: uploadedFiles.passportids || '',
          shareholderpassportid: uploadedFiles.shareholderpassportid || '',
          websiteipadress: Array.isArray(uploadedFiles.websiteipadress) 
            ? uploadedFiles.websiteipadress 
            : uploadedFiles.websiteipadress.split(',').map(url => url.trim()).filter(url => url),
          proofofbomain: uploadedFiles.proofofbomain || '',
          proofofadress: uploadedFiles.proofofadress || ''
        };

        // Submit to KYC API - Use PUT for updates, POST for new submissions
        const method = originalData ? 'PUT' : 'POST';
        const response = await fetch('http://localhost:4000/api/kycinfo', {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('KYC documents submitted successfully:', result);
          const successMessage = originalData ? "KYC documents updated successfully!" : "KYC documents submitted successfully!";
          setAlert({
            open: true,
            message: successMessage,
            severity: "success"
          });
          
          // Update original data and set to read-only after successful save
          setOriginalData(documents);
          setIsReadOnly(true);
          setIsEditing(false);
        } else {
          console.error('Failed to submit KYC documents:', response.statusText);
          setAlert({
            open: true,
            message: "Failed to submit KYC documents. Please try again.",
            severity: "error"
          });
        }
      } catch (error) {
        console.error('Error submitting KYC documents:', error);
        setAlert({
          open: true,
          message: "Network error. Please check your connection and try again.",
          severity: "error"
        });
      } finally {
        setUploading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="kyc-documents-form">
        <div className="form-header">
          <h2>Document Requirements Checklist</h2>
          <p>Loading your data...</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="kyc-documents-form">
      <div className="form-header">
        <h2>Document Requirements Checklist</h2>
        <p>Please upload all required documents for verification</p>
        {isReadOnly && !isEditing && (
          <div style={{ color: '#7ef9a3', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            ✓ Form completed - Click "Update" to make changes
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="kyc-form">
        <div className="documents-grid">
          {documentList.map((doc, index) => (
            <div key={doc.key} className="document-item">
              <div className="document-label">
                <span className="document-number">{index + 1}.</span>
                <label htmlFor={doc.key}>{doc.label}</label>
              </div>
              
              {doc.type === 'file' ? (
                <div className="file-upload-area">
                  <input
                    type="file"
                    id={doc.key}
                    onChange={(e) => handleFileChange(doc.key, e.target.files[0])}
                    className="file-input"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label htmlFor={doc.key} className="file-upload-label">
                    <div className="upload-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </div>
                    <span className="upload-text">
                      {documents[doc.key] ? documents[doc.key].name : 'Choose file'}
                    </span>
                  </label>
                </div>
              ) : (
                <div className="text-input-area">
                  <input
                    type="text"
                    id={doc.key}
                    value={documents[doc.key] || ''}
                    onChange={(e) => handleTextChange(doc.key, e.target.value)}
                    placeholder="Enter website URLs separated by commas (e.g., https://example.com, https://merchant.com)"
                    className="text-input"
                  />
                </div>
              )}
              
              {errors[doc.key] && <span className="error-message">{errors[doc.key]}</span>}
            </div>
          ))}
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
              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? 'Uploading...' : (originalData ? 'Update & Continue' : 'Submit')}
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

export default KYCDocuments;
