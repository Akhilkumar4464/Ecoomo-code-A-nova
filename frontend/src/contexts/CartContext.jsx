import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Save cart on update
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cartItems', JSON.stringify(items));
  };

  const addToCart = (product, qty = 1) => {
    const existItem = cartItems.find((x) => x._id === product._id);

    let updatedItems;
    if (existItem) {
      updatedItems = cartItems.map((x) =>
        x._id === product._id ? { ...x, qty: Math.min(x.countInStock, existItem.qty + qty) } : x
      );
    } else {
      updatedItems = [...cartItems, { ...product, qty }];
    }

    saveCart(updatedItems);
  };

  const removeFromCart = (id) => {
    const updatedItems = cartItems.filter((x) => x._id !== id);
    saveCart(updatedItems);
  };

  const updateQty = (id, qty) => {
    const updatedItems = cartItems.map((x) =>
      x._id === id ? { ...x, qty: Math.max(1, qty) } : x
    );
    saveCart(updatedItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Calculations
  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  
  const itemsPrice = Number(
    cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
  );
  
  const shippingPrice = Number((itemsPrice > 150 || itemsPrice === 0 ? 0 : 15).toFixed(2));
  
  const taxPrice = Number((0.08 * itemsPrice).toFixed(2));
  
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        itemsCount,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
