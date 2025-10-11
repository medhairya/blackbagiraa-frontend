import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const AuthProtected = ({ children, allowedRoles }) => {
  const location = useLocation()

  const getToken = () => {
    const data = localStorage.getItem("authToken");
    if (!data) return null;

    const { token, expiry, role } = JSON.parse(data); 
    if (Date.now() > expiry) {
      localStorage.removeItem("authToken");
      return null;
    }

    return { token, role };
  };

  const auth = getToken();

  if (!auth) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!allowedRoles?.includes(auth.role)) {
    // Not allowed for this role
    return <Navigate to={auth.role === 'admin' ? `${import.meta.env.VITE_ADMIN}/overview` : "/home"} replace />;
  }

  return <>{children}</>
}

export default AuthProtected
