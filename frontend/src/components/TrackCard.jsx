import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faTag, faRoad, faCar, faFlagCheckered, faHeart } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';

export default function TrackCard({ track, onLikeChange }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userId } = useAuth();
    const truncatedDescription = track.description.length > 150 
        ? track.description.substring(0, 150) + "..."
        : track.description;
    const FormatedDistance = `${parseFloat(track.distance).toFixed(2).replace('.', ',')} km`;
    const firstImage = track.images?.[0]?.data;
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(track.likes?.length || 0);

    // Initialize and update like state whenever track or userId changes
    useEffect(() => {
        if (track && Array.isArray(track.likes) && userId) {
            setIsLiked(track.likes.some(likeId => 
                typeof likeId === 'string' ? likeId === userId : likeId.toString() === userId
            ));
        }
    }, [track, userId]);

    const handleLikeClick = async (e) => {
        e.preventDefault(); // Prevent navigation
        if (!userId) {
            navigate('/signin');
            return;
        }

        try {
            const endpoint = isLiked 
                ? `/tracks/${track._id}/unlike` 
                : `/tracks/${track._id}/like`;
            
            const response = await axiosInstance.post(endpoint);

            // Get the updated track data from the response
            const updatedTrack = response.data.track;

            // Update the track's likes array with the new data
            track.likes = updatedTrack.likes;

            // Update local state
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

            // Notify parent component with the updated likes array
            if (onLikeChange) {
                onLikeChange(track._id, !isLiked, updatedTrack.likes);
            }
        } catch (error) {
            console.error('Error updating like status:', error);
            // If we get a 500 error about already liked/unliked, don't show it to the user
            if (error.response?.status === 500) {
                // Update the local state to match reality
                const newIsLiked = !isLiked;
                setIsLiked(newIsLiked);
                
                // Update the track's likes array
                if (newIsLiked) {
                    track.likes = [...track.likes, userId];
                } else {
                    track.likes = track.likes.filter(id => 
                        typeof id === 'string' ? id !== userId : id.toString() !== userId
                    );
                }
                
                // Notify parent component
                if (onLikeChange) {
                    onLikeChange(track._id, newIsLiked, track.likes);
                }
            }
        }
    };

    // Function to format time in 12-hour format
    const formatTime = (timeStr) => {
        const [hour, minute] = timeStr.split(":");
        const hourNum = parseInt(hour, 10);
        const ampm = hourNum >= 12 ? "PM" : "AM";
        return `${hourNum % 12 || 12}:${minute} ${ampm}`;
    };

    // Function to get tag category and label from translations
    const getTagInfo = (tag) => {
        const categories = ['trackType', 'roadType', 'carType'];
        
        for (const category of categories) {
            const categoryTags = t(`tags.track.${category}`, { returnObjects: true });
            if (tag in categoryTags) {
                return {
                    category,
                    label: categoryTags[tag]
                };
            }
        }
        return null;
    };

    // Function to get icon for tag category
    const getTagIcon = (category) => {
        switch (category) {
            case 'trackType':
                return faFlagCheckered;
            case 'roadType':
                return faRoad;
            case 'carType':
                return faCar;
            default:
                return faTag;
        }
    };

    return (
        <Link to={`/tracks/${track._id}`} 
        className='flex flex-col bg-accentBlue drop-shadow-lg outline outline-12 outline-mainRed overflow-hidden hover:scale-105 transition-all ease-in-out duration-300
            h-[550px] w-[340px] rounded'>
          
            <div className='relative w-full h-[220px]'>
                <img src={firstImage} alt={track.name} className="w-full h-full object-cover" loading="lazy"/>
                <div className="absolute bottom-4 left-4 space-y-2 bg-gray-800 bg-opacity-50 p-2">
                    <div className='flex items-center space-x-2'>
                        <FontAwesomeIcon icon={faLocationDot} color='white' />
                        <p className='font-bold text-sm text-gray-300'>{track.location}</p>
                    </div>
                </div>

            </div>

            {userId && userId !== track.created_by?._id && (
                <button 
                    onClick={handleLikeClick}
                    className={`absolute bottom-4 left-4 text-2xl ${isLiked ? 'text-mainRed' : 'text-gray-400'} hover:text-mainRed transition-colors duration-200`}
                >
                    <FontAwesomeIcon icon={faHeart} />
                </button>
            )}

            {track.distance > 0 && (
                <div className="absolute bottom-4 right-4 bg-mainYellow text-mainBlue text-xs font-semibold px-3 py-1 opacity-80 rounded">
                    {FormatedDistance}
                </div>
            )}

            <div className="p-6 flex flex-col flex-grow">
                <h3 className='font-bold text-xl text-white mb-2'>{track.name}</h3>
                <p className='text-sm text-gray-300 line-clamp-4 mb-4'>{truncatedDescription}</p>
                
                {track.tags && track.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {track.tags.map((tag, index) => {
                            const tagInfo = getTagInfo(tag);
                            if (!tagInfo) return null;
                            return (
                                <div 
                                    key={index}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-white text-sm font-medium border border-gray-700"
                                >
                                    <FontAwesomeIcon icon={getTagIcon(tagInfo.category)} className="text-mainYellow" />
                                    <span>{tagInfo.label}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-2">
                    {track.availability && track.availability.length > 0 && (
                        <div className="text-sm text-gray-400">
                            {track.availability.slice(0, 3).map((slot, index) => (
                                <div key={index}>
                                    <span className="mr-2">
                                        {slot.startDay === slot.endDay 
                                            ? t(`availability.days.${slot.startDay}`)
                                            : `${t(`availability.days.${slot.startDay}`)} - ${t(`availability.days.${slot.endDay}`)}`}
                                    </span>
                                    <span>
                                        {formatTime(slot.open_time)} - {formatTime(slot.close_time)}
                                    </span>
                                </div>
                            ))}
                            {track.availability.length > 3 && (
                                <p className="text-xs text-gray-400">+{track.availability.length - 3} {t('tracks.more')}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className='fixed bottom-2 left-1/2 transform -translate-x-1/2'>
                <span className="mt-2 text-sm font-semibold">{t('tracks.viewDetails')}</span>
            </div>
        </Link>
    );
}
