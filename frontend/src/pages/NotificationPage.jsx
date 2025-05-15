import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faEnvelope, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../utils/axios";
import { useTranslation } from 'react-i18next';
import TrackRequest from "../components/TrackRequest";
import EventRequest from "../components/EventRequest";
import { useAuth } from "../context/AuthContext";

export default function NotificationPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [trackRequests, setTrackRequests] = useState([]);
    const [eventRequests, setEventRequests] = useState([]);
    const [sentTrackRequests, setSentTrackRequests] = useState([]);
    const [sentEventRequests, setSentEventRequests] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notifications');

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            // Fetch all types of requests
            const [trackRequestsRes, eventRequestsRes, sentTrackRequestsRes, sentEventRequestsRes] = await Promise.all([
                axiosInstance.get("/track-requests/notifications"),
                axiosInstance.get("/event-registrations/pending"),
                axiosInstance.get("/track-requests/sent-requests"),
                axiosInstance.get("/event-registrations/user")
            ]);
            
            // Handle responses correctly based on their structure
            setTrackRequests(trackRequestsRes.data || []);
            setEventRequests(Array.isArray(eventRequestsRes.data) ? eventRequestsRes.data : []);
            setSentTrackRequests(sentTrackRequestsRes.data || []);
            setSentEventRequests(sentEventRequestsRes.data?.registrations || []);
            
            setError(null);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error.response?.data?.message || t('notifications.fetchError'));
            setTrackRequests([]);
            setEventRequests([]);
            setSentTrackRequests([]);
            setSentEventRequests([]);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTrackRequestUpdate = async (requestId, status) => {
        try {
            await axiosInstance.put(`/track-requests/update-request/${requestId}`, { status });
            fetchData();
        } catch (error) {
            console.error("Error updating track request:", error);
            setError(error.response?.data?.message || t('notifications.updateError'));
        }
    };

    const handleEventRequestUpdate = async (requestId, status) => {
        try {
            await axiosInstance.put(`/event-registrations/${requestId}/status`, { status });
            fetchData();
        } catch (error) {
            console.error("Error updating event request:", error);
            setError(error.response?.data?.message || t('notifications.updateError'));
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
            <div className="">
                <h1 className="text-3xl font-bold text-mainYellow mb-8">{t('notifications.title')}</h1>
                
                {/* Tabs */}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`px-6 py-3 font-medium flex items-center ${activeTab === 'notifications'
                            ? 'border-b-2 border-mainYellow text-mainYellow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2"/>
                        {t('notifications.title')} ({trackRequests.length + eventRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`px-6 py-3 font-medium flex items-center ${activeTab === 'sent'
                            ? 'border-b-2 border-mainYellow text-mainYellow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <FontAwesomeIcon icon={faPaperPlane} className="mr-2"/>
                        {t('notifications.sentRequests')} ({sentTrackRequests.length + sentEventRequests.length})
                    </button>
                </div>

                {error && (
                    <div className="text-red-500 mb-6 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}

                {activeTab === 'notifications' ? (
                    trackRequests.length === 0 && eventRequests.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">
                            {t('notifications.noNotifications')}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {trackRequests.map((request) => (
                                <TrackRequest 
                                    key={request._id} 
                                    request={request} 
                                    onStatusUpdate={handleTrackRequestUpdate}
                                    showActions={true}
                                    className="bg-accentBlue"
                                    action={t('notifications.wantsToJoin')}
                                />
                            ))}
                            {eventRequests.map((request) => (
                                <EventRequest 
                                    key={request._id} 
                                    request={request} 
                                    onStatusUpdate={handleEventRequestUpdate}
                                    showActions={true}
                                    className="bg-accentBlue"
                                />
                            ))}
                        </div>
                    )
                ) : (
                    sentTrackRequests.length === 0 && sentEventRequests.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">
                            {t('notifications.noSentRequests')}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sentTrackRequests.map((request) => (
                                <TrackRequest 
                                    key={request._id} 
                                    request={request} 
                                    onStatusUpdate={handleTrackRequestUpdate}
                                    showActions={false}
                                    className="bg-accentBlue"
                                    isSentByCurrentUser={request.sender?.id === user?.id}
                                />
                            ))}
                            {sentEventRequests.map((request) => (
                                <EventRequest 
                                    key={request._id} 
                                    request={request} 
                                    onStatusUpdate={handleEventRequestUpdate}
                                    showActions={false}
                                    className="bg-accentBlue"
                                    isSentByCurrentUser={request.user?.id === user?.id}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}