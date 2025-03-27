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

    return (
        <div className="p-6">
            <h1 className="text-mainYellow text-2xl font-bold mb-4">Notifications</h1>
            {notifications.map((notification) => (
                <TrackRequest className="mb-2 bg-accentBlue" key={notification._id} request={notification} />
            ))}
        </div>
    )
}