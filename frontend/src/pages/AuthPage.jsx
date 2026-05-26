// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './AuthPage.css';

function AuthPage({ onLogin, apiBase }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginForm, setLoginForm] = useState({ 
    upiId: '', 
    password: '' 
  });
  
  const [registerForm, setRegisterForm] = useState({
    upiId: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${apiBase}/auth/login`, loginForm);
      if (data.success) {
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${apiBase}/auth/register`, {
        upiId: registerForm.upiId,
        name: registerForm.name,
        phone: registerForm.phone,
        password: registerForm.password
      });

      if (data.success) {
        setError('');
        setIsLogin(true);
        setLoginForm({ 
          upiId: registerForm.upiId, 
          password: registerForm.password 
        });
        alert('Registration successful! You can now login.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">₹</div>
          <h1>OfflineUPI</h1>
          <p>Decentralized Offline Payments</p>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="auth-form">
            <h2>Login</h2>
            
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>UPI ID</label>
              <input
                type="text"
                placeholder="username@upi"
                value={loginForm.upiId}
                onChange={(e) => setLoginForm({ ...loginForm, upiId: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="auth-switch">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                Register here
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <h2>Create Account</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>UPI ID</label>
              <input
                type="text"
                placeholder="username@upi"
                value={registerForm.upiId}
                onChange={(e) => setRegisterForm({ ...registerForm, upiId: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>

            <p className="auth-switch">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                Login here
              </button>
            </p>
          </form>
        )}

        <div className="auth-footer">
          <p>Demo Accounts:</p>
          <p>john@upi / password123</p>
          <p>jane@upi / password123</p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

/*
AUTH PAGE FEATURES:

LOGIN:
- Requires UPI ID and password
- Calls POST /api/auth/login
- Returns user data { upiId, name, balance }
- Displays errors if invalid credentials

REGISTRATION:
- Requires UPI ID, Name, Phone, Password
- Validates password match
- Calls POST /api/auth/register
- Creates account with ₹10,000 initial balance
- Allows user to login after registration

ERROR HANDLING:
- Shows error messages from backend
- Prevents submission if form invalid
- Shows loading state while submitting

DEMO ACCOUNTS:
- Pre-created accounts for testing
- john@upi and jane@upi
- Both have password123
- Useful for development and demos
*/
