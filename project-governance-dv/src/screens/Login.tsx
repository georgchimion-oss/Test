import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getStaff, onDataRefresh } from '../data/dataLayer'

export default function Login() {
  const { login, loginWithMicrosoft, isSsoEnabled } = useAuth()
  const [staff, setStaff] = useState(getStaff())
  const [selectedUserId, setSelectedUserId] = useState('')
  const [showDemoLogin, setShowDemoLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return onDataRefresh(() => setStaff(getStaff()))
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedUserId) {
      const user = staff.find(s => s.id === selectedUserId)
      if (user) {
        window.localStorage.setItem('manualUsername', user.name.split(' ')[0].toLowerCase())
        login(selectedUserId)
      }
    }
  }

  const handleMicrosoftLogin = async () => {
    setIsLoading(true)
    setError('')
    try {
      await loginWithMicrosoft()
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '3rem',
          maxWidth: '450px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #E88D14, #DB4E18)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
            }}
          >
            ProjectGov
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Project Governance Dashboard
          </p>
        </div>

        {/* Microsoft SSO Button */}
        {isSsoEnabled && (
          <>
            <button
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                background: '#2F2F2F',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.background = '#404040'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2F2F2F'
              }}
            >
              {/* Microsoft Logo */}
              <svg width="20" height="20" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
            </button>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.75rem', textAlign: 'center' }}>
                {error}
              </p>
            )}

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '1.5rem 0',
                color: 'var(--text-secondary)',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ padding: '0 1rem' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
          </>
        )}

        {/* Demo Login Toggle */}
        {!showDemoLogin ? (
          <button
            type="button"
            onClick={() => setShowDemoLogin(true)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.9375rem',
              fontWeight: '500',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.color = 'var(--primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            {isSsoEnabled ? 'Use Demo Account' : 'Select Account'}
          </button>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Select User *</label>
              <select
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={{ fontSize: '0.9375rem' }}
              >
                <option value="">-- Choose your account --</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.title})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #E88D14, #DB4E18)',
                border: 'none',
              }}
            >
              Sign In
            </button>

            {isSsoEnabled && (
              <button
                type="button"
                onClick={() => setShowDemoLogin(false)}
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.5rem',
                  fontSize: '0.8125rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                ← Back to Microsoft Sign-In
              </button>
            )}
          </form>
        )}

        <p
          style={{
            marginTop: '1.5rem',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          {isSsoEnabled
            ? 'Sign in with your PwC Microsoft account.'
            : 'Select your account to continue.'}
        </p>
      </div>
    </div>
  )
}
