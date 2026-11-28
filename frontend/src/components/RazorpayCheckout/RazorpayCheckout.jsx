import React, { useState } from 'react';
import './RazorpayCheckout.css';

const RazorpayCheckout = ({ 
  items = [],
  amount,
  orderDetails = {},
  onSuccess, 
  onFailure, 
  onClose 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  const loadRazorpayScript = () => {
    if (window.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.onload = resolve;
        existing.onerror = reject;
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setIsLoading(true);
    setProcessingMessage('Creating secure payment order...');
    try {
      await loadRazorpayScript();
      const createResponse = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId || item.id,
            quantity: item.quantity
          })),
          deliveryAddress: orderDetails.deliveryAddress || {}
        })
      });
      const created = await createResponse.json();
      if (!createResponse.ok || !created.success) {
        throw new Error(created.error || 'Could not create payment order');
      }

      setProcessingMessage('Waiting for payment...');
      const options = {
        key: created.keyId,
        amount: created.amount,
        currency: created.currency,
        name: 'KisanMitra',
        description: 'Marketplace purchase',
        image: '/logo192.png',
        order_id: created.razorpayOrderId,
        handler: async function (response) {
          setProcessingMessage('Verifying payment securely...');
          try {
            const verifyResponse = await fetch(`${API_URL}/api/payment/verify`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: created.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });
            const verified = await verifyResponse.json();
            if (!verifyResponse.ok || !verified.success) {
              throw new Error(verified.error || 'Payment verification failed');
            }
            setIsLoading(false);
            if (onSuccess) onSuccess({
              orderId: verified.orderId,
              paymentId: verified.paymentId,
              razorpayOrderId: response.razorpay_order_id
            });
          } catch (error) {
            setIsLoading(false);
            if (onFailure) onFailure(error.message);
          }
        },
        prefill: {
          name: orderDetails.customerName || '',
          email: orderDetails.customerEmail || '',
          contact: orderDetails.customerPhone || ''
        },
        notes: {
          internal_order_id: created.orderId,
          order_type: 'marketplace_purchase'
        },
        theme: { color: '#4CAF50' },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setProcessingMessage('');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsLoading(false);
        setProcessingMessage('');
        if (onFailure) onFailure(response.error?.description || 'Payment failed');
      });
      rzp.open();
    } catch (error) {
      setIsLoading(false);
      setProcessingMessage('');
      if (onFailure) onFailure(error.message);
    }
  };

  return (
    <div className="razorpay-checkout-overlay">
      <div className="razorpay-checkout-modal">
        <div className="modal-header">
          <h2>💳 Secure Payment</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-content">
          <div className="payment-summary">
            <div className="amount-display">
              <h3>Total Amount</h3>
              <div className="amount">₹{amount.toLocaleString('en-IN')}</div>
            </div>
            
            <div className="payment-features">
              <div className="feature">
                🔒 Bank-level security
              </div>
              <div className="feature">
                💳 All cards accepted
              </div>
              <div className="feature">
                📱 UPI & Wallets supported
              </div>
            </div>
          </div>
          
          <div className="payment-actions">
            <button 
              onClick={handleRazorpayPayment}
              disabled={isLoading}
              className="pay-now-btn"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  {processingMessage || 'Processing...'}
                </>
              ) : (
                <>
                  💳 Pay Now
                </>
              )}
            </button>
            
            <p className="payment-note">
              You will be redirected to Razorpay's secure payment gateway
            </p>
          </div>
          
          <div className="powered-by">
            <p>Powered by <strong>Razorpay</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayCheckout;