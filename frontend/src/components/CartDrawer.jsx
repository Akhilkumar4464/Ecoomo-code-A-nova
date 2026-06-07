import React, { useRef, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, setActivePage }) => {
  const {
    cartItems,
    removeFromCart,
    updateQty,
    itemsPrice,
    itemsCount
  } = useCart();

  const drawerRef = useRef();

  // Close drawer if clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target) && !e.target.closest('.cart-badge-container')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  const handleCheckoutClick = () => {
    onClose();
    setActivePage('checkout');
  };

  return (
    <>
      {isOpen && <div className="cart-overlay" />}
      <div ref={drawerRef} className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} /> Your Cart ({itemsCount})
          </h2>
          <button className="cart-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Your cart is empty</p>
              <button className="btn btn-secondary" onClick={onClose}>
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item._id}>
                <img className="cart-item-img" src={item.image} alt={item.name} />
                <div className="cart-item-details">
                  <h4 className="cart-item-title">{item.name}</h4>
                  <div className="cart-item-price">${item.price.toFixed(2)}</div>
                  
                  <div className="cart-item-actions">
                    <div className="cart-item-qty">
                      <button
                        className="cart-item-qty-btn"
                        onClick={() => updateQty(item._id, item.qty - 1)}
                        disabled={item.qty <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="cart-item-qty-val">{item.qty}</span>
                      <button
                        className="cart-item-qty-btn"
                        onClick={() => updateQty(item._id, item.qty + 1)}
                        disabled={item.qty >= item.countInStock}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      className="cart-item-delete"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-line">
              <span>Subtotal</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="cart-summary-line" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Shipping and taxes calculated at checkout.
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary btn-block" onClick={handleCheckoutClick}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
