import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Server, UserPlus, LogIn } from 'lucide-react';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = isSignUp 
      ? await signup(email, password)
      : await login(email, password);
    
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Authentication failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  // Modern Glassmorphism Styling
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Decorative Orbs for Login background */}
      <div className="bg-blob bg-blob-1" style={{ width: '40vw', height: '40vw' }}></div>
      <div className="bg-blob bg-blob-2" style={{ width: '35vw', height: '35vw', bottom: '10%', right: '10%' }}></div>

      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: 'var(--spacing-xl)', borderRadius: '16px', zIndex: 10, backdropFilter: 'blur(16px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', marginBottom: 'var(--spacing-md)' }}>
            <Server size={32} color="var(--brand-primary)" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            {isSignUp ? 'Create Account' : 'System Login'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)', fontSize: '0.9rem' }}>
            {isSignUp ? 'Register to access IoT Admin Dashboard' : 'To access the IoT Admin Dashboard'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: 'var(--spacing-sm)', borderRadius: '8px', marginBottom: 'var(--spacing-md)', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder={isSignUp ? "new@example.com" : "admin@example.com"}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder="••••••••"
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: 'var(--spacing-md)',
              padding: '14px',
              background: 'var(--brand-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'background 0.2s ease, transform 0.1s ease',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => !isSubmitting && (e.target.style.background = 'var(--brand-secondary)')}
            onMouseOut={(e) => !isSubmitting && (e.target.style.background = 'var(--brand-primary)')}
            onMouseDown={(e) => !isSubmitting && (e.target.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => !isSubmitting && (e.target.style.transform = 'scale(1)')}
          >
            {isSignUp ? <UserPlus size={18}/> : <LogIn size={18}/>}
            {isSubmitting ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
          <button 
            type="button" 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
