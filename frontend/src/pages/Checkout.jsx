import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, MapPin, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const Checkout = ({ setActivePage, onOrderSuccess }) => {
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // Payment State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderCreated, setOrderCreated] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // If not logged in, redirect to auth page
    if (!user) {
      setActivePage('auth');
    }
  }, [user, setActivePage]);

  // Format credit card number input
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Group in 4s
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  // Format expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (!address || !city || !postalCode || !country) {
      setError('Please fill in all shipping fields.');
      return;
    }
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      setError('Please fill in all payment details.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Post order to API
      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item._id
        })),
        shippingAddress: { address, city, postalCode, country },
        paymentMethod: 'Credit Card',
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      };

      const token = user?.token;

      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderResult.message || 'Failed to place order');
      }

      // 2. Mock payment request to /pay route
      const payResponse = await fetch(`${API_URL}/orders/${orderResult._id}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: `PAY-MOCK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          email_address: user.email
        })
      });

      const payResult = await payResponse.json();

      if (!payResponse.ok) {
        throw new Error(payResult.message || 'Payment processing failed');
      }

      // 3. Clear shopping cart locally
      clearCart();

      // 4. Confetti triggers!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#d946ef', '#10b981']
      });

      setOrderCreated(payResult);
      setIsSubmitting(false);

      if (onOrderSuccess) {
        onOrderSuccess(payResult);
      }
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  // If order is completed, show success screen
  if (orderCreated) {
    return (
      <div className="container success-page">
        <div className="success-icon-container">
          <CheckCircle size={40} />
        </div>
        <h1 className="success-title">Order Confirmed!</h1>
        <p className="success-subtitle">
          Thank you for your order, {user?.name}. Your payment of <strong>${orderCreated.totalPrice.toFixed(2)}</strong> was processed successfully. 
          Your order ID is <code>{orderCreated._id}</code>.
        </p>

        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '100%', marginBottom: '40px', textAlign: 'left' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>Delivery Address</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{orderCreated.shippingAddress.address}</p>
          <p style={{ color: 'var(--text-secondary)' }}>{orderCreated.shippingAddress.city}, {orderCreated.shippingAddress.postalCode}</p>
          <p style={{ color: 'var(--text-secondary)' }}>{orderCreated.shippingAddress.country}</p>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn btn-primary" onClick={() => setActivePage('orders')}>
            View Order History
          </button>
          <button className="btn btn-secondary" onClick={() => setActivePage('home')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // If cart is empty and order is not created, redirect/display warning
  if (cartItems.length === 0) {
    return (
      <div className="container success-page">
        <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
        <h2>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Add items to your cart before proceeding to checkout.</p>
        <button className="btn btn-primary" onClick={() => setActivePage('home')}>
          Go to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <form onSubmit={handlePlaceOrder} className="checkout-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Shipping Form */}
          <div className="checkout-section glass">
            <h2 className="checkout-title">
              <MapPin size={20} /> Shipping Details
            </h2>

            {error && (
              <div className="glass" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', borderColor: 'var(--danger)', color: '#fca5a5', fontSize: '14px', marginBottom: '20px', background: 'rgba(239, 68, 68, 0.05)' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                id="address"
                placeholder="1204 Quantum Way, Suite 4B"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="card-row-inputs">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  placeholder="Neo Tokyo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">Postal / Zip Code</label>
                <input
                  type="text"
                  id="postalCode"
                  placeholder="100-0001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                placeholder="Japan"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Form */}
          <div className="checkout-section glass">
            <h2 className="checkout-title">
              <CreditCard size={20} /> Payment Details
            </h2>

            {/* Virtual Card Preview */}
            <div className="card-container">
              <div className="virtual-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="card-chip" />
                  <span style={{ fontSize: '14px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '1px' }}>METAL</span>
                </div>
                
                <div className="card-number">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>

                <div className="card-meta">
                  <div>
                    <div className="card-label">Card Holder</div>
                    <div className="card-val">{cardName.toUpperCase() || 'HOLDER NAME'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                      <div className="card-label">Expires</div>
                      <div className="card-val">{cardExpiry || 'MM/YY'}</div>
                    </div>
                    <div>
                      <div className="card-label">CVV</div>
                      <div className="card-val">{cardCvv || '•••'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Inputs */}
            <div className="form-group">
              <label htmlFor="cardName">Cardholder Name</label>
              <input
                type="text"
                id="cardName"
                placeholder="Johnathan Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                placeholder="4000 1234 5678 9010"
                value={cardNumber}
                onChange={handleCardNumberChange}
              />
            </div>

            <div className="card-row-inputs">
              <div className="form-group">
                <label htmlFor="cardExpiry">Expiration Date</label>
                <input
                  type="text"
                  id="cardExpiry"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cardCvv">CVV Code</label>
                <input
                  type="password"
                  id="cardCvv"
                  placeholder="•••"
                  value={cardCvv}
                  onChange={handleCvvChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Summary Card */}
        <div>
          <div className="summary-card glass">
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} /> Order Summary
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '240px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
              {cartItems.map((item) => (
                <div className="summary-item" key={item._id}>
                  <img className="summary-item-img" src={item.image} alt={item.name} />
                  <div className="summary-item-info">
                    <div className="summary-item-name">{item.name}</div>
                    <div className="summary-item-price">
                      {item.qty} × ${item.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>${itemsPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Estimated Tax (8%)</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>
              <span>Total</span>
              <span style={{ color: 'var(--text-primary)' }}>${totalPrice.toFixed(2)}</span>
            </div>

            <button type="submit" className="btn btn-accent btn-block" style={{ height: '48px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Processing Payment...' : 'Pay & Place Order'}{' '}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
