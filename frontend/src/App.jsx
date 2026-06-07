import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Admin from './pages/Admin';

function AppContent() {
  const [activePage, setActivePage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setActivePage('product-detail');
  };

  const handleAuthSuccess = () => {
    // Default redirect to home after signing in/up
    setActivePage('home');
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <Home onSelectProduct={handleProductSelect} />;
      case 'product-detail':
        return (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setActivePage('home')}
          />
        );
      case 'auth':
        return <Auth onAuthSuccess={handleAuthSuccess} />;
      case 'checkout':
        return <Checkout setActivePage={setActivePage} />;
      case 'orders':
        return <Orders />;
      case 'admin':
        return <Admin setActivePage={setActivePage} />;
      default:
        return <Home onSelectProduct={handleProductSelect} />;
    }
  };

  return (
    <div className="app-container">
      {/* Background radial glow visual accents */}
      <div className="bg-glow-1" />
      <div className="bg-glow-2" />

      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        toggleCart={() => setCartOpen(!cartOpen)}
      />

      <main style={{ flex: 1, padding: '24px 0' }}>
        {renderActivePage()}
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-logo">Ecoomo E-Commerce</div>
          <p>© 2026 Ecoomo Systems. Powered by React, Node, and premium custom CSS layout.</p>
        </div>
      </footer>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        setActivePage={setActivePage}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
