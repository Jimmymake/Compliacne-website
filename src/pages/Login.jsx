

import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";   // install with: npm install jwt-decode
import { useNavigate } from "react-router-dom";
import Authtextfield from "./Textfield";
import Buttoncomb from "./Buttoncomponet";


export default function LoginForm({ onSwitch }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const loginData = { emailOrPhone: email, password };

            const response = await fetch("https://complianceapis.mam-laka.com/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const responseData = await response.json();
                const token = responseData.token;
                const decoded = jwtDecode(token);

                console.log("Decoded token:", decoded);

                // localStorage.setItem("token", token);
                if (decoded.fullname) localStorage.setItem("fullname", decoded.fullname);
                if (decoded.merchantId) localStorage.setItem("merchantId", decoded.merchantId);
                if (decoded.role) localStorage.setItem("role", decoded.role);
                if (decoded.email) localStorage.setItem("email", decoded.email);
                console.log(decoded.role);

                setSuccess("Logged in successfully!");

                setTimeout(() => {



                    if (decoded.role === "admin") {
                        navigate("/AdminDashboard");
                    } else if (
                        decoded.role === "user"
                    ) {
                        navigate("/UserDashboard");
                    } else {
                        navigate("/"); // fallback
                    }

                }, 1200);
            } else if (response.status === 401 || response.status === 403) {
                setError("Invalid credentials");
            } else {
                setError("Login failed. Try again later.");
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="field">
                <label htmlFor="login-email">Email</label>
                <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jondoe@gmail.com"
                    required
                    className="border border-gray-300 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    style={{ minHeight: '48px' }}
                />
            </div>

            <div className="field">
                <label htmlFor="login-password">Password</label>
                <div className="password-input-container" style={{ position: 'relative' }}>
                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="border border-gray-300 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 text-lg"
                        style={{ minHeight: '48px' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>
            </div>

            <div className="meta-row">
                <label className="small">
                    <input type="checkbox" /> Remember me
                </label>
                <button type="button" className="link" onClick={() => onSwitch("forgot")}>
                    Forgot?
                </button>
            </div>

            <button 
                className="btn w-full py-3 px-4 text-lg font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                type="submit" 
                disabled={loading}
                style={{ minHeight: '48px' }}
            >
                {loading ? "Signing in..." : "Sign in"}
            </button>

            <div aria-live="polite" className="status">
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
            </div>

            <div className="or">or</div>
            <div className="socials">
                <button 
                    type="button" 
                    className="btn ghost w-full py-3 px-4 text-lg font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ minHeight: '48px' }}
                >
                    Continue with Google
                </button>
            </div>
        </form>
    );
}
