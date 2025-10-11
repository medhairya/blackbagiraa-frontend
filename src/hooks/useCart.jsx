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
        const cart = Object.fromEntries(cartMap);
        const response = await api.post('api/products/saveCart', { cart });
        if (response.success) {
          toast.success(response.message);
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
  useEffect(() => {
    const fetchProducts = async () => {
      const cartResponse = await api.get('api/products/fetchCart');
      if(cartResponse.success){
         if(cartResponse.cartData){
          const hashMap = new Map(Object.entries(cartResponse.cartData?.items));
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
  

  return {cart,addToCart,removeFromCart};
 
}

export default useCart
