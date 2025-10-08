import React, { useState, useEffect } from 'react';
import './Sidebar.scss';
import { useLogout } from '../../utils/logout';
import pepForm from '../../assets/PEP Form.pdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const Sidebar = ({ isOpen, onClose, currentStep }) => {
  const fullname = localStorage.getItem("fullname");
  const email = localStorage.getItem("email");
  const firstLetter = fullname ? fullname.charAt(0).toUpperCase() : "?";
  const [userProfile, setUserProfile] = useState({
    fullname: fullname || 'User',
    email: email || '',
    notifications: 3
  });
  const handleLogout = useLogout();
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:4000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('Sidebar - User Profile Data:', userData);
          
          // Extract user info from the response
          const userInfo = {
            fullname: userData.fullname || userData.name || fullname || 'User',
            email: userData.email || email || '',
            notifications: 3
          };
          
          setUserProfile(userInfo);
        }
      } catch (error) {
        console.error('Error fetching user profile in sidebar:', error);
        // Fallback to localStorage data
        setUserProfile({
          fullname: fullname || 'User',
          email: email || '',
          notifications: 3
        });
      }
    };

    fetchUserProfile();
  }, [fullname, email]);
  
  const menuItems = [
    { id: 1, title: 'Company Information', icon: '🏢', path: '/company-info' },
    { id: 2, title: 'Ultimate Beneficial Owner', icon: '👤', path: '/ubo' },
    { id: 3, title: 'Payment Information', icon: '💳', path: '/payment-info' },
    { id: 4, title: 'Bank Details', icon: '🏦', path: '/bank-details' },
    { id: 5, title: 'Risk Management', icon: '🛡️', path: '/risk-management' },
    { id: 6, title: 'KYC Documents', icon: '📄', path: '/kyc-documents' }
  ];

  const additionalItems = [
    { title: 'Pep Form', icon: <FileDownloadIcon style={{ fontSize: '1.2rem' }} />, path: '' ,download: true,file: pepForm},
    { title: 'Profile Settings', icon: '⚙️', path: '/profile' },
    { title: 'Help & Support', icon: '❓', path: '/help' },
    { title: 'Logout', icon: '🚪', path: '/logout', isLogout: true }
  ];

  const handleItemClick = (item) => {
    if (item.isLogout) {
      handleLogout();
    } else if (item.download && item.file) {
      // Handle file download
      const link = document.createElement('a');
      link.href = item.file;
      link.download = `${item.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Handle other navigation items
      console.log(`Navigate to: ${item.path}`);
    }
  };

  return (
    <>
      {isOpen && <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''} desktop-sticky`}>
        <div className="">
          <div className="">
               {/* <img style={{padding: '0', height: '120px', width: '120px'}} src="src/assets/gypsum.png" alt="Compliance Web" /> */}
            {/* <div className="brand-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div> */}
            {/* <div className="brand-text">
              <h3>MAMLAKA HUB</h3>
              <p>SPOKE TRADE NETWORK</p>
            </div> */}
          </div>
          {/* <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button> */}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h4>KYC Process</h4>
            <ul className="nav-list">
              {menuItems.map((item) => (
                <li key={item.id} className={`nav-item ${currentStep === item.id ? 'active' : ''}`}>
                  <a href="#" className="nav-link">
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.title}</span>
                    {currentStep === item.id && <span className="nav-indicator"></span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-section">
            <h4>Account</h4>
            <ul className="nav-list">
              {additionalItems.map((item, index) => (
                <li key={index} className="nav-item">
                  <button 
                    className="nav-link"
                    onClick={() => handleItemClick(item)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      width: '100%', 
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      color: 'inherit',
                      textDecoration: 'none'
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span>{firstLetter}</span>
            </div>
            <div className="user-details">
              <h4>{userProfile.fullname}</h4>
            <p style={{fontSize: '10px'}}>{userProfile.email || 'Loading...'} </p>
            </div>
            <div className="notification-bell">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
          </div>
          <div className="progress-info">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / 6) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">
              Step {currentStep} of 6
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;




