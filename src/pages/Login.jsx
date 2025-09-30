

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

            const response = await fetch("http://localhost:4000/api/user/login", {
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
                <Authtextfield
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jondoe@gmail.com"
                    required
                />
            </div>

            <div className="field">
                <label htmlFor="login-password">Password</label>
                <div className="input-suffix">
                    <Authtextfield
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <Buttoncomb
                        type="button"
                        className="icon-btn"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </Buttoncomb>
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

            <Buttoncomb className="btn" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
            </Buttoncomb>

            <div aria-live="polite" className="status">
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
            </div>

            <div className="or">or</div>
            <div className="socials">
                <button type="button" className="btn ghost">Continue with Google</button>
            </div>
        </form>
    );
}
