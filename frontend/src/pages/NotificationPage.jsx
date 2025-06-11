import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faEnvelope, faTrash, } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../utils/axios";
import { useTranslation } from 'react-i18next';
import TrackRequest from "../components/TrackRequest";
import EventRequest from "../components/EventRequest";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

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
            if (status === 'approved') {
                toast.success(t('notifications.trackRequestAccepted'));
            } else if (status === 'rejected') {
                toast.info(t('notifications.trackRequestRejected'));
            }
        } catch (error) {
            console.error("Error updating track request:", error);
            setError(error.response?.data?.message || t('notifications.updateError'));
        }
    };

    const handleEventRequestUpdate = async (requestId, status) => {
        try {
            await axiosInstance.put(`/event-registrations/${requestId}/status`, { status });
            fetchData();
            if (status === 'approved') {
                toast.success(t('notifications.eventRequestAccepted'));
            } else if (status === 'rejected') {
                toast.info(t('notifications.eventRequestRejected'));
            }
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
                <h1 className="text-2xl sm:text-3xl font-bold text-mainYellow mb-6 sm:mb-8">{t('notifications.title')}</h1>
                <div className="mb-6">
                    {/* Tab Navigation*/}
                    <div className="flex items-center justify-between gap-2">
                        {/* Tab Buttons*/}
                        <div className="flex w-full sm:w-auto gap-2 sm:gap-4">
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`px-3 py-3 sm:px-6 font-medium flex items-center text-sm sm:text-base transition-colors duration-200 ${
                                    activeTab === 'notifications'
                                        ? 'border-b-2 border-mainYellow text-mainYellow' 
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <div className="relative">
                                    <FontAwesomeIcon icon={faEnvelope} className="size-6"/>
                                    {(trackRequests.length + eventRequests.length) > 0 && (
                                        <span className="absolute -top-2 -right-2 text-xs bg-mainRed text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                                            {trackRequests.length + eventRequests.length}
                                        </span>
                                    )}
                                </div>
                                <span className="hidden sm:inline ml-3 truncate">
                                    {t('notifications.title')}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('sent')}
                                className={`px-3 py-3 sm:px-6 font-medium flex items-center text-sm sm:text-base transition-colors duration-200 ${
                                    activeTab === 'sent'
                                        ? 'border-b-2 border-mainYellow text-mainYellow' 
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <div className="relative">
                                    <FontAwesomeIcon icon={faPaperPlane} className="size-6"/>
                                    {(sentTrackRequests.length + sentEventRequests.length) > 0 && (
                                        <span className="absolute -top-3 -right-4 text-xs bg-mainRed text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                                            {sentTrackRequests.length + sentEventRequests.length}
                                        </span>
                                    )}
                                </div>
                                <span className="hidden sm:inline ml-3 truncate">
                                    {t('notifications.sentRequests')}
                                </span>
                            </button>
                        </div>
                        
                        {/* Delete Button */}
                        {((activeTab === 'notifications' && (trackRequests.length > 0 || eventRequests.length > 0)) ||
                        (activeTab === 'sent' && (sentTrackRequests.length > 0 || sentEventRequests.length > 0))) && (
                            <button className="px-3 py-3 sm:px-6 font-medium text-gray-400 hover:text-mainRed flex items-center text-sm sm:text-base transition-colors duration-200 hover:bg-mainRed/10 rounded-lg">
                                <FontAwesomeIcon icon={faTrash} className="size-5" />
                                <span className="hidden sm:inline ml-2">{t('common.delete')}</span>
                            </button>
                        )}
                    </div>
                    
                    {/* Tab Separator Line */}
                    <div className="border-b border-gray-600 mb-4"></div>
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