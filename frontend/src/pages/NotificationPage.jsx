import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faEnvelope, faTrash, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../utils/axios";
import { useTranslation } from 'react-i18next';
import TrackRequest from "../components/TrackRequest";
import EventRequest from "../components/EventRequest";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

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
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch all data regardless of active tab
            const [
                trackRequestsRes, 
                eventRequestsRes,
                sentTrackRequestsRes, 
                sentEventRequestsRes
            ] = await Promise.all([
                axiosInstance.get("/track-requests/notifications"),
                axiosInstance.get("/event-registrations/pending"),
                axiosInstance.get("/track-requests/sent-requests"),
                axiosInstance.get("/event-registrations/user")
            ]);
            
            setTrackRequests(trackRequestsRes.data || []);
            setEventRequests(Array.isArray(eventRequestsRes.data) ? eventRequestsRes.data : []);
            setSentTrackRequests(sentTrackRequestsRes.data || []);
            setSentEventRequests(sentEventRequestsRes.data?.registrations || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error.response?.data?.message || t('notifications.fetchError'));
            // Clear all data on error
            setTrackRequests([]);
            setEventRequests([]);
            setSentTrackRequests([]);
            setSentEventRequests([]);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    // Add effect to refetch when tab changes
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
    
    const toggleSelection = () => {
        setSelectionMode(!selectionMode);
        if (selectionMode) {
            // If exiting selection mode, clear selected requests
            setSelectedRequests([]);
        }
    };

    const handleSelectRequest = (requestId) => {
        if (selectionMode) {
            setSelectedRequests((prevSelected) => {
                if (prevSelected.includes(requestId)) {
                    return prevSelected.filter(id => id !== requestId);
                } else {
                    return [...prevSelected, requestId];
                }
            });
        }
    };

    const handleDeleteSelected = async () => {
        try {
            // Split selected requests into track and event requests
            const trackRequestIds = selectedRequests.filter(id => 
                trackRequests.some(req => req._id === id) || 
                sentTrackRequests.some(req => req._id === id)
            );
            
            const eventRequestIds = selectedRequests.filter(id => 
                eventRequests.some(req => req._id === id) || 
                sentEventRequests.some(req => req._id === id)
            );

            // Delete track requests if any
            if (trackRequestIds.length > 0) {
                await axiosInstance.delete('/track-requests/delete-request', {
                    data: { requestIds: trackRequestIds }
                });
            }

            // Delete event registrations if any
            if (eventRequestIds.length > 0) {
                await axiosInstance.delete('/event-registrations/delete-request', {
                    data: { registrationIds: eventRequestIds }
                });
            }

            toast.success(t('notifications.deleteSuccess'));
            setSelectionMode(false);
            setSelectedRequests([]);
            setShowDeleteModal(false);
            fetchData();
        } catch (error) {
            console.error("Error deleting requests:", error);
            toast.error(error.response?.data?.message || t('notifications.deleteError'));
        }
    };

    const handleDeleteClick = () => {
        if (selectionMode) {
            if (selectedRequests.length > 0) {
                setShowDeleteModal(true);
            } else {
                toast.warning(t('notifications.noRequestsSelected'));
            }
        } else {
            setSelectionMode(true);
        }
    };

    return (
        <div className="min-h-screen bg-mainBlue p-4 sm:p-8">
            <div className="">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-mainYellow">{t('notifications.title')}</h1>
                    <div className="flex gap-2">
                        {selectionMode ? (
                            <>
                                <button
                                    onClick={handleDeleteClick}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    disabled={selectedRequests.length === 0}
                                >
                                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                    {t('common.delete')} ({selectedRequests.length})
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectionMode(false);
                                        setSelectedRequests([]);
                                    }}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                    {t('common.cancel')}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleDeleteClick}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                {t('common.delete')}
                            </button>
                        )}
                    </div>
                </div>

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
                                        <span className="absolute -top-2 -right-2 text-xs bg-mainRed text-white px-1.5 py-0.5 rounded-sm min-w-[18px] text-center leading-none">
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
                    </div>
                    
                    {/* Tab Separator Line */}
                    <div className="border-b border-gray-600 mb-4"></div>
                </div>

                {error && (
                    <div className="text-red-500 mb-6 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}

                {isLoading && (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="flex flex-col items-center">
                        <div className="loader ease-linear rounded-full border-4 border-t-4 border-mainRed h-12 w-12 mb-4"></div>
                        <p className="text-lg">{t('notifications.loading')}</p>
                    </div>
                </div>
                )}

                {activeTab === 'notifications' ? (
                    trackRequests.length === 0 && eventRequests.length === 0 && !isLoading ?  (
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
                                    selectionMode={selectionMode}
                                    selected={selectedRequests.includes(request._id)}
                                    onSelect={handleSelectRequest}
                                />
                            ))}
                            {eventRequests.map((request) => (
                                <EventRequest 
                                    key={request._id} 
                                    request={request} 
                                    onStatusUpdate={handleEventRequestUpdate}
                                    showActions={true}
                                    className="bg-accentBlue"
                                    selectionMode={selectionMode}
                                    selected={selectedRequests.includes(request._id)}
                                    onSelect={handleSelectRequest}
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
                                    selectionMode={selectionMode}
                                    selected={selectedRequests.includes(request._id)}
                                    onSelect={handleSelectRequest}
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
                                    selectionMode={selectionMode}
                                    selected={selectedRequests.includes(request._id)}
                                    onSelect={handleSelectRequest}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteSelected}
                title={t('notifications.deleteConfirmationTitle')}
                message={t('notifications.deleteConfirmationMessage', { count: selectedRequests.length })}
            />
        </div>
    );
}