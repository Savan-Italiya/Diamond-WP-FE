import React, { useState } from 'react';
import { Gem, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { DiamondApi } from '../services/api';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@bkc-diamonds.com');
  const [password, setPassword] = useState('Admin@Mumbai2026');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await DiamondApi.login(email, password);
      onLogin();
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c2340 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background blobs */}
      <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(2,132,199,0.12)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', filter: 'blur(50px)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '30%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(14,165,233,0.06)', filter: 'blur(40px)' }} />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Header strip */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            padding: '32px 40px 28px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            <Gem size={30} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            BKC Diamond ERP
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
            Bharat Diamond Bourse • Opera House
          </p>
        </div>

        {/* Form body */}
        <div style={{ padding: '36px 40px 40px' }}>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 0 28px 0' }}>
            Sign in to your trading desk
          </p>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(225,29,72,0.12)',
                border: '1px solid rgba(225,29,72,0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '20px',
                color: '#fca5a5',
                fontSize: '0.825rem',
                fontWeight: 600
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email */}
            <div>
              <label
                style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                Email / User ID
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }}>
                  <Mail size={17} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 14px 13px 42px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }}>
                  <Lock size={17} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 44px 13px 42px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(56,189,248,0.5)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.4)',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? 'rgba(2,132,199,0.5)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(2,132,199,0.35)',
                transition: 'all 0.2s'
              }}
            >
              <LogIn size={18} />
              {loading ? 'Authenticating...' : 'Sign In to Trading Desk'}
            </button>
          </form>

          {/* Demo hint */}
          <div
            style={{
              marginTop: '24px',
              padding: '12px 14px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '10px',
              fontSize: '0.775rem',
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.6
            }}
          >
            <strong style={{ color: 'rgba(251,191,36,0.8)' }}>Demo Access:</strong> Credentials pre-filled above. Click Sign In.
          </div>
        </div>
      </div>
    </div>
  );
};
