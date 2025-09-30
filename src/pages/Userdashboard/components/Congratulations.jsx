import React from 'react';
import './Congratulations.scss';

const Congratulations = ({ data, onNext, onBack, currentStep, totalSteps }) => {
  const handleComplete = () => {
    // Handle completion logic here
    console.log('KYC process completed!', data);
    // You can redirect to dashboard or show success message
  };

  return (
    <div className="congratulations-page">
      <div className="success-animation">
        <div className="checkmark-circle">
          <svg className="checkmark" viewBox="0 0 52 52">
            <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark-check" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
      </div>

      <div className="congratulations-content">
        <h1>🎉 Congratulations!</h1>
        <h2>KYC Process Completed Successfully</h2>
        
        <div className="success-message">
          <p>
            Thank you for completing the KYC (Know Your Customer) process. 
            Your application has been submitted and is now under review.
          </p>
          
          <div className="next-steps">
            <h3>What happens next?</h3>
            <ul>
              <li>
                <span className="step-icon">📋</span>
                <span>Our compliance team will review your submitted documents</span>
              </li>
              <li>
                <span className="step-icon">⏱️</span>
                <span>Review process typically takes 2-5 business days</span>
              </li>
              <li>
                <span className="step-icon">📧</span>
                <span>You'll receive email notifications about the status</span>
              </li>
              <li>
                <span className="step-icon">✅</span>
                <span>Once approved, you can start using our services</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="summary-card">
          <h3>Application Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Company Information</span>
              <span className="summary-status completed">✓ Completed</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Ultimate Beneficial Owner</span>
              <span className="summary-status completed">✓ Completed</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Payment Information</span>
              <span className="summary-status completed">✓ Completed</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Bank Details</span>
              <span className="summary-status completed">✓ Completed</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Risk Management</span>
              <span className="summary-status completed">✓ Completed</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">KYC Documents</span>
              <span className="summary-status completed">✓ Completed</span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            Start New Application
          </button>
          <button className="btn-primary" onClick={handleComplete}>
            Go to Dashboard
          </button>
        </div>

        <div className="support-info">
          <p>
            Need help? Contact our support team at{' '}
            <a href="mailto:info@mam-laka.com">info@mam-laka.com</a>
            {' '}or call us at{' '}
            <a href="tel:+254717126550">+254717126550</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Congratulations;



