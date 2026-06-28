import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
    }, 1500);
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-page)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px'
      }}
    >
      <div 
        className="card" 
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '32px',
          position: 'relative'
        }}
      >
        {!submitted ? (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <Link 
                to="/login" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </Link>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-nav-active)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: 'var(--color-brand)'
                }}
              >
                <Lock size={22} />
              </div>
              <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Forgot your password?</h2>
              <p className="text-muted text-small">
                Enter your work email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="text-label" htmlFor="email-field">Work Email</label>
                <input 
                  id="email-field"
                  type="email" 
                  className="input-field" 
                  placeholder="you@company.com" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginBottom: '24px' }}>
                Send Reset Link
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Remembered it? </span>
              <Link 
                to="/login" 
                style={{ color: 'var(--color-brand)', textDecoration: 'none', fontWeight: 600 }}
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-nav-active)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: 'var(--color-brand)'
              }}
            >
              <CheckCircle2 size={24} color="var(--color-brand)" />
            </div>
            
            <h2 style={{ fontSize: '22px', marginBottom: '12px' }}>Check your inbox</h2>
            <p className="text-muted text-small" style={{ marginBottom: '24px', lineHeight: 1.6 }}>
              We've sent a reset link to <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>. It expires in 30 minutes.
            </p>

            <button 
              type="button" 
              className="btn btn-secondary btn-full"
              onClick={handleResend}
              disabled={resending}
              style={{ marginBottom: '24px' }}
            >
              {resending ? 'Sending...' : 'Resend email'}
            </button>

            <Link 
              to="/login" 
              style={{
                color: 'var(--color-brand)',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
