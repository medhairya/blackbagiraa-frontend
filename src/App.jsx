
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import router from './pages/Routes'
import adminRoutes from './admin/AdminRoutes'
function App() {
    
  return (
    <>
    <RouterProvider router={createBrowserRouter([...router,...adminRoutes])} />
    </>
  )
}

export default App
