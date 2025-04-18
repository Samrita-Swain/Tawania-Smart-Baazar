import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage or empty array
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, { ...product, quantity }];
      }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  
  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };
  
  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Get cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Get cart count
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
