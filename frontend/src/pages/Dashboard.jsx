import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ user, apiBase, onNavigate, setUser }) {
  const [balance, setBalance] = useState(user.balance);
  const [transactions, setTransactions] = useState([]);
  const [meshStats, setMeshStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [balRes, txnRes, statsRes] = await Promise.all([
        axios.get(`${apiBase}/user/${user.upiId}/balance`),
        axios.get(`${apiBase}/transactions/${user.upiId}`),
        axios.get(`${apiBase}/mesh/stats`)
      ]);

      if (balRes.data.success) setBalance(balRes.data.balance);
      if (txnRes.data.success) setTransactions(txnRes.data.transactions);
      if (statsRes.data.success) setMeshStats(statsRes.data.stats);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard">
      <div className="balance-section">
        <div className="card balance-card">
          <div className="balance-header">
            <span className="label">Available Balance</span>
            <span className="refresh-indicator">●</span>
          </div>
          <div className="balance-amount">
            ₹ <span>{balance.toFixed(2)}</span>
          </div>
          <div className="balance-footer">
            <span>UPI ID: {user.upiId}</span>
            <span>Account: Active</span>
          </div>
        </div>

        <button className="btn btn-primary btn-send" onClick={() => onNavigate('payment')}>
          <span>➤</span> Send Money
        </button>
      </div>

      {meshStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📡</div>
            <div className="stat-content">
              <div className="stat-value">{meshStats.totalNodes}</div>
              <div className="stat-label">Mesh Nodes</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <div className="stat-value">{meshStats.totalPackets}</div>
              <div className="stat-label">Total Packets</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <div className="stat-value">{meshStats.settledPackets}</div>
              <div className="stat-label">Settled</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <div className="stat-value">{meshStats.successRate}</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      <div className="card transactions-card">
        <div className="card-header">
          <h2 className="card-title">Transaction History</h2>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>
            ↻ Refresh
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.map((txn) => (
              <div key={txn._id} className="transaction-item">
                <div className="txn-content">
                  <div className="txn-info">
                    <div className="txn-header">
                      <span className="txn-type">
                        {txn.senderUPI === user.upiId ? '→ Sent' : '← Received'}
                      </span>
                      <span className="txn-upi">
                        {txn.senderUPI === user.upiId ? txn.receiverUPI : txn.senderUPI}
                      </span>
                    </div>
                    <div className="txn-date">{formatDate(txn.settledAt)}</div>
                  </div>
                  <div className="txn-amount">
                    <div className={txn.senderUPI === user.upiId ? 'amount-out' : 'amount-in'}>
                      {txn.senderUPI === user.upiId ? '-' : '+'} ₹{txn.amount}
                    </div>
                    <span className={`badge badge-${txn.status}`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
