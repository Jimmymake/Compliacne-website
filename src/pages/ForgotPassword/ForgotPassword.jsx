import React, { useState } from "react"
import { fakeAuthApi } from "../../services/fakeAuthApi"

export default function ForgotForm({ onSwitch }) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    async function handleSubmit(e) {
        e.preventDefault()
        setMessage(null)
        if (!email) return setMessage('Please enter your email')

        setLoading(true)
        try {
            const res = await fakeAuthApi.forgot(email)
            setMessage(res.message)
            setTimeout(() => onSwitch('login'), 1800)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="field">
                <label htmlFor="forgot-email">Email</label>
                <input id="forgot-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@mail.com" />
            </div>

            <div aria-live="polite" className="status">
                {message && <div className="success">{message}</div>}
            </div>

            <button className="btn" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>

            <p className="muted small">Tip: This demo doesn't actually send emails — integrate with a real backend to send real reset links.</p>
        </form>
    )
}