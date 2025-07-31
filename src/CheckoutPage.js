import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MpesaPaymentForm from '../components/payments/MpesaPaymentForm';
import PaymentStatus from '../components/payments/PaymentStatus';
import usePaymentStatus from '../components/payments/usePaymentStatus';

const CheckoutPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  
  const { status: paymentStatus } = usePaymentStatus(
    orderId, 
    order?.payment_status || 'pending'
  );

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/orders/${orderId}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setOrder(response.data);
      } catch (err) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (paymentStatus === 'completed') {
      const timer = setTimeout(() => {
        navigate('/customer-dashboard', { 
          state: { message: 'Payment completed successfully!' } 
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, navigate]);

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="checkout-page">
      <h2>Complete Your Payment</h2>
      <div className="order-summary">
        <h4>Order #{order.id}</h4>
        <p>Total Amount: KES {order.total_amount.toFixed(2)}</p>
      </div>

      {paymentStatus !== 'completed' ? (
        <>
          {!paymentInitiated ? (
            <MpesaPaymentForm
              orderId={orderId}
              amount={order.total_amount}
              onPaymentSuccess={() => setPaymentInitiated(true)}
            />
          ) : (
            <PaymentStatus status={paymentStatus} />
          )}
        </>
      ) : (
        <PaymentStatus status={paymentStatus} />
      )}
    </div>
  );
};

export default CheckoutPage;