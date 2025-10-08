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
    proofofadress: null,
    pepform: null
  });

  const [originalData, setOriginalData] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState(new Set());

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
    setSelectedFiles({});
    setUploadProgress({});
    setUploadingFiles(new Set());
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
    },
    {
      key: 'pepform',
      label: 'PEP Form*',
      required: true,
      type: 'file'
    }
  ];

  // Upload file to API (same format as Digital Signature)
  const uploadFileToImageService = async (file, retryCount = 0) => {
    const formData = new FormData();
    // Use the actual file name instead of hardcoded name to preserve file extension
    // Ensure the file has a proper name with extension
    const fileName = file.name || `document.${file.type.split('/')[1] || 'pdf'}`;
    formData.append("file", file, fileName);

    const requestOptions = {
      method: "POST",
      body: formData,
      redirect: "follow"
    };

    try {
      console.log(`Uploading file: ${fileName} (attempt ${retryCount + 1})`);
      
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
        return uploadFileToImageService(file, retryCount + 1);
      }
      
      // Enhanced error messages based on error type
      let userFriendlyMessage = 'Upload failed. Please try again.';
      
      if (error.message.includes('File type')) {
        userFriendlyMessage = 'Invalid file type. Please upload a PDF, image, or document file.';
      } else if (error.message.includes('size') || error.message.includes('too large')) {
        userFriendlyMessage = 'File is too large. Please upload a file smaller than 10MB.';
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

  const handleFileSelect = (documentKey, file) => {
    if (isReadOnly && !isEditing) return; // Prevent changes in read-only mode

    if (!file) return;

    // Validate file name and extension
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      setAlert({
        open: true,
        message: "Please upload a valid file with extension: PDF, JPG, JPEG, PNG, GIF, DOC, or DOCX",
        severity: "error"
      });
      return;
    }

    // Validate file type (MIME type)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setAlert({
        open: true,
        message: "Please upload a valid file (JPEG, PNG, PDF, or DOC)",
        severity: "error"
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setAlert({
        open: true,
        message: "File size must be less than 10MB",
        severity: "error"
      });
      return;
    }

    // Store the file for later upload
    setSelectedFiles(prev => ({
      ...prev,
      [documentKey]: file
    }));

    setAlert({
      open: true,
      message: "File selected successfully! Click 'Submit' to upload.",
      severity: "success"
    });

    // Clear error when user selects a file
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
      if (doc.required) {
        // Check if file is already uploaded or newly selected
        const hasFile = documents[doc.key] || selectedFiles[doc.key];
        if (!hasFile) {
          newErrors[doc.key] = `${doc.label} is required`;
        }
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
        // Upload all selected files to image service first
        const uploadedFiles = {};

        // Track upload progress and errors
        const uploadErrors = [];
        const progressTracker = {};

        for (const doc of documentList) {
          if (doc.type === 'file') {
            // Check if there's a newly selected file to upload
            if (selectedFiles[doc.key]) {
              try {
                // Update progress indicator
                setUploadProgress(prev => ({ ...prev, [doc.key]: 'uploading' }));
                setUploadingFiles(prev => new Set([...prev, doc.key]));
                
                const fileUrl = await uploadFileToImageService(selectedFiles[doc.key]);
                uploadedFiles[doc.key] = fileUrl;
                setUploadProgress(prev => ({ ...prev, [doc.key]: 'completed' }));
                
                console.log(`Successfully uploaded ${doc.label}`);
                
              } catch (error) {
                console.error(`Failed to upload ${doc.key}:`, error);
                setUploadProgress(prev => ({ ...prev, [doc.key]: 'failed' }));
                uploadErrors.push({
                  document: doc.label,
                  error: error.message,
                  key: doc.key
                });
                
                // Continue with other uploads instead of stopping completely
                continue;
              } finally {
                // Remove from uploading set
                setUploadingFiles(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(doc.key);
                  return newSet;
                });
              }
            } else if (documents[doc.key]) {
              // Use already uploaded file
              uploadedFiles[doc.key] = documents[doc.key];
              setUploadProgress(prev => ({ ...prev, [doc.key]: 'existing' }));
            }
          } else if (doc.type === 'text') {
            uploadedFiles[doc.key] = documents[doc.key];
          }
        }

        // Handle upload errors
        if (uploadErrors.length > 0) {
          const errorMessages = uploadErrors.map(err => `${err.document}: ${err.error}`).join('\n');
          setAlert({
            open: true,
            message: `Some files failed to upload:\n${errorMessages}\n\nPlease check the files and try again.`,
            severity: "error"
          });
          setUploading(false);
          return;
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
          proofofadress: uploadedFiles.proofofadress || '',
          pepform: uploadedFiles.pepform || ''
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

          // Update documents with uploaded file responses
          const updatedDocuments = { ...documents };
          Object.keys(selectedFiles).forEach(key => {
            if (uploadedFiles[key]) {
              updatedDocuments[key] = uploadedFiles[key];
            }
          });

          // Update original data and set to read-only after successful save
          setOriginalData(updatedDocuments);
          setDocuments(updatedDocuments);
          setSelectedFiles({}); // Clear selected files
          setUploadProgress({}); // Clear upload progress
          setUploadingFiles(new Set()); // Clear uploading files
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
            ✓ SUBMITTED - Documents uploaded successfully
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
                {documents[doc.key] && (
                  <div style={{
                    color: '#4caf50',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    backgroundColor: '#e8f5e8',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #4caf50',
                    display: 'inline-block',
                    marginLeft: '0.5rem'
                  }}>
                    ✓ SUBMITTED
                  </div>
                )}
              </div>

              {doc.type === 'file' ? (
                <div className="file-upload-container">
                  <input
                    type="file"
                    id={doc.key}
                    onChange={(e) => handleFileSelect(doc.key, e.target.files[0])}
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    disabled={isReadOnly && !isEditing}
                  />
                  <label htmlFor={doc.key} className="file-upload-label">
                    {uploadingFiles.has(doc.key) ? (
                      <span>Uploading...</span>
                    ) : uploadProgress[doc.key] === 'failed' ? (
                      <span>Upload Failed - Click to Retry</span>
                    ) : (
                      <span>Choose Document</span>
                    )}
                  </label>
                  {selectedFiles[doc.key] && (
                    <div className="uploaded-file-info">
                      <span className="file-name">
                        {uploadingFiles.has(doc.key) ? (
                          <>⏳ {selectedFiles[doc.key].name} uploading...</>
                        ) : uploadProgress[doc.key] === 'completed' ? (
                          <>✅ {selectedFiles[doc.key].name} uploaded</>
                        ) : uploadProgress[doc.key] === 'failed' ? (
                          <>❌ {selectedFiles[doc.key].name} failed</>
                        ) : (
                          <>✓ {selectedFiles[doc.key].name} selected</>
                        )}
                      </span>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => {
                          setSelectedFiles(prev => {
                            const newFiles = { ...prev };
                            delete newFiles[doc.key];
                            return newFiles;
                          });
                          setUploadProgress(prev => {
                            const newProgress = { ...prev };
                            delete newProgress[doc.key];
                            return newProgress;
                          });
                        }}
                        disabled={isReadOnly && !isEditing}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {documents[doc.key] && !selectedFiles[doc.key] && (
                    <div className="uploaded-file-info">
                      <div className="file-info-content">
                        <span className="file-name">✓ </span>
                        <a
                          href={documents[doc.key]}
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
                          {documents[doc.key]}
                        </a>
                      </div>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => setDocuments(prev => ({
                          ...prev,
                          [doc.key]: null
                        }))}
                        disabled={isReadOnly && !isEditing}
                      >
                        Remove
                      </button>
                    </div>
                  )}
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

export default KYCDocuments;
