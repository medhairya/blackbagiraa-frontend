import React, { useState, useRef } from 'react'
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription, 
  DrawerFooter,  
} from "@/components/ui/drawer"
import { Button } from './ui/button'
import { api } from '@/utils/api'
import toast from 'react-hot-toast'

const CheckoutDrawer = ({ open, setOpen, cart, totalAmount }) => {
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const closeButtonRef = useRef(null)
  
  const handlePayOnDelivery = async() => {
    console.log(Object.fromEntries(cart))
    setIsAnimating(true)
    
    try {
      const response = await api.post('api/products/placeOrder', {
        items: Object.fromEntries(cart),
        totalAmount: totalAmount,
        paymentMethod: "Pay on Delivery",
      })
      
      if(response.success) {
        toast.success("Order placed successfully")
        setTimeout(() => {
          setShowOrderConfirmation(true)
          setTimeout(() => {
            setShowOrderConfirmation(false)
            setIsAnimating(false)
            setOpen(false)
          }, 1000)
        }, 1000)
      }
    } catch (error) {
       console.log(error)
       toast.error("Failed to place order")
       setIsAnimating(false)
    }
  }
  
  // Separate trigger button to avoid nesting interactive elements
  const TriggerButton = () => (
    <Button 
      className="w-full sm:w-auto"
      onClick={() => setOpen(true)}
    >
      Proceed to Checkout
    </Button>
  )

  return (
    <>
      {/* Separate trigger from drawer component */}
      {!open && <TriggerButton />}
      
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Confirm Your Order</DrawerTitle>
            <DrawerDescription>Confirm order with payment method</DrawerDescription>
          </DrawerHeader>
          
          {isAnimating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                {/* Rotating Circle */}
                <div className={`h-24 w-24 rounded-full ${showOrderConfirmation ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center ${!showOrderConfirmation ? 'animate-spin' : ''}`}>
                  {showOrderConfirmation && (
                    /* Animated Checkmark */
                    <svg
                      className="h-12 w-12 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                        className="animate-draw"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <p className="mt-4 text-lg font-medium">
                {showOrderConfirmation ? 'Order Placed Successfully!' : 'Processing...'}
              </p>
            </div>
          ) : (
            <DrawerFooter className="flex flex-col gap-2">
              <Button onClick={handlePayOnDelivery}>Pay on Delivery</Button>
              <Button onClick={() => toast.error("Pay Online is not available yet")}>Pay Online</Button>
              <Button 
                ref={closeButtonRef}
                className="w-full" 
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}



export default CheckoutDrawer