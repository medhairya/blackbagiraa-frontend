import React from 'react'
import Navbar from './Navbar'
import RouteNavbar from './RouteNavbar'

const Layout = ({children}) => {
  return (
    <div className="p-4 md:p-6 bg-background min-h-screen">
     
      
    <Navbar />
   
    <RouteNavbar />
     {children}


    </div>
  )
}

export default Layout
