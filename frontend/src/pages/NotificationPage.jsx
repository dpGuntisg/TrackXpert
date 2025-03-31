import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axios";
import { useTranslation } from 'react-i18next';
import TrackRequest from "../components/TrackRequest";

export default function NotificationPage() {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await axiosInstance.get("/track-requests/requests");
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setError(t('notifications.fetchError'));
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const updateRequestStatus = async (requestId, status) => {
        try {
            const response = await axiosInstance.put(`/track-requests/update-request/${requestId}`, { status });
            if (Array.isArray(response.data)) {
                setNotifications(response.data);
            } else {
                setError(t('notifications.updateError'));
            }
        } catch (error) {
            console.error("Error updating request status:", error);
            setError(t('notifications.updateError'));
        }
    };

    return (
        <div className="min-h-screen bg-mainBlue p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-mainYellow mb-8">{t('notifications.title')}</h1>
                {error && (
                    <div className="text-red-500 mb-6 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}
                <div className="space-y-4">
                    {Array.isArray(notifications) && notifications.map((request) => (
                        <TrackRequest 
                            key={request._id} 
                            request={request} 
                            onStatusUpdate={updateRequestStatus}
                            showActions={true}
                            className="bg-accentBlue"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}