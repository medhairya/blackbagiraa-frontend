import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Trash2 } from 'lucide-react'
import useCart from '@/hooks/useCart'
import { useNavigate } from 'react-router-dom'
import CheckoutDrawer from '@/components/CheckoutDrawer'


const Cart = () => {
  
  const [totalAmount, setTotalAmount] = useState(0)
  const [open, setOpen] = useState(false)
  const { cart, addToCart, removeFromCart, removeItemCompletely } = useCart();
  const navigate = useNavigate();

  const calculateTotal = () => {
    let total = 0;
    cart.forEach((item) => {
      total += (item.retailPrice * item.boxQuantity) * item.quantity;
    });
    setTotalAmount(total);
  }

  useEffect(() => {
    calculateTotal();
  }, [cart]);

  useEffect(() =>{ {
   
      // setTotalAmount(16 * item.boxQuantity)
    }
  }, [cart.size])

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      
      {cart.size === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some items to your cart to see them here.</p>
          <Button onClick={() => navigate('/home')}>Continue Shopping</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {Array.from(cart.values()).map((item,index) => (
            <Card key={index} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/4 h-48">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <p className="text-muted-foreground">{item.category}</p>
                      {/* {item.scheme && (
                        <Badge variant="secondary" className="mt-2 bg-primary text-primary-foreground">
                          {item.scheme}
                        </Badge>
                      )} */}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItemCompletely(item._id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-end">
                    <div>
                      <p className="text-lg">
                        <span className="font-semibold">MRP:</span> ₹{item.MRP} (₹{item.MRP } X {item.boxQuantity} pieces = {item.MRP * item.boxQuantity}₹ )
                      </p>
                      <p className="text-lg text-primary font-bold">
                        <span>Price:</span> ₹{item.retailPrice} (₹{item.retailPrice } X {item.boxQuantity} pieces = {item.retailPrice * item.boxQuantity}₹)  </p>
                      <p className="text-lg mt-2">
                        <span className="font-semibold">Subtotal:</span> ₹{(item.retailPrice * item.boxQuantity) * item.quantity} ({item.quantity} boxes)
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" onClick={() => removeFromCart(item._id)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-lg font-semibold">{item.quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => addToCart(item)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          <div className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg">Subtotal:</span>
                  <span className="text-lg font-semibold">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg">Shipping:</span>
                  <span className="text-lg font-semibold">₹0</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-xl font-bold">₹{totalAmount}</span>
                </div>
              </CardContent>
              <CardFooter className="flex sm:justify-end gap-4 flex-col sm:flex-row p-6 pt-0">
                 <CheckoutDrawer open={open} setOpen={setOpen} cart={cart} totalAmount={totalAmount} />
                <Button className="w-full sm:w-auto" onClick={() => navigate('/home')}>Continue Shopping</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
 

    </div>
  )
}

export default Cart
