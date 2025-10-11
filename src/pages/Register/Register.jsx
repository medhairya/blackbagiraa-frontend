import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ThemeToggle from '@/components/ThemeToggle'
import { NavLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { api } from '@/utils/api'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const navigate = useNavigate()
   useEffect(() => {
    const authToken = JSON.parse(localStorage.getItem('authToken'));
    const token = authToken?.token;
    if (token) {
      navigate("/home");
    }
     
   }, [])
   

  const onSubmit = async(data) => {
    try {
      const response =  await api.post('api/user/register', {
        customerName: data.customerName,
        shopName: data.shopName,
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        contactNumber: data.contactNumber,
        password: data.password
      });
      if(response.success){
        toast.success(response.message);
        reset(); // Clear the form fields on successful registration
      }else{
        toast.error(response.message);
      }
     
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred', {
        style: {
          background: "#1E293B",
          color: "#F8FAFC",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "14px",
        }
      });
    }
  }

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-background px-4 py-6 md:px-0">
        <div className="w-full max-w-md p-4 md:p-6 space-y-6 bg-card rounded-lg shadow-lg sm:bg-card sm:rounded-lg sm:shadow-lg">
          <div className="flex justify-center">
            <img 
              src="/Vrundavan.jpg" 
              alt="Vrundavan Logo" 
              className="bg-background w-36 h-24 md:w-36 md:h-24" 
            />
          </div>
          
          <h1 className="text-xl md:text-2xl font-bold text-center">Register</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input 
              type="text" 
              placeholder="Customer Name" 
              className="w-full" 
              {...register("customerName", { required: true })}
            />
            {errors.customerName && <p className="text-red-500 text-xs">Customer name is required</p>}
            
            <Input 
              type="text" 
              placeholder="Shop Name" 
              className="w-full" 
              {...register("shopName", { required: true })}
            />
            {errors.shopName && <p className="text-red-500 text-xs">Shop name is required</p>}
            
            <Input 
              type="text" 
              placeholder="Address Line 1" 
              className="w-full" 
              {...register("addressLine1", { required: true })}
            />
            {errors.addressLine1 && <p className="text-red-500 text-xs">Address is required</p>}
            
            <Input 
              type="text" 
              placeholder="City" 
              className="w-full" 
              {...register("city", { required: true })}
            />
            {errors.city && <p className="text-red-500 text-xs">City is required</p>}
            
            <Input 
              type="text" 
              placeholder="State" 
              className="w-full" 
              {...register("state", { required: true })}
            />
            {errors.state && <p className="text-red-500 text-xs">State is required</p>}
            
            <Input 
              type="text" 
              placeholder="Pincode" 
              className="w-full" 
              {...register("pincode", { required: true, pattern: /^\d{6}$/ })}
            />
            {errors.pincode && <p className="text-red-500 text-xs">Valid 6-digit pincode is required</p>}
            
            <Input 
              type="tel" 
              placeholder="Contact Number" 
              className="w-full" 
              {...register("contactNumber", { required: true, pattern: /^\d{10}$/ })}
            />
            {errors.contactNumber && <p className="text-red-500 text-xs">Valid 10-digit contact number is required</p>}
            
            <Input 
              type="password" 
              placeholder="Password" 
              className="w-full" 
              {...register("password", { required: true, minLength: 6 })}
            />
            {errors.password && <p className="text-red-500 text-xs">Password must be at least 6 characters</p>}
            
            <Button type="submit" className="w-full">Register</Button>
          </form>
          
          <div className="text-center text-sm md:text-base">
            <p>
              Already have an account? <NavLink to="/" className="text-primary hover:underline">Login</NavLink>
            </p>
          </div>
          
          <div className="flex justify-center pt-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  )
}

export default Register
