import { useState, useEffect } from 'react';

const useUserAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUser = async () => {
        try {
            const authToken = JSON.parse(localStorage.getItem('authToken'));
            const token = authToken.token;
            
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/auth/user`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            // console.log(data)
            setUser(data.user);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return { user, loading, error };
};

export default useUserAuth;
