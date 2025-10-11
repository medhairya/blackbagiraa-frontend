import { UserCircle, ShoppingCart, Menu, UserCircle2, UserCircle2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState } from "react";
import LogoutButton from "./Logout";
import ThemeToggle from "./ThemeToggle";
import useUserAuth from '@/hooks/useUserAuth'
import { NavLink } from "react-router-dom";
import Drawwer from "./Drawwer";

const Navbar = ({ cartItemCount = 0 }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useUserAuth();

    return (
        <nav className=" bg-card border-b w-full sticky top-0 z-50">
            <div className="flex h-16 items-center justify-between md:justify-start px-4 container mx-auto">
                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <Drawwer isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} />
                </div>

                {/* Logo/Avatar */}
                <div className=" hidden  md:flex md:justify-start md:items-center gap-2 justify-center">
                    <NavLink to="/profile">

                        <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                            <AvatarFallback>
                                {user?.customerName ? user.customerName.charAt(0).toUpperCase() : <UserCircle className="h-6 w-6 text-muted-foreground" />}
                            </AvatarFallback>
    
                        </Avatar>
                    </NavLink>
                        {
                            user?.customerName
                        }
                </div>

                {/* Center - Logo (hidden on mobile) */}
                <div className="flex md:flex-1  justify-center">
                    <NavLink to="/home">
                        <img
                            src="/VrundavanLogo.jpg"
                            alt="Logo"
                            className="h-10 w-auto"
                        />
                    </NavLink>
                </div>

                {/* Right - Cart, Theme Toggle and Logout */}
                <div className=" flex justify-end items-center gap-4">
                   <NavLink to="/orders">
                    <span className="text-muted-foreground hover:text-primary cursor-pointer hidden md:block">Orders</span>
                   </NavLink>
                    <Button variant="ghost" size="icon" className="relative" asChild>
                        <NavLink to="/cart">
                            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </NavLink>
                    </Button>
                    <div className="hidden md:block">
                        <ThemeToggle />
                    </div>
                    <div className="hidden md:block">
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;