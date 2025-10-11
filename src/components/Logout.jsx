import React from 'react';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        try {
            const authToken = JSON.parse(localStorage.getItem('authToken'));
            const token = authToken?.token;
            
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }, 
            });

            const data = await response.json();
            if (data.success) {
                localStorage.removeItem('authToken');
                toast.success(data.message);
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Logout failed:', error);
            
        }
    };

    return (
        <Button onClick={handleLogout}>
            Logout
        </Button>
    );
};

export default LogoutButton;
