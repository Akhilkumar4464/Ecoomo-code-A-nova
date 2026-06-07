import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

const Home = ({ onSelectProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter Categories
  const categories = ['All', 'Electronics', 'Accessories', 'Home Decors'];

  // Handle filtering and sorting locally for speed and consistency
  const processedProducts = products
    .filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.numReviews - a.numReviews; // 'popular'
    });

  return (
    <div className="container">
      {/* Hero section */}
      <section className="hero">
        <h1 className="hero-title">
          Elevate Your Space with <span>Premium Innovation</span>
        </h1>
        <p className="hero-subtitle">
          Discover hand-crafted gear, accessories, and decors designed to enhance your daily life and workspace aesthetics.
        </p>
      </section>

      {/* Catalog & Toolbar */}
      <section className="catalog-section">
        <div className="toolbar glass">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search gear, electronics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}

            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
            <div className="logo" style={{ fontSize: '30px', animation: 'pop 1.5s infinite', justifyContent: 'center' }}>
              <span>Loading Products...</span>
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--danger)' }}>
            <h3>Error occurred: {error}</h3>
            <p>Make sure the backend server is running.</p>
          </div>
        ) : processedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <h3>No products found</h3>
            <p>Try refining your search terms or filters.</p>
          </div>
        ) : (
          <div className="products-grid">
            {processedProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
