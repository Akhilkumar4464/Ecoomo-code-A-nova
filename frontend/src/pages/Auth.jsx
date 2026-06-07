import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, error, loading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password || (!isLogin && !name)) {
      setLocalError('Please fill out all fields.');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (err) {
      // Handled by context, but we catch to prevent unhandled promise
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setLocalError(null);
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>
            {isLogin
              ? 'Enter your credentials to access your portal'
              : 'Sign up to start your premium shopping experience'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {(!isLogin || error || localError) && (
            <div style={{ marginBottom: '20px' }}>
              {(error || localError) && (
                <div
                  className="glass"
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    borderColor: 'var(--danger)',
                    color: '#fca5a5',
                    fontSize: '14px',
                    background: 'rgba(239, 68, 68, 0.05)'
                  }}
                >
                  {localError || error}
                </div>
              )}
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  id="name"
                  placeholder="Aiden Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="email"
                id="email"
                placeholder="aiden@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ height: '48px', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Sign Up'}{' '}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button className="auth-toggle-btn" onClick={handleToggle}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        {/* Demo details alert */}
        <div className="glass" style={{ marginTop: '30px', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
          <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>Demo Accounts:</div>
          <div><strong>Customer:</strong> john@example.com / user123</div>
          <div style={{ marginTop: '4px' }}><strong>Administrator:</strong> admin@example.com / admin123</div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
