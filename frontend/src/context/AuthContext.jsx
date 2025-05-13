import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);

    const checkAuthStatus = async () => {
        try {
            const response = await axiosInstance.get("/users/profile");
            if (response.status === 200 && response.data.user) {
                setUserId(response.data.user._id);
                setRole(response.data.user.role);
            } else {
                setUserId(null);
                setRole(null);
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
            setUserId(null);
            setRole(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const value = {
        userId,
        role,
        loading,
        setUserId,
        setRole,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 