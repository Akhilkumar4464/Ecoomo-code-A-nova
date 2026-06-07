import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardList, Calendar, DollarSign, HelpCircle, Eye, X } from 'lucide-react';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selected order details modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${API_URL}/orders/myorders`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        
        // Sort orders descending by date
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container" style={{ paddingBottom: '80px', paddingTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <ClipboardList size={28} style={{ color: 'var(--primary)' }} />
        <h1>Your Order History</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <h3>Loading orders...</h3>
        </div>
      ) : error ? (
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)', borderColor: 'var(--danger)', color: '#fca5a5', textAlign: 'center' }}>
          <h3>Could not fetch orders</h3>
          <p>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass" style={{ padding: '60px 24px', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
          <HelpCircle size={48} style={{ marginBottom: '16px', strokeWidth: 1.5 }} />
          <h3>No Orders Placed Yet</h3>
          <p style={{ marginTop: '8px' }}>Any purchases you make will appear here for you to track.</p>
        </div>
      ) : (
        <div className="orders-table-container glass">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date Placed</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Delivered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                    {order._id.substring(0, 10)}...
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td style={{ fontWeight: '700' }}>
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td>
                    {order.isPaid ? (
                      <span className="badge-status success">Paid</span>
                    ) : (
                      <span className="badge-status pending">Pending</span>
                    )}
                  </td>
                  <td>
                    {order.isDelivered ? (
                      <span className="badge-status success">Delivered</span>
                    ) : (
                      <span className="badge-status pending">In Transit</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="nav-btn"
                      style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye size={16} style={{ marginRight: '4px' }} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal Overlay */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '20px' }}>Order Details</h2>
              <button className="cart-close-btn" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <div><strong>ID:</strong> <code style={{ fontFamily: 'monospace' }}>{selectedOrder._id}</code></div>
              <div><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</div>
              <div>
                <strong>Payment:</strong>{' '}
                {selectedOrder.isPaid ? (
                  <span style={{ color: 'var(--accent)' }}>Paid on {formatDate(selectedOrder.paidAt)}</span>
                ) : (
                  <span style={{ color: 'var(--warning)' }}>Pending</span>
                )}
              </div>
              <div>
                <strong>Delivery Status:</strong>{' '}
                {selectedOrder.isDelivered ? (
                  <span style={{ color: 'var(--accent)' }}>Delivered on {formatDate(selectedOrder.deliveredAt)}</span>
                ) : (
                  <span style={{ color: 'var(--warning)' }}>In Transit</span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Shipping Address</h3>
              <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <div>{selectedOrder.shippingAddress.address}</div>
                <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</div>
                <div>{selectedOrder.shippingAddress.country}</div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Items Ordered</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedOrder.orderItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '10px' }}>
                    <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ flex: '1' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {item.qty} × ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
                <span>Total Amount</span>
                <span>${selectedOrder.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
