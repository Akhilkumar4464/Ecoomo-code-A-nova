import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogOut, Sliders, ShoppingBag } from 'lucide-react';

const Navbar = ({ activePage, setActivePage, toggleCart }) => {
  const { user, logout } = useAuth();
  const { itemsCount } = useCart();

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <button className="logo nav-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setActivePage('home')}>
          <ShoppingBag size={24} style={{ stroke: 'url(#logo-grad)' }} />
          <span>Ecoomo</span>
        </button>

        {/* Logo gradient helper for Lucide SVG */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </svg>

        <div className="nav-links">
          <button
            className={`nav-btn ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            Browse
          </button>

          {user && (
            <button
              className={`nav-btn ${activePage === 'orders' ? 'active' : ''}`}
              onClick={() => setActivePage('orders')}
            >
              My Orders
            </button>
          )}

          {user?.isAdmin && (
            <button
              className={`nav-btn ${activePage === 'admin' ? 'active' : ''}`}
              onClick={() => setActivePage('admin')}
              style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Sliders size={16} /> Admin Panel
            </button>
          )}

          <button className="nav-btn cart-badge-container" onClick={toggleCart}>
            <ShoppingCart size={20} />
            {itemsCount > 0 && <span className="cart-badge">{itemsCount}</span>}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} /> {user.name}
              </span>
              <button className="nav-btn" onClick={logout} title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setActivePage('auth')}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
