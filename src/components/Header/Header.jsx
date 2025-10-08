import React, { useState, useEffect } from 'react';
import './Header.scss';
import { Stepper, Step, StepLabel, Typography, Box, Link, Tooltip, IconButton, Avatar, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLogout } from '../../utils/logout';
import logo from '../../assets/logo.png';

const Header = ({ currentStep, totalSteps, onMenuClick }) => {
  const fullname = localStorage.getItem("fullname");
  const email = localStorage.getItem("email");
  const firstLetter = fullname ? fullname.charAt(0).toUpperCase() : "?";
  const [anchorEl, setAnchorEl] = useState(null);
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
          console.log('Header - User Profile Data:', userData);
          
          // Extract user info from the response
          const userInfo = {
            fullname: userData.fullname || userData.name || fullname || 'User',
            email: userData.email || email || '',
            notifications: 3
          };
          
          setUserProfile(userInfo);
        }
      } catch (error) {
        console.error('Error fetching user profile in header:', error);
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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    handleLogout();
  };

  const steps = [
    "Company Infor",
    "UBO", 
    "Payment Infor",
    "Bank Details",
    "Risk Management Infor",
    "KYC Documents"
  ];

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        {/* <img style={{ height: '200px'}} src="src/assets/logo.png" alt="Compliance Web" /> */}
        {/* <div className="logo">
         <div style={{width: '100px', }}></div>
          <span>Compliance Website</span>
        </div> */}
               <div className="brand-logo">
            <img 
              src={logo} 
              alt="MAMLAKA HUB Logo" 
              style={{ 
                width: '100px', 
                height: '100px', 
                objectFit: 'contain' 
              }} 
            />
          </div>
            <div className="brand-text">
              <Typography variant="p" className="brand-title">
                MAMLAKA HUB & SPOKE
              </Typography>
              {/* <Typography variant="caption" className="brand-subtitle">
                SPOKE TRADE NETWORK
              </Typography> */}
            </div>
          </div>
      {/* </div> */}

      {/* <div className="header-center"> */}
        <Stepper activeStep={currentStep - 1} sx={{ 
          padding: '0',
          '& .MuiStepLabel-root': {
            '& .MuiStepLabel-label': {
              fontSize: '10px',
              '@media (max-width: 768px)': {
                display: 'none'
              }
            },
            '& .MuiStepIcon-root': {
              width: '20px',
              height: '20px',
              '@media (max-width: 768px)': {
                width: '16px',
                height: '16px'
              }
            }
          }
        }}>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {
              sx: { fontSize: '10px' }
            };
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>
                  <Typography variant="caption" sx={{ fontSize: '10px' }}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      {/* </div> */}

      <div className="header-right">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div className="user-profile-card">
            <div className="user-info">
              <div className="user-name">{userProfile.fullname}</div>
              {/* {userProfile.email && (
                <div className="user-email">{userProfile.email}</div>
              )} */}
            </div>
          </div>
          <Tooltip title="Alerts • No alerts">
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          <IconButton 
            color="secondary" 
            sx={{ p: 0.5 }}
            onClick={handleMenuOpen}
          >
            <Avatar
              sx={{
                bgcolor: "secondary",
                width: 48,
                height: 48,
                fontSize: 24,
                cursor: 'pointer'
              }}
            >
              {firstLetter}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiPaper-root': {
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: '1px solid #333',
              }
            }}
          >
            <MenuItem onClick={handleLogoutClick}>
              <ListItemIcon>
                <LogoutIcon sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </div>
    </header>
  );
};

export default Header;
