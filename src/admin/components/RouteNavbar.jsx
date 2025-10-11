import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const RouteNavbar = () => {
  const adminBasePath = import.meta.env.VITE_ADMIN || '/admin';
  
  return (
    <div className="mb-6">
      <div className="flex overflow-x-auto space-x-2 pb-2">
        <NavLink to={`${adminBasePath}/overview`}>
          {({ isActive }) => (
            <Button variant={isActive ? 'default' : 'outline'} size="sm">
              Overview
            </Button>
          )}
        </NavLink>

        <NavLink to={`${adminBasePath}/orders`}>
          {({ isActive }) => (
            <Button variant={isActive ? 'default' : 'outline'} size="sm">
              Orders
            </Button>
          )}
        </NavLink>

        <NavLink to={`${adminBasePath}/category`}>
          {({ isActive }) => (
            <Button variant={isActive ? 'default' : 'outline'} size="sm">
              Category
            </Button>
          )}
        </NavLink>

        <NavLink to={`${adminBasePath}/products`}>
          {({ isActive }) => (
            <Button variant={isActive ? 'default' : 'outline'} size="sm">
              Products
            </Button>
          )}
        </NavLink>
      </div>
    </div>
  );
};

export default RouteNavbar;
