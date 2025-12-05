import SplashScreen from '@/components/SplashScreen'
import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { api } from '@/utils/api'

const Login = () => {
  const [showSplash, setShowSplash] = useState(true)
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState('user') // Default role is 'user'
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  
  useEffect(() => {
    // const authToken = JSON.parse(localStorage.getItem('authToken'));
    // const token = authToken?.token;
    
    // if (token) {
    //   navigate("/home");
    //   return; // Stop further execution
    // }
  
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
  
    return () => clearTimeout(timer);
  }, [navigate]);
  
  const onSubmit = async (data) => {
    setLoading(true)
    try {
      console.log(data,userRole);
      const credentials = {
        contactNumber:data.phoneNumber,
        password:data.password,
        role:userRole
      }
      console.log(credentials);
      
        const response = await api.post('api/user/login',credentials)
        console.log(response);
        if(response.success){
          if(!response.role){
            toast.error(response.message);
            return;
          }
          toast.success(response.message);
          if(response.role === 'admin'){
            navigate(`${import.meta.env.VITE_ADMIN}/overview`);
          }else{
            navigate('/product/Our Collection');
          }
          
        localStorage.setItem("authToken", JSON.stringify({
        token: response.token,
        role: userRole, // Save the role in localStorage as well
         expiry: Date.now() + 12 * 60 * 60 * 1000
       }));
        }else{
          throw new Error(response.message);
        }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-background px-4 py-6 md:px-0">
          <div className="w-full max-w-md p-4 md:p-6 space-y-6 bg-card rounded-lg shadow-lg sm:bg-card sm:rounded-lg sm:shadow-lg">
            <div className="flex justify-center">
              <img 
                src="/Vrundavan.jpg" 
                alt="Vrundavan Logo" 
                className="bg-background w-36 h-24 md:w-36 md:h-24" 
              />
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold text-center">Login</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Role Selection Radio Group */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Login as:</Label>
                <RadioGroup 
                  defaultValue="user" 
                  className="flex justify-center space-x-6" 
                  value={userRole}
                  onValueChange={setUserRole}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="cursor-pointer">User</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="cursor-pointer">Admin</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Input 
                type="tel" 
                placeholder="Phone Number" 
                className="w-full" 
                {...register("phoneNumber", { 
                  required: true, 
                  pattern: /^\d{10}$/ 
                })}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs">Valid 10-digit phone number is required</p>
              )}
              
              <Input 
                type="password" 
                placeholder="Password" 
                className="w-full" 
                {...register("password", { 
                  required: true, 
                  minLength: 6
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">Password is required and must be at least 6 characters</p>
              )}
              
              <Button type="submit" className="w-full flex items-center justify-center" disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="mr-2" />
                    Logging in...
                  </>
                ) : (
                  `Login as ${userRole === 'admin' ? 'Admin' : 'User'}`
                )}
              </Button>
            </form>
            
            <div className="text-center text-sm md:text-base">
              <p>
                Don't have an account? <NavLink to="/register" className="text-primary hover:underline">Sign up</NavLink>
              </p>
            </div>
            
            <div className="flex justify-center pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Login