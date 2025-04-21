import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import TrackCard from "../TrackCard";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

export const EventTrackSelectionStep = ({
    selectedTracks = [],
    onSelectionChange = () => {},
    errors
}) => {
    const { userId } = useAuth();
    const [userTracks, setUserTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUserTracks = async () => {
            try {
                const res = await axiosInstance.get(`/tracks/profile/${userId}/tracks`);
                setUserTracks(res.data.tracks);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user tracks:", error);
                setLoading(false);
            }
        };
        if (userId) {
            fetchUserTracks();
        }
    }, [userId]);

    const handleCardClick = (trackId) => {
        const isSelected = selectedTracks.includes(trackId);
    
        const updatedTracks = isSelected
            ? selectedTracks.filter(id => id !== trackId) // remove
            : [...selectedTracks, trackId]; // add
    
        onSelectionChange(updatedTracks); // update parent
    };
      

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">{t('event.form.selectTracks')}</h3>
            {errors?.track &&
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg mb-4">
                    <FontAwesomeIcon icon={faExclamationCircle} />
                    <p className="text-sm">{errors.track}</p>
                </div>
            }
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainRed"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userTracks.length > 0 ? (
                        userTracks.map(track => (
                            <TrackCard
                                key={track._id}
                                track={track}
                                disableLink={true}
                                className="compact-track-selection"
                                isSelectionMode={true}
                                isSelected={selectedTracks.includes(track._id)}
                                onClick={() => handleCardClick(track._id)} 
                            />
                        ))
                    ) : (
                        <p className="col-span-full text-center py-8">No tracks found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventTrackSelectionStep;