import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Star, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onSelect }) => {
  const { addToCart } = useCart();

  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<Star key={i} size={14} fill="#fbbf24" stroke="none" />);
      } else if (i - rating < 1) {
        // Simple representation of half star
        stars.push(<Star key={i} size={14} fill="#fbbf24" stroke="none" style={{ opacity: 0.5 }} />);
      } else {
        stars.push(<Star key={i} size={14} fill="rgba(255,255,255,0.15)" stroke="none" />);
      }
    }
    return stars;
  };

  return (
    <div className="product-card glass-interactive">
      <div className="product-image-container" onClick={() => onSelect(product)} style={{ cursor: 'pointer' }}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.countInStock === 0 && (
          <span className="product-badge" style={{ backgroundColor: 'var(--danger)' }}>
            Out of Stock
          </span>
        )}
      </div>
      
      <div className="product-content">
        <span className="product-category">{product.category}</span>
        <h3 className="product-title" onClick={() => onSelect(product)} style={{ cursor: 'pointer' }}>
          {product.name}
        </h3>
        
        <div className="rating-container">
          <div className="rating-stars">{renderStars(product.rating)}</div>
          <span>({product.numReviews})</span>
        </div>

        <div className="product-footer">
          <div className="product-price">
            <span>$</span>{product.price.toFixed(2)}
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            disabled={product.countInStock === 0}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
