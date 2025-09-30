
import React, { useState } from "react"
import { fakeAuthApi } from "../../services/fakeAuthApi"
import Authtextfield from "../../components/Textfield/Textfield"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom";


export default function SignupForm({ onSwitch }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phonenumber, setPhonenumber] = useState("")
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const navigate = useNavigate();


    async function handleSubmit(e) {
        e.preventDefault()

        if (!name || !email || !phonenumber || !password || !confirm) {
            setError("Please fill in all fields")
            return
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        if (password !== confirm) {
            setError("Passwords do not match")
            return
        }

        const userData = {
            fullname: name,
            email,
            phonenumber: phonenumber.startsWith("+254") ? phonenumber : `+254${phonenumber}`,
            location: "Nairobi",
            password,
            role: "user",
        }

        try {
            setLoading(true)
            const response = await fetch("http://localhost:4000/api/user/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            })

            if (response.ok) {
                const responseData = await response.json();
                const token = responseData.token;
                const decoded = jwtDecode(token);
                
                console.log("Decoded token:", decoded);

                localStorage.setItem("token", token);
                if (decoded.fullname) localStorage.setItem("fullname", decoded.fullname);
                if (decoded.merchantId) localStorage.setItem("merchantId", decoded.merchantId);
                if (decoded.role) localStorage.setItem("role", decoded.role);
                if (decoded.email) localStorage.setItem("email", decoded.email);
                if (decoded.name) localStorage.setItem("name", decoded.name);
                console.log(decoded.role);
                // localStorage.setItem("token", responseData.token)
                // localStorage.setItem("email", responseData.user.email)
                // localStorage.setItem("name", responseData.user.fullname)

                if (decoded.merchantId) {
                    localStorage.setItem("merchantId", decoded.merchantId)
                }

                setSuccess("Signed up successfully!")
                setTimeout(() => {
                    if (decoded.role === "admin") {
                        navigate("/AdminDashboard");
                    } else if (decoded.role === "user") {
                        navigate("/UserDashboard");
                    } else {
                        navigate("/"); // fallback
                    }
                }, 1200);
            } else {
                // Handle error responses
                const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
                
                if (response.status === 400) {
                    setError("User with this email or phone number already exists")
                } else {
                    setError(errorData.message || "Signup failed. Please try again.")
                }
            }
          
        } catch (err) {
            setError(err.message || "An error occurred while signing up")
        } finally {
            setLoading(false)
        }
    }




    return (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>

            <div className="field">
                <label htmlFor="signup-name">Full name</label>

                <Authtextfield id="signup-name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Appleseed"></Authtextfield>
            </div>

            <div className="field">
                <label htmlFor="signup-email">Email</label>

                <Authtextfield id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jondoe@mail.com" ></Authtextfield>
            </div>

            <div className="field">
                <label htmlFor="signup-phonenumber">Phone Number</label>
                <Authtextfield id="phonenumber" type="phone" value={phonenumber} onChange={e => setPhonenumber(e.target.value)} placeholder="+254717126559" ></Authtextfield>
            </div>

            <div className="field">
                <label htmlFor="signup-password">Password</label>
                <Authtextfield id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" ></Authtextfield>
            </div>

            <div className="field">
                <label htmlFor="signup-confirm">Confirm password</label>
                <Authtextfield id="signup-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" ></Authtextfield>
            </div>

            <div aria-live="polite" className="status">
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
            </div>

            <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        </form>
    )
}