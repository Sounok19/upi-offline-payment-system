import React, { useState } from 'react';
import axios from 'axios';
import './PaymentFlow.css';

function PaymentFlow({ user, apiBase, onNavigate }) {
  const [step, setStep] = useState('amount');
  const [formData, setFormData] = useState({ receiverUPI: '', amount: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [packet, setPacket] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [meshSimulation, setMeshSimulation] = useState({ hopCount: 0, nodes: [] });

  const deviceKey = 'device-key-' + user.upiId;

  const handleAmountSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.receiverUPI.trim()) { setError('Enter receiver UPI'); return; }
    if (!formData.amount || parseFloat(formData.amount) <= 0) { setError('Enter valid amount'); return; }
    setStep('confirm');
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const createRes = await axios.post(`${apiBase}/payment/create-packet`, {
        senderUPI: user.upiId,
        receiverUPI: formData.receiverUPI,
        amount: parseFloat(formData.amount),
        deviceKey
      });

      if (!createRes.data.success) {
        setError(createRes.data.error);
        setLoading(false);
        return;
      }

      setPacket(createRes.data.packet);
      setStep('processing');
      simulateMeshRouting(createRes.data.packet.packetId);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment creation failed');
      setLoading(false);
    }
  };

  const simulateMeshRouting = async (packetId) => {
    const nodeIds = ['node-' + Math.random().toString(36).substr(2, 8)];

    for (const nodeId of nodeIds) {
      await new Promise(resolve => setTimeout(resolve, 800));

      try {
        await axios.post(`${apiBase}/payment/forward-packet`, { packetId, nodeId });
        setMeshSimulation(prev => ({
          ...prev,
          hopCount: prev.hopCount + 1,
          nodes: [...prev.nodes, { id: nodeId, status: 'forwarded' }]
        }));
      } catch (err) {
        console.error('Mesh forward error:', err);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    settlePayment(packetId);
  };

  const settlePayment = async (packetId) => {
    try {
      const settleRes = await axios.post(`${apiBase}/payment/settle`, { packetId, deviceKey });

      if (!settleRes.data.success) {
        setError(settleRes.data.error);
        setStep('confirm');
        setLoading(false);
        return;
      }

      setTransactionId(settleRes.data.transaction.transactionId);
      setStep('success');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Settlement failed');
      setStep('confirm');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('amount');
    setFormData({ receiverUPI: '', amount: '' });
    setError('');
    setPacket(null);
    setTransactionId(null);
    setMeshSimulation({ hopCount: 0, nodes: [] });
  };

  return (
    <div className="payment-flow">
      {step === 'amount' && (
        <div className="flow-card">
          <h2>Send Money</h2>
          <form onSubmit={handleAmountSubmit} className="flow-form">
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Receiver UPI ID</label>
              <input type="text" placeholder="recipient@upi" value={formData.receiverUPI} onChange={(e) => setFormData({...formData, receiverUPI: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} min="1" step="0.01" required />
            </div>
            <div className="flow-actions">
              <button type="submit" className="btn btn-primary btn-lg">Continue →</button>
              <button type="button" className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {step === 'confirm' && (
        <div className="flow-card">
          <h2>Confirm Payment</h2>
          <div className="payment-details">
            <div className="detail-row"><span>From:</span><span>{user.upiId}</span></div>
            <div className="detail-row"><span>To:</span><span>{formData.receiverUPI}</span></div>
            <div className="detail-row"><span>Amount:</span><span className="amount">₹ {parseFloat(formData.amount).toFixed(2)}</span></div>
          </div>
          <div className="flow-actions">
            <button onClick={handleConfirmPayment} className="btn btn-success btn-lg" disabled={loading}>{loading ? 'Processing...' : 'Send Payment →'}</button>
            <button onClick={handleReset} className="btn btn-secondary" disabled={loading}>Back</button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="flow-card">
          <h2>Payment Processing</h2>
          <div className="processing-animation">
            <div className="packet-icon">📦</div>
            <p>Routing through mesh network...</p>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="flow-card success-card">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <div className="success-details">
            <p>₹ {parseFloat(formData.amount).toFixed(2)} sent to {formData.receiverUPI}</p>
          </div>
          <div className="flow-actions">
            <button onClick={() => onNavigate('dashboard')} className="btn btn-primary btn-lg">Back to Dashboard</button>
            <button onClick={handleReset} className="btn btn-secondary">Send Another</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentFlow;
