import React, { useContext, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'; // Import NavLink for navigation
import useUserAuth from '@/hooks/useUserAuth'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from '@/utils/api';
import { SocketContext } from '@/context/SocketContext';


const Home = () => {
  const { user } = useUserAuth();
  const [categories, setCategories] = useState([])
  const socket = useContext(SocketContext)
  
 useEffect(() => {
  const fetchData = async()=>{
    const response = await api.get('api/category/get-categories');
    if(response.success){
      setCategories(response.categories);
    }
  }
  fetchData();
   
 }, [])

 useEffect(() => {
  const handleCategoryAdded = (category)=>{
    setCategories((prevCategories)=>[category,...prevCategories])
  }
  const handleCategoryUpdated = (category)=>{
    setCategories((prevCategories)=>prevCategories.map(cat=>cat._id===category._id?category:cat))
  }
  const handleCategoryDeleted = (id)=>{
    setCategories((prevCategories)=>prevCategories.filter(cat=>cat._id!==id))
  }
  socket.on('categoryAdded',handleCategoryAdded)
  socket.on('categoryUpdated',handleCategoryUpdated)
  socket.on('categoryDeleted',handleCategoryDeleted)
  return () => {
    socket.off('categoryAdded',handleCategoryAdded)
    socket.off('categoryUpdated',handleCategoryUpdated)
    socket.off('categoryDeleted',handleCategoryDeleted)
  }
 }, [socket])
 
 

  return (
    <div className='container mx-auto px-4 py-8 min-h-screen'>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.customerName}</h1>
        <p className="text-muted-foreground mt-2">Explore our refreshing collection of drinks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <NavLink to={`/product/${category.name}`} key={category._id} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300">
            <Card>
              <CardContent className="p-0">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-semibold text-white mb-1">{category.name}</h3>
                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                      {category.count}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default Home
