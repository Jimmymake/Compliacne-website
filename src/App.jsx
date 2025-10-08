

import "../src/App.scss"
import React, { useState, useEffect } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import LoginForm from "./pages/LogInpage/Login"
import SignupForm from "./pages/SignUppage/Signup"
import ForgotForm from "./pages/ForgotPassword/ForgotPassword"
import UserDashboard from "./pages/Userdashboard/UserDashboard"
import AdminDashboard from "./pages/Admindashboard/AdminDashboard"
import LoginAnimations from "./components/LoginAnimations/LoginAnimations"
import { logout } from "./utils/logout"
// import Homepage from "./pages/Homepage/Homepage"

// Logout component to handle direct logout requests
const LogoutComponent = () => {
  useEffect(() => {
    logout();
  }, []);
  
  return <Navigate to="/" replace />;
};

function App() {
  const [mode, setMode] = useState("login") // 'login' | 'signup' | 'forgot'

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  // Protected Route component
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/" replace />;
    }

    const userRole = localStorage.getItem('role');
    if (requiredRole && userRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <Routes>
      {/* Homepage Route */}
      {/* <Route path="/home" element={<Homepage />} /> */}

      {/* Auth Routes */}
      <Route path="/" element={
        <div className="auth-page">
          {/* <LoginAnimations /> */}
          <div className="auth-card">
            {/* brand/aside */}
            <aside className="auth-brand">
              <div className="brand-inner">
                <img
                  src="src/assets/logo.png"
                  alt="logo"
                  style={{
                    margin: "0",
                    width: "200px",
                    height: "auto",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />

                <h1>Compliance Web</h1>
                <p className="tag">Simple secure auth</p>
                <div className="hero-illustration" aria-hidden>
                  <div className="circle" />
                </div>
              </div>
            </aside>

            <main className="auth-form-wrap">
              <div className="form-header">
                <h2>
                  {mode === "login"
                    ? "Welcome back"
                    : mode === "signup"
                      ? "Create account"
                      : "Reset password"}
                </h2>
                <p className="muted">
                  {mode === "login"
                    ? "Sign in to continue"
                    : mode === "signup"
                      ? "Let's make your account"
                      : "Enter your email to receive reset instructions"}
                </p>
              </div>

              <div className="form-card">
                {mode === "login" && <LoginForm onSwitch={setMode} />}
                {mode === "signup" && <SignupForm onSwitch={setMode} />}
                {mode === "forgot" && <ForgotForm onSwitch={setMode} />}
              </div>
              <div className="form-footer">
                {mode !== 'signup' ? (
                  <p>
                    New here? <button className="link" onClick={() => setMode('signup')}>Create an account</button>
                  </p>
                ) : (
                  <p>
                    Already have an account? <button className="link" onClick={() => setMode('login')}>Sign in</button>
                  </p>
                )}
              </div>
            </main>
          </div>
        </div>
      } />

      {/* Dashboard Routes */}
      <Route path="/AdminDashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      {/* Merchant Detail Route */}
      <Route path="/AdminDashboard/merchant/:merchantId" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/UserDashboard" element={
        <ProtectedRoute requiredRole="user">
          <UserDashboard />
        </ProtectedRoute>
      } />

      {/* Logout route */}
      <Route path="/logout" element={<LogoutComponent />} />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
