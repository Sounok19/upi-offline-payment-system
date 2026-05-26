// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PaymentFlow from './pages/PaymentFlow';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('auth');
  const API_BASE = import.meta.env.VITE_API_URL;

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('auth');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="app">
      <div className="app-bg"></div>
      
      {!currentUser ? (
        <AuthPage onLogin={handleLogin} apiBase={API_BASE} />
      ) : (
        <div className="app-container">
          {/* Top Navigation Bar */}
          <nav className="top-nav">
            <div className="nav-brand">
              <div className="brand-icon">₹</div>
              <span>OfflineUPI</span>
            </div>
            <div className="nav-user">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-upi">{currentUser.upiId}</span>
              <button 
                className="btn-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </nav>

          {/* Page Content */}
          <div className="page-container">
            {currentPage === 'dashboard' && (
              <Dashboard 
                user={currentUser} 
                apiBase={API_BASE}
                onNavigate={handleNavigate}
                setUser={setCurrentUser}
              />
            )}
            {currentPage === 'payment' && (
              <PaymentFlow 
                user={currentUser} 
                apiBase={API_BASE}
                onNavigate={handleNavigate}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

/*
APP STRUCTURE:

STATES:
- currentUser: Logged-in user data { upiId, name, balance }
- currentPage: Current page (auth, dashboard, payment)

PAGES:
1. AuthPage: Login/Register (shown when not logged in)
2. Dashboard: Balance, transactions, stats (shown after login)
3. PaymentFlow: Send money wizard (shown when user clicks Send)

NAVIGATION:
- Login → currentUser set, page = dashboard
- Logout → currentUser cleared, page = auth
- Send Money → page = payment
- Back → page = dashboard

API_BASE:
- Comes from environment variable
- Default: http://localhost:5000/api
- Passed to all child components for API calls
*/
