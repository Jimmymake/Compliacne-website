import { useNavigate } from 'react-router-dom';

/**
 * Utility function to handle user logout
 * Clears all user data from localStorage and redirects to login page
 */
export const logout = () => {
  // Clear all user-related data from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('fullname');
  localStorage.removeItem('merchantId');
  localStorage.removeItem('role');
  localStorage.removeItem('email');
  localStorage.removeItem('name');
  
  // Redirect to login page
  window.location.href = '/';
};

/**
 * Hook for logout functionality with navigation
 * @returns {Function} logout function
 */
export const useLogout = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear all user-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('fullname');
    localStorage.removeItem('merchantId');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    
    // Navigate to login page
    navigate('/', { replace: true });
  };
  
  return handleLogout;
};
