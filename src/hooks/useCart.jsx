import React, { useState,useEffect, useContext, useRef } from 'react'
import { api } from '@/utils/api'
import toast from 'react-hot-toast';
import { SocketContext } from '../context/SocketContext';


const useCart = () => {

    const [cart, setCart] = useState(new Map());
    const socket = useContext(SocketContext);
    const saveTimeoutRef = useRef(null);

 const saveCartInDatabase = async(cartMap) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout to debounce API calls
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Send only productId and quantity to reduce payload size
        const cart = {};
        cartMap.forEach((item, productId) => {
          cart[productId] = {
            productId: item._id || productId,
            quantity: item.quantity || 1
          };
        });
        
        const response = await api.post('api/products/saveCart', { cart });
        if (response.success) {
          // Don't show toast on every save to avoid spam
          // toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        // console.log(error);
      }
    }, 500); // 500ms debounce delay
  };
  const addToCart = (product) => {
    // console.log(product);
    // console.log(cart);
    
    
    setCart(prevCart => {
      const newCart = new Map(prevCart);
      if (newCart.has(product._id)) {
        newCart.set(product._id, {
          ...product,
          quantity: newCart.get(product._id).quantity + 1
        });
      } else {
        newCart.set(product._id, { ...product, quantity: 1 });
      }
      saveCartInDatabase(newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const newCart = new Map(prevCart);
      if (newCart.has(productId)) {
        const updatedQuantity = newCart.get(productId).quantity - 1;
        if (updatedQuantity >= 0) {
          newCart.set(productId, { ...newCart.get(productId), quantity: updatedQuantity });
        } 
        saveCartInDatabase(newCart);
        if(updatedQuantity === 0){
          newCart.delete(productId);
        }
      }
      return newCart;
    });
  };

  const removeItemCompletely = (productId) => {
    setCart(prevCart => {
      const newCart = new Map(prevCart);
      if (newCart.has(productId)) {
        newCart.delete(productId);
        saveCartInDatabase(newCart);
      }
      return newCart;
    });
  };
  useEffect(() => {
    const fetchProducts = async () => {
      const cartResponse = await api.get('api/products/fetchCart');
      if(cartResponse.success){
         // Handle new response format with items populated from backend
         if(cartResponse.items && Object.keys(cartResponse.items).length > 0){
          const hashMap = new Map(Object.entries(cartResponse.items));
          setCart(hashMap);
         } else if(cartResponse.cartData?.items){
          // Fallback for old format (shouldn't happen but for safety)
          const hashMap = new Map(Object.entries(cartResponse.cartData.items));
          setCart(hashMap);
         }
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!socket) return
  
    const handleOrderPlaced = (data) => {
      if (data.success) {
        setCart(new Map())
      }
    }
  
    socket.on('orderPlaced', handleOrderPlaced)
  
    return () => {
      socket.off('orderPlaced', handleOrderPlaced)
    }
  }, [socket])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  

  return {cart,addToCart,removeFromCart,removeItemCompletely};
 
}

export default useCart
