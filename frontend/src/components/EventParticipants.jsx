import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faImagePortrait } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../utils/axios';

const EventParticipants = ({ eventId }) => {
    const { t } = useTranslation();
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await axiosInstance.get(`/event-registrations/event/${eventId}`);
                // Filter only approved registrations
                const approvedParticipants = response.data.registrations
                    .filter(reg => reg.status === 'approved')
                    .map(reg => reg.user);
                setParticipants(approvedParticipants);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching participants:', err);
                setError(err.response?.data?.message || t('common.error'));
                setLoading(false);
            }
        };

        fetchParticipants();
    }, [eventId, t]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mainRed"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-sm p-4">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-accentBlue p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center">
                <FontAwesomeIcon icon={faUsers} className="mr-2 text-mainYellow" />
                {t('event.participants')}
            </h2>
            
            <div className="space-y-3">
                {participants.length > 0 ? (
                    participants.map((participant) => (
                        <div key={participant._id} className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                {participant.profile_image?.data ? (
                                    <img 
                                    src={participant.profile_image.data}
                                        alt={participant.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                        <FontAwesomeIcon icon={faImagePortrait} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-white font-medium">{participant.username}</p>
                                {participant.name && (
                                    <p className="text-gray-400 text-sm">{participant.name}</p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center py-4">
                        {t('event.noParticipants')}
                    </p>
                )}
            </div>
        </div>
    );
};

export default EventParticipants;
