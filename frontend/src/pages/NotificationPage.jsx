import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useTranslation } from 'react-i18next';
import TrackRequest from "../components/TrackRequest";

export default function NotificationPage() {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axiosInstance.get("/track-requests/requests");
                setNotifications(response.data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    const updateRequestStatus = async (requestId, status) => {
        try {
            const response = await axiosInstance.put(`/track-requests/update-request/${requestId}`, { status });
            setNotifications(response.data);
        } catch (error) {
            console.error("Error updating request status:", error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-mainYellow mb-6">{t('notifications.title')}</h1>
            <div className="space-y-4">
                {notifications.map((request) => (
                    <TrackRequest className="bg-accentBlue"
                        key={request._id} 
                        request={request} 
                        onStatusUpdate={updateRequestStatus}
                        showActions={true}
                    />
                ))}
            </div>
        </div>
    );
}