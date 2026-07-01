import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Eye, EyeOff, Globe } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const usersDb = {
    "shantanugudmewar@gmail.com": "Shantanu Gudmewar",
    "moulendrabalaji2007@gmail.com": "Moulendra Balaji",
    "shrishtis089@gmail.com": "Shrishti Singh",
    "ruturajambure@gmail.com": "Ruturaj Ambure",
    "demo@gmail.com": "Demo User"
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Check credentials
    if (password !== 'nexus2026') {
      alert('Authentication failed: Invalid credentials. Please use the developer password "nexus2026".');
      return;
    }

    const emailKey = email.toLowerCase().trim();
    let resolvedName = usersDb[emailKey];
    if (!resolvedName) {
      // Auto-extract name from email prefix
      const prefix = emailKey.split('@')[0];
      resolvedName = prefix.split(/[\._-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    // Save token and user details dynamically
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IiR7ZW1haWxLZXl9In0.sig`;
    localStorage.setItem('nexus_jwt_token', mockJwt);
    localStorage.setItem('nexus_current_user', JSON.stringify({
      name: resolvedName,
      email: emailKey,
      title: 'Senior Recruiting Partner',
      dept: 'Talent Acquisition'
    }));

    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Branding Panel */}
      <div 
        style={{
          width: '50%',
          backgroundColor: 'var(--color-brand)',
          padding: '48px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}
        className="login-left"
      >
        {/* Top-left: NEXUS wordmark + small geometric icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '20px' }}>
          <Bot size={24} color="#FFFFFF" />
          <span>NEXUS</span>
        </div>

        {/* Center: Headline and Subheadline */}
        <div style={{ maxWidth: '480px', margin: 'auto 0' }}>
          <h1 style={{ color: '#FFFFFF', fontSize: '38px', fontWeight: 700, lineHeight: 1.2, marginBottom: '16px' }}>
            Hire with Intelligence.<br />Not Instinct.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.6 }}>
            AI-powered candidate ranking, explainability, and hiring intelligence — built for teams that move fast.
          </p>
        </div>

        {/* Bottom stats row */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: '24px',
            gap: '16px'
          }}
        >
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>10,000+</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginTop: '4px' }}>Candidates Ranked</div>
          </div>
          <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>8</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginTop: '4px' }}>AI Agents</div>
          </div>
          <div style={{ width: '1px', height: '32px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>&lt; 8s</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginTop: '4px' }}>Shortlist Time</div>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div 
        style={{
          width: '50%',
          backgroundColor: 'var(--bg-page)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px'
        }}
        className="login-right"
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div className="text-muted text-small" style={{ marginBottom: '4px' }}>Welcome back</div>
          <h2 style={{ fontSize: '28px', marginBottom: '32px' }}>Sign in to NEXUS</h2>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="text-label" htmlFor="email-input">Work Email</label>
              <input 
                id="email-input"
                type="email" 
                className="input-field" 
                placeholder="you@company.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ position: 'relative', marginBottom: '12px' }}>
              <label className="text-label" htmlFor="password-input">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="password-input"
                  type={showPassword ? 'text' : 'password'} 
                  className="input-field" 
                  placeholder="••••••••" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <Link 
                to="/forgot-password" 
                style={{ 
                  color: 'var(--color-brand)', 
                  textDecoration: 'none', 
                  fontSize: '12px', 
                  fontWeight: 500 
                }}
              >
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginBottom: '20px' }}>
              Sign In
            </button>
          </form>



          <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: 1.5, marginTop: '24px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Need workspace access? Contact your organization administrator to receive an email invitation to the workspace.
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left {
            display: none !important;
          }
          .login-right {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
