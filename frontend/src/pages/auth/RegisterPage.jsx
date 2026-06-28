import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ChevronRight, Check } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [weightPreset, setWeightPreset] = useState('Balanced');
  const [biasMitigation, setBiasMitigation] = useState(true);

  // Password strength checker helper
  const getPasswordStrength = () => {
    if (!password) return { text: '', color: '#E5E0D8', pct: 0 };
    if (password.length < 6) return { text: 'Weak', color: 'var(--color-brand)', pct: 33 };
    if (password.length < 10) return { text: 'Medium', color: 'var(--color-accent)', pct: 66 };
    return { text: 'Strong', color: '#28A745', pct: 100 };
  };

  const strength = getPasswordStrength();

  const handleNext = (e) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleLaunch = () => {
    // Save state in mock DB
    try {
      const db = JSON.parse(localStorage.getItem('nexus_mock_db') || '{}');
      db.onboarding = { step: 3, companyName, industry, size: companySize, website };
      localStorage.setItem('nexus_mock_db', JSON.stringify(db));
    } catch(e) {}
    
    // Simulate successful JWT token storage
    const mockJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEiLCJlbWFpbCI6ImxvZ2luQG5leHVzLmFpIn0.sig";
    localStorage.setItem('nexus_jwt_token', mockJwt);
    navigate('/');
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-page)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px'
      }}
    >
      {/* Top Logo */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '24px',
          color: 'var(--color-brand)',
          marginBottom: '32px'
        }}
      >
        <Bot size={28} color="var(--color-brand)" />
        <span>NEXUS</span>
      </div>

      {/* Main card box */}
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '40px',
          marginBottom: 0
        }}
      >
        {/* Stepper progress indicator */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
            position: 'relative'
          }}
        >
          {/* Horizontal Line background */}
          <div 
            style={{
              position: 'absolute',
              top: '16px',
              left: '32px',
              right: '32px',
              height: '2px',
              backgroundColor: 'var(--color-border)',
              zIndex: 1
            }}
          ></div>
          
          {/* Active indicator colored line */}
          <div 
            style={{
              position: 'absolute',
              top: '16px',
              left: '32px',
              width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
              height: '2px',
              backgroundColor: 'var(--color-brand)',
              transition: 'width 0.3s ease-in-out',
              zIndex: 1
            }}
          ></div>

          {/* Step 1 Node */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '80px' }}>
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: step >= 1 ? 'var(--color-brand)' : 'var(--bg-card)',
                border: `2px solid ${step >= 1 ? 'var(--color-brand)' : 'var(--color-border)'}`,
                color: step >= 1 ? '#FFFFFF' : 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              {step > 1 ? <Check size={14} /> : '1'}
            </div>
            <span style={{ fontSize: '11px', fontWeight: step === 1 ? 600 : 500, color: step === 1 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>Company</span>
          </div>

          {/* Step 2 Node */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '80px' }}>
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: step > 2 ? 'var(--color-brand)' : step === 2 ? 'var(--color-brand)' : 'var(--bg-card)',
                border: `2px solid ${step >= 2 ? 'var(--color-brand)' : 'var(--color-border)'}`,
                color: step >= 2 ? '#FFFFFF' : 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              {step > 2 ? <Check size={14} /> : '2'}
            </div>
            <span style={{ fontSize: '11px', fontWeight: step === 2 ? 600 : 500, color: step === 2 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>Account</span>
          </div>

          {/* Step 3 Node */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '80px' }}>
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: step === 3 ? 'var(--color-brand)' : 'var(--bg-card)',
                border: `2px solid ${step === 3 ? 'var(--color-brand)' : 'var(--color-border)'}`,
                color: step === 3 ? '#FFFFFF' : 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '12px'
              }}
            >
              '3'
            </div>
            <span style={{ fontSize: '11px', fontWeight: step === 3 ? 600 : 500, color: step === 3 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>Preferences</span>
          </div>
        </div>

        {/* STEP 1: Company Details */}
        {step === 1 && (
          <form onSubmit={handleNext}>
            <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Set up your company</h2>
            <p className="text-muted text-small" style={{ marginBottom: '24px' }}>
              This information helps NEXUS personalize your hiring workspace.
            </p>

            <div className="form-group">
              <label className="text-label" htmlFor="company-name">Company Name</label>
              <input 
                id="company-name"
                type="text" 
                className="input-field" 
                placeholder="Acme Corp" 
                required 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="text-label" htmlFor="industry-select">Industry</label>
              <select 
                id="industry-select"
                className="input-field" 
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="text-label" htmlFor="company-size-select">Company Size</label>
              <select 
                id="company-size-select"
                className="input-field" 
                required
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
              >
                <option value="">Select Size</option>
                <option value="1-10">1 - 10 employees</option>
                <option value="11-50">11 - 50 employees</option>
                <option value="51-200">51 - 200 employees</option>
                <option value="201-500">201 - 500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>

            <div className="form-group">
              <label className="text-label" htmlFor="website-url">Website (Optional)</label>
              <input 
                id="website-url"
                type="url" 
                className="input-field" 
                placeholder="https://acme.com" 
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '16px' }}>
              <span>Continue</span>
              <ChevronRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: Account Setup */}
        {step === 2 && (
          <form onSubmit={handleNext}>
            <h2 style={{ fontSize: '22px', marginBottom: '24px' }}>Create your admin account</h2>

            <div className="form-group">
              <label className="text-label" htmlFor="full-name">Full Name</label>
              <input 
                id="full-name"
                type="text" 
                className="input-field" 
                placeholder="John Doe" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="text-label" htmlFor="work-email">Work Email</label>
              <input 
                id="work-email"
                type="email" 
                className="input-field" 
                placeholder="john.doe@company.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="text-label" htmlFor="admin-password">Password</label>
              <input 
                id="admin-password"
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              {/* Strength bar */}
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Password Strength</span>
                    <span style={{ color: strength.color, fontWeight: 600 }}>{strength.text}</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${strength.pct}%`, backgroundColor: strength.color, borderRadius: '2px', transition: 'width 0.2s' }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="text-label" htmlFor="confirm-password">Confirm Password</label>
              <input 
                id="confirm-password"
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && password !== confirmPassword && (
                <div style={{ color: 'var(--color-brand)', fontSize: '11px', marginTop: '4px' }}>
                  Passwords do not match.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleBack}>
                Back
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 2 }}
                disabled={confirmPassword && password !== confirmPassword}
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Preferences */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Quick preferences</h2>
            <p className="text-muted text-small" style={{ marginBottom: '32px' }}>
              You can change these anytime in Settings.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label className="text-label" style={{ marginBottom: '12px' }}>Default Ranking Preset</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Balanced', 'Technical Heavy', 'Leadership', 'Growth Focused'].map((preset) => (
                  <label 
                    key={preset}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: weightPreset === preset ? 'var(--color-nav-active)' : 'transparent',
                      borderColor: weightPreset === preset ? 'var(--color-brand)' : 'var(--color-border)',
                      fontWeight: weightPreset === preset ? 600 : 400
                    }}
                  >
                    <input 
                      type="radio" 
                      name="preset" 
                      checked={weightPreset === preset}
                      onChange={() => setWeightPreset(preset)}
                      style={{ accentColor: 'var(--color-brand)' }}
                    />
                    <div>
                      <div>{preset}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 400, marginTop: '2px' }}>
                        {preset === 'Balanced' && 'Equal weights on technical capabilities, recruiter reviews and behavior.'}
                        {preset === 'Technical Heavy' && 'Focuses primarily on direct codebase, libraries, and logic parameters.'}
                        {preset === 'Leadership' && 'Prioritizes project ownership, career duration, and soft skills.'}
                        {preset === 'Growth Focused' && 'Spotlights growth trajectories and rapid learning indicators.'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 0',
                borderTop: '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '32px'
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>Bias Mitigation Guardrails</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Strips initial PII details (photo, address, college name) automatically.</div>
              </div>
              <input 
                type="checkbox" 
                checked={biasMitigation}
                onChange={(e) => setBiasMitigation(e.target.checked)}
                style={{ 
                  width: '40px', 
                  height: '20px', 
                  accentColor: 'var(--color-brand)',
                  cursor: 'pointer' 
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleBack}>
                Back
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 2 }} onClick={handleLaunch}>
                Launch NEXUS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
