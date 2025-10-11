import React from 'react'
import { Sheet, SheetContent, SheetDescription, SheetTrigger } from "./ui/sheet";
import { UserCircle, Menu, UserCircle2Icon, ShoppingCart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { DialogDescription, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import ThemeToggle from "./ThemeToggle";
import LogoutButton from './Logout';
import { Button } from './ui/button';

const Drawwer = ({ isMenuOpen, setIsMenuOpen, user }) => {
    return (
        <div>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-card flex flex-col" >
                    <DialogTitle className="text-lg font-medium mb-6">Menu</DialogTitle>
                    <SheetDescription/>
                    <div className="flex flex-col space-y-6">
                        {/* User Avatar */}
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                    {user?.customerName ? user.customerName.charAt(0).toUpperCase() : <UserCircle className="h-6 w-6 text-muted-foreground" />}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                                {user?.customerName || "Guest"}
                            </span>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex flex-col space-y-2">
                            <Button variant="ghost" className="justify-start w-full" asChild>
                                <NavLink to="/home" onClick={() => setIsMenuOpen(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                    Home
                                </NavLink>
                            </Button>
                            <Button variant="ghost" className="justify-start w-full" asChild>
                                <NavLink to="/profile" onClick={() => setIsMenuOpen(false)}>
                                    <UserCircle2Icon className="h-5 w-5 mr-2" />
                                    Profile
                                </NavLink>
                            </Button>
                            <Button variant="ghost" className="justify-start w-full" asChild>
                                <NavLink to="/orders" onClick={() => setIsMenuOpen(false)}>
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Orders
                                </NavLink>
                            </Button>
                        </div>

                        {/* Theme and Logout */}
                        <div className="mt-auto pt-4 border-t">
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm">Theme</span>
                                <ThemeToggle />
                            </div>
                            <LogoutButton className="w-full mt-2" />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

        </div>
    )
}

export default Drawwer
