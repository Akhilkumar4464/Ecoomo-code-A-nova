import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sliders, ShoppingBag, ClipboardList, Plus, Trash2, CheckCircle2, X } from 'lucide-react';

const Admin = ({ setActivePage }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add product form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (!user || !user.isAdmin) {
      setActivePage('home');
    }
  }, [user, setActivePage]);

  // Fetch Products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      }
      setLoadingProducts(false);
    } catch (err) {
      console.error(err);
      setLoadingProducts(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await response.json();
      if (response.ok) {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(data);
      }
      setLoadingOrders(false);
    } catch (err) {
      console.error(err);
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [user]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name || !price || !image || !brand || !description || countInStock === '') {
      setError('Please fill out all fields.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          image,
          brand,
          category,
          countInStock: Number(countInStock),
          description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      setSuccessMsg('Product added successfully!');
      setShowAddModal(false);
      
      // Clear inputs
      setName('');
      setPrice('');
      setImage('');
      setBrand('');
      setCategory('Electronics');
      setCountInStock('');
      setDescription('');

      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }

      setSuccessMsg('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkDelivered = async (id) => {
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`${API_URL}/orders/${id}/deliver`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to deliver order');
      }

      setSuccessMsg('Order marked as Delivered!');
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!user || !user.isAdmin) return null;

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 160px)', paddingTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Sliders size={28} style={{ color: 'var(--primary)' }} />
        <h1>Admin Control Dashboard</h1>
      </div>

      {(error || successMsg) && (
        <div style={{ marginBottom: '20px' }}>
          {error && (
            <div className="glass" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', borderColor: 'var(--danger)', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.05)' }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div className="glass" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', borderColor: 'var(--accent)', color: '#a7f3d0', background: 'rgba(16, 185, 129, 0.05)' }}>
              {successMsg}
            </div>
          )}
        </div>
      )}

      <div className="admin-grid">
        <aside className="admin-sidebar glass">
          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag size={18} /> Products ({products.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ClipboardList size={18} /> Orders ({orders.length})
          </button>
        </aside>

        <main style={{ minWidth: 0 }}>
          {activeTab === 'products' ? (
            <div>
              <div className="admin-header">
                <h2>Manage Catalog</h2>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {loadingProducts ? (
                <p>Loading catalog...</p>
              ) : (
                <div className="orders-table-container glass">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod) => (
                        <tr key={prod._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img src={prod.image} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                              <div style={{ fontWeight: '600', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {prod.name}
                              </div>
                            </div>
                          </td>
                          <td>{prod.category}</td>
                          <td style={{ fontWeight: '700' }}>${prod.price.toFixed(2)}</td>
                          <td>{prod.countInStock} units</td>
                          <td>
                            <button
                              className="nav-btn"
                              style={{ padding: '6px', borderRadius: 'var(--radius-sm)', color: 'var(--danger)' }}
                              onClick={() => handleDeleteProduct(prod._id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="admin-header">
                <h2>Manage Orders</h2>
              </div>

              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : (
                <div className="orders-table-container glass">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord._id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                            {ord._id.substring(0, 10)}...
                          </td>
                          <td>{formatDate(ord.createdAt)}</td>
                          <td style={{ fontWeight: '700' }}>${ord.totalPrice.toFixed(2)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {ord.isPaid ? (
                                <span className="badge-status success">Paid</span>
                              ) : (
                                <span className="badge-status pending">Unpaid</span>
                              )}
                              {ord.isDelivered ? (
                                <span className="badge-status success">Delivered</span>
                              ) : (
                                <span className="badge-status pending">In Transit</span>
                              )}
                            </div>
                          </td>
                          <td>
                            {!ord.isDelivered && ord.isPaid && (
                              <button
                                className="nav-btn"
                                style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => handleMarkDelivered(ord._id)}
                              >
                                <CheckCircle2 size={14} /> Deliver
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <form onSubmit={handleAddProduct} className="modal-content glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '20px' }}>Add New Product</h2>
              <button type="button" className="cart-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                placeholder="Aether Smart Speaker"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="card-row-inputs">
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="99.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  placeholder="10"
                  value={countInStock}
                  onChange={(e) => setCountInStock(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div className="card-row-inputs">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  placeholder="Aether"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select className="filter-select" style={{ width: '100%', height: '45px' }} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Home Decors">Home Decors</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                style={{ width: '100%', minHeight: '100px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '12px', color: 'var(--text-primary)', outline: 'none' }}
                placeholder="Write detailed specifications here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ height: '48px', marginTop: '10px' }}>
              Add Product to Catalog
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;
