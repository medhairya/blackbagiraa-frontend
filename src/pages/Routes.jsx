import Login from "./Login/Login";
import Register from "./Register/Register";
import Home from "./Home/Home";
import AuthProtected from "../middlewares/AuthProtected";
import Navbar from "@/components/Navbar";
import Profile from "./Profile/Profile";
import Cart from "./cart/Cart";
import Footer from "@/components/Footer";
import Product from "./product/Product";
import Orders from "./Orders/Orders";
import LandingPage from "./landing-page";

const router = [
// {
//     path: '/',
//     element: <LandingPage/>
// },
{
    path: '/',
    element: <Login/>
},
{
    path: '/register',
    element: <Register />
}
,
{
    path: '/home',
    element: <AuthProtected allowedRoles={['user']}><Navbar/><Home /><Footer /></AuthProtected>
}
,
{
    path: '/profile',
    element: <AuthProtected allowedRoles={['user']}><Navbar/><Profile /><Footer /></AuthProtected>
},
{
    path: '/cart',
    element: <AuthProtected allowedRoles={['user']}><Navbar/><Cart /><Footer /></AuthProtected>
},
{
    path: '/product/:category',
    element: <AuthProtected allowedRoles={['user']}><Navbar/><Product /><Footer /></AuthProtected>
},
{
    path: '/orders',
    element: <AuthProtected allowedRoles={['user']}><Navbar/><Orders /><Footer /></AuthProtected>
}
]

export default router;
