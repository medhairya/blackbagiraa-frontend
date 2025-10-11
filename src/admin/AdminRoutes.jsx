import AuthProtected from "@/middlewares/AuthProtected";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import Orders from "./pages/Orders/Orders";
import Layout from "./components/Layout.jsx";
import Products from "./pages/products/Products";
import CategoryPage from "./pages/Category/Category";


const adminRoutes = [

      {
        path:`${import.meta.env.VITE_ADMIN}/overview`,
        element:<AuthProtected allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></AuthProtected>
      },
      {
        path:`${import.meta.env.VITE_ADMIN}/orders`,
        element:<AuthProtected allowedRoles={['admin']}><Layout><Orders /></Layout></AuthProtected>
      },
      {
        path:`${import.meta.env.VITE_ADMIN}/category`,
        element:<AuthProtected allowedRoles={['admin']}><Layout><CategoryPage /></Layout></AuthProtected>
      },
      {
        path:`${import.meta.env.VITE_ADMIN}/products`,
        element:<AuthProtected allowedRoles={['admin']}><Layout><Products /></Layout></AuthProtected>
      },

   
]



export default adminRoutes;
