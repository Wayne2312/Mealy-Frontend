import React, { useState } from 'react';
import axios from 'axios';
import './Payment.css';

const MpesaPaymentForm = ({ orderId, amount, onPaymentSuccess }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    }
    if (cleaned.startsWith('7') && cleaned.length === 9) {
      return '254' + cleaned;
    }
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(phone);
      const response = await axios.post(
        '/api/mpesa-payment/',
        {
          order_id: orderId,
          phone: formattedPhone,
          amount: amount
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setPaymentInitiated(true);
      } else {
        setError(response.data.error || 'Payment initiation failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mpesa-payment-container">
      <h3>M-Pesa Payment</h3>
      <p className="payment-amount">Amount: KES {amount.toFixed(2)}</p>

      {paymentInitiated ? (
        <div className="payment-instructions">
          <div className="loader"></div>
          <p>Check your phone for an M-Pesa prompt</p>
          <p>Enter your M-Pesa PIN to complete payment</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0712345678"
              required
            />
            <small>Must be registered with M-Pesa</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Pay with M-Pesa'}
          </button>
        </form>
      )}
    </div>
  );
};

export default MpesaPaymentForm;