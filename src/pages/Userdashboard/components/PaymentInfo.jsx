import React, { useState, useEffect } from 'react';
import './PaymentInfo.scss';
import { Alert, Snackbar } from '@mui/material';

const PaymentInfo = () => {
  const [formData, setFormData] = useState({
    completed: true,
    requredcurrency: {
      KES: false,
      USD: false,
      GBP: false,
      other: false,
      otherText: ''
    },
    exmonthlytransaction: {
      amountinusd: '',
      numberoftran: ''
    },
    avgtranssize: '',
    paymentmethodtobesupported: {
      credit: false,
      mobilemoney: false,
      other: false,
      otherText: ''
    },
    chargebackrefungrate: ''
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
          if (userData.forms?.paymentandprosessing) {
            setFormData(userData.forms.paymentandprosessing);
            setOriginalData(userData.forms.paymentandprosessing);
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
          setIsReadOnly(statusData.forms?.paymentandprosessing?.completed || false);
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
    
    if (name.startsWith('requredcurrency.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        requredcurrency: {
          ...prev.requredcurrency,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('exmonthlytransaction.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        exmonthlytransaction: {
          ...prev.exmonthlytransaction,
          [field]: value
        }
      }));
    } else if (name.startsWith('paymentmethodtobesupported.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        paymentmethodtobesupported: {
          ...prev.paymentmethodtobesupported,
          [field]: type === 'checkbox' ? checked : value
        }
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

  const handleCurrencyChange = (currency, value) => {
    setFormData(prev => ({
      ...prev,
      requredcurrency: {
        ...prev.requredcurrency,
        [currency]: value
      }
    }));
  };

  const handlePaymentMethodChange = (method, value) => {
    setFormData(prev => ({
      ...prev,
      paymentmethodtobesupported: {
        ...prev.paymentmethodtobesupported,
        [method]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Convert to string for validation if needed
    const amountInUsd = String(formData.exmonthlytransaction.amountinusd || '');
    const numberOfTran = String(formData.exmonthlytransaction.numberoftran || '');
    const avgTransSize = String(formData.avgtranssize || '');
    const chargebackRate = String(formData.chargebackrefungrate || '');
    
    if (!amountInUsd.trim() || amountInUsd === '0') newErrors['exmonthlytransaction.amountinusd'] = 'Amount in USD is required';
    if (!numberOfTran.trim() || numberOfTran === '0') newErrors['exmonthlytransaction.numberoftran'] = 'Number of transactions is required';
    if (!avgTransSize.trim() || avgTransSize === '0') newErrors.avgtranssize = 'Average transaction size is required';
    if (!chargebackRate.trim()) newErrors.chargebackrefungrate = 'Charge/Back refund rate is required';
    
    // Check if at least one currency is selected
    const hasCurrency = formData.requredcurrency.KES || 
                       formData.requredcurrency.USD || 
                       formData.requredcurrency.GBP || 
                       (formData.requredcurrency.other && formData.requredcurrency.otherText.trim() !== '');
    if (!hasCurrency) newErrors.requredcurrency = 'At least one currency must be selected';
    
    // Check if at least one payment method is selected
    const hasPaymentMethod = formData.paymentmethodtobesupported.credit || 
                            formData.paymentmethodtobesupported.mobilemoney || 
                            (formData.paymentmethodtobesupported.other && formData.paymentmethodtobesupported.otherText.trim() !== '');
    if (!hasPaymentMethod) newErrors.paymentmethodtobesupported = 'At least one payment method must be selected';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Transform data to match API structure
        const payload = {
          merchantid: localStorage.getItem('merchantId') || 'MID123456',
          completed: formData.completed,
          requredcurrency: {
            KES: formData.requredcurrency.KES,
            USD: formData.requredcurrency.USD,
            GBP: formData.requredcurrency.GBP,
            other: formData.requredcurrency.other,
            otherText: formData.requredcurrency.otherText
          },
          exmonthlytransaction: {
            amountinusd: parseInt(formData.exmonthlytransaction.amountinusd),
            numberoftran: parseInt(formData.exmonthlytransaction.numberoftran)
          },
          avgtranssize: parseInt(formData.avgtranssize),
          paymentmethodtobesupported: {
            credit: formData.paymentmethodtobesupported.credit,
            mobilemoney: formData.paymentmethodtobesupported.mobilemoney,
            other: formData.paymentmethodtobesupported.other,
            otherText: formData.paymentmethodtobesupported.otherText
          },
          chargebackrefungrate: formData.chargebackrefungrate
        };

        // Use PUT for updates, POST for new submissions
        const method = originalData ? 'PUT' : 'POST';
        const response = await fetch('http://localhost:4000/api/paymentinfo', {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Payment info submitted successfully:', result);
          const successMessage = originalData ? "Payment information updated successfully!" : "Payment information submitted successfully!";
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
          console.error('Failed to submit payment info:', response.statusText);
          setAlert({
            open: true,
            message: "Failed to submit payment information. Please try again.",
            severity: "error"
          });
        }
      } catch (error) {
        console.error('Error submitting payment info:', error);
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
      <div className="payment-info-form">
        <div className="form-header">
          <h2>Payment Processing Information</h2>
          <p>Loading your data...</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-info-form">
      <div className="form-header">
        <h2>Payment And Processing Information</h2>
        <p>Please provide your payment processing requirements</p>
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
            ✓ SUBMITTED - Payment information completed
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="kyc-form">
        <div className="form-section">
          <h3>Required Currency</h3>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.requredcurrency.KES}
                onChange={(e) => handleCurrencyChange('KES', e.target.checked)}
              />
              <span className="checkmark"></span>
              KES
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.requredcurrency.USD}
                onChange={(e) => handleCurrencyChange('USD', e.target.checked)}
              />
              <span className="checkmark"></span>
              USD
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.requredcurrency.GBP}
                onChange={(e) => handleCurrencyChange('GBP', e.target.checked)}
              />
              <span className="checkmark"></span>
              GBP
            </label>
              <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.requredcurrency.other}
                onChange={(e) => handleCurrencyChange('other', e.target.checked)}
              />
              <span className="checkmark"></span>
              other
            </label>
          </div>
          {formData.requredcurrency.other && (
            <div className="others-input">
              <input
                type="text"
                name="requredcurrency.otherText"
                value={formData.requredcurrency.otherText}
                onChange={handleInputChange}
                placeholder="Enter other Currency"
              />
            </div>
          )}
          {errors.requredcurrency && <span className="error-message">{errors.requredcurrency}</span>}
        </div>

        <div className="form-section">
          <h3>Expected Monthly Transaction Volume</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="exmonthlytransaction.amountinusd">Amount In USD equivalent *</label>
              <input
                type="number"
                id="exmonthlytransaction.amountinusd"
                name="exmonthlytransaction.amountinusd"
                value={formData.exmonthlytransaction.amountinusd}
                onChange={handleInputChange}
                placeholder="Enter Amount In USD equivalent"
                min="0"
                step="0.01"
                className={errors['exmonthlytransaction.amountinusd'] ? 'error' : ''}
              />
              {errors['exmonthlytransaction.amountinusd'] && <span className="error-message">{errors['exmonthlytransaction.amountinusd']}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="exmonthlytransaction.numberoftran">Number of Transactions *</label>
              <input
                type="number"
                id="exmonthlytransaction.numberoftran"
                name="exmonthlytransaction.numberoftran"
                value={formData.exmonthlytransaction.numberoftran}
                onChange={handleInputChange}
                placeholder="Enter Number of Transactions"
                min="0"
                className={errors['exmonthlytransaction.numberoftran'] ? 'error' : ''}
              />
              {errors['exmonthlytransaction.numberoftran'] && <span className="error-message">{errors['exmonthlytransaction.numberoftran']}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="avgtranssize">Average Transaction Size *</label>
              <input
                type="number"
                id="avgtranssize"
                name="avgtranssize"
                value={formData.avgtranssize}
                onChange={handleInputChange}
                placeholder="Enter Average Transaction Size"
                min="0"
                step="0.01"
                className={errors.avgtranssize ? 'error' : ''}
              />
              {errors.avgtranssize && <span className="error-message">{errors.avgtranssize}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Supported Payment Method</h3>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.paymentmethodtobesupported.credit}
                onChange={(e) => handlePaymentMethodChange('credit', e.target.checked)}
              />
              <span className="checkmark"></span>
              Credit
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.paymentmethodtobesupported.mobilemoney}
                onChange={(e) => handlePaymentMethodChange('mobilemoney', e.target.checked)}
              />
              <span className="checkmark"></span>
              Mobile Money
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.paymentmethodtobesupported.other}
                onChange={(e) => handlePaymentMethodChange('other', e.target.checked)}
              />
              <span className="checkmark"></span>
              other
            </label>
          </div>
          {formData.paymentmethodtobesupported.other && (
            <div className="others-input">
              <input
                type="text"
                name="paymentmethodtobesupported.otherText"
                value={formData.paymentmethodtobesupported.otherText}
                onChange={handleInputChange}
                placeholder="Enter Other Payment Method"
              />
            </div>
          )}
          {errors.paymentmethodtobesupported && <span className="error-message">{errors.paymentmethodtobesupported}</span>}
        </div>

        <div className="form-section">
          <div className="form-group">
            <label htmlFor="chargebackrefungrate">Charge/Back Refund Rate *</label>
            <div className="others-input"> 
            <input
              type="text"
              id="chargebackrefungrate"
              name="chargebackrefungrate"
              value={formData.chargebackrefungrate}
              onChange={handleInputChange}
              placeholder="Enter Charge/Back Refund Rate"
              className={errors.chargebackrefungrate ? 'error' : ''}
            />     </div>
            {errors.chargebackrefungrate && <span className="error-message">{errors.chargebackrefungrate}</span>}
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

export default PaymentInfo;
