import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const [isBanned, setIsBanned] = useState(false);
    const [banReason, setBanReason] = useState(null);
    const [bannedUntil, setBannedUntil] = useState(null);

    const checkAuthStatus = async () => {
        try {
            const response = await axiosInstance.get("/users/profile");
            if (response.status === 200 && response.data.user) {
                setUserId(response.data.user._id);
                setRole(response.data.user.role);
                setIsBanned(response.data.user.isBanned);
                setBanReason(response.data.user.banReason);
                setBannedUntil(response.data.user.bannedUntil);
            } else {
                setUserId(null);
                setRole(null);
                setIsBanned(false);
                setBanReason(null);
                setBannedUntil(null);
            }
        } catch (error) {
            if (error.response?.status === 403 && error.response?.data?.banned) {
                setIsBanned(true);
                setBanReason(error.response.data.reason);
                setBannedUntil(error.response.data.bannedUntil);
                setUserId(null);
                setRole(null);
            } else {
                console.error("Error checking auth status:", error);
                setUserId(null);
                setRole(null);
                setIsBanned(false);
                setBanReason(null);
                setBannedUntil(null);
            }
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
        isBanned,
        banReason,
        bannedUntil,
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