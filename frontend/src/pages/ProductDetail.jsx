import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { ChevronLeft, ShoppingCart, Star, Award, Shield, Truck } from 'lucide-react';

const ProductDetail = ({ product, onBack }) => {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const handleQtyChange = (val) => {
    setQty(Math.max(1, Math.min(product.countInStock, val)));
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<Star key={i} size={16} fill="#fbbf24" stroke="none" />);
      } else if (i - rating < 1) {
        stars.push(<Star key={i} size={16} fill="#fbbf24" stroke="none" style={{ opacity: 0.5 }} />);
      } else {
        stars.push(<Star key={i} size={16} fill="rgba(255,255,255,0.15)" stroke="none" />);
      }
    }
    return stars;
  };

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <button className="nav-btn" onClick={onBack} style={{ marginBottom: '20px' }}>
        <ChevronLeft size={16} /> Back to Browse
      </button>

      <div className="detail-grid">
        <div className="detail-gallery">
          <img className="detail-img-main" src={product.image} alt={product.name} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <Award size={20} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
              <div style={{ fontSize: '12px', fontWeight: '700' }}>Genuine Gear</div>
            </div>
            <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <Shield size={20} style={{ color: 'var(--secondary)', marginBottom: '8px' }} />
              <div style={{ fontSize: '12px', fontWeight: '700' }}>1-Yr Warranty</div>
            </div>
            <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <Truck size={20} style={{ color: 'var(--accent)', marginBottom: '8px' }} />
              <div style={{ fontSize: '12px', fontWeight: '700' }}>Free Delivery</div>
            </div>
          </div>
        </div>

        <div className="detail-info">
          <span className="detail-brand">{product.brand}</span>
          <h1 className="detail-title">{product.name}</h1>
          
          <div className="rating-container" style={{ marginBottom: '24px' }}>
            <div className="rating-stars">{renderStars(product.rating)}</div>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{product.rating} / 5.0 ({product.numReviews} user reviews)</span>
          </div>

          <div className="detail-price">
            <span style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-secondary)' }}>$</span>
            {product.price.toFixed(2)}
          </div>

          <h3 className="detail-desc-title">Description</h3>
          <p className="detail-desc">{product.description}</p>

          <div className="stock-status">
            <div className={`stock-dot ${product.countInStock > 0 ? 'in' : 'out'}`} />
            <span>
              {product.countInStock > 0
                ? `In Stock (${product.countInStock} items available)`
                : 'Out of Stock'}
            </span>
          </div>

          {product.countInStock > 0 && (
            <div className="detail-actions">
              <div className="qty-selector">
                <button className="qty-btn" onClick={() => handleQtyChange(qty - 1)} disabled={qty <= 1}>
                  -
                </button>
                <span className="qty-val">{qty}</span>
                <button className="qty-btn" onClick={() => handleQtyChange(qty + 1)} disabled={qty >= product.countInStock}>
                  +
                </button>
              </div>

              <button className="btn btn-primary btn-block" style={{ height: '48px' }} onClick={handleAddToCart}>
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
