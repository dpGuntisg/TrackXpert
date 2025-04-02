import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axios";
import { useTranslation } from 'react-i18next';
import TrackRequest from "../components/TrackRequest";

export default function NotificationPage() {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notifications');

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            // Fetch both notifications and sent requests
            const [notificationsRes, sentRequestsRes] = await Promise.all([
                axiosInstance.get("/track-requests/notifications"),
                axiosInstance.get("/track-requests/sent-requests")
            ]);
            setNotifications(notificationsRes.data);
            setSentRequests(sentRequestsRes.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(t('notifications.fetchError'));
            setNotifications([]);
            setSentRequests([]);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateRequestStatus = async (requestId, status) => {
        try {
            await axiosInstance.put(`/track-requests/update-request/${requestId}`, { status });
            fetchData();
        } catch (error) {
            console.error("Error updating request status:", error);
            setError(t('notifications.updateError'));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-mainBlue p-4 sm:p-8 flex items-center justify-center">
                <div className="text-mainYellow">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mainBlue p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-mainYellow mb-8">{t('notifications.title')}</h1>
                
                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            activeTab === 'notifications'
                                ? 'bg-mainYellow text-mainBlue'
                                : 'text-gray-400 hover:text-mainYellow'
                        }`}
                    >
                        {t('notifications.notifications')} ({notifications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            activeTab === 'sent'
                                ? 'bg-mainYellow text-mainBlue'
                                : 'text-gray-400 hover:text-mainYellow'
                        }`}
                    >
                        {t('notifications.sentRequests')} ({sentRequests.length})
                    </button>
                </div>

                {error && (
                    <div className="text-red-500 mb-6 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}

                {activeTab === 'notifications' ? (
                    notifications.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">
                            {t('notifications.noNotifications')}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((request) => (
                                <TrackRequest 
                                    key={request._id} 
                                    request={request} 
                                    onStatusUpdate={updateRequestStatus}
                                    showActions={true}
                                    className="bg-accentBlue"
                                />
                            ))}
                        </div>
                    )
                ) : (
                    sentRequests.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">
                            {t('notifications.noSentRequests')}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sentRequests.map((request) => (
                                <TrackRequest 
                                    key={request._id} 
                                    request={request} 
                                    onStatusUpdate={updateRequestStatus}
                                    showActions={false}
                                    className="bg-accentBlue"
                                />
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}