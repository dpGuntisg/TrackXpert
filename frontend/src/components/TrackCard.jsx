import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faTag, faRoad, faCar, faFlagCheckered, faHeart, faStar, faLightbulb, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function TrackCard({ 
    track, 
    onLikeChange, 
    disableLink = false,
    className = "",
    isSelectionMode = false,
    isSelected,
    onClick
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userId } = useAuth();
    const truncatedDescription = track.description.length > 150 
        ? track.description.substring(0, 150) + "..."
        : track.description;
    const FormatedDistance = `${parseFloat(track.distance).toFixed(2).replace('.', ',')} km`;
    const firstImage = track.thumbnailImage?.data || track.images[0];
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

            if (isLiked) {
                toast.warning('You unliked this track!'); // Success message for unlike
            } else {
                toast.success('You liked this track!'); // Success message for like
            }

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
        const categories = ['trackType', 'difficulty', 'surfaceType', 'vehicleType', 'specialFeatures'];
        
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
            case 'surfaceType':
                return faRoad;
            case 'vehicleType':
                return faCar;
            case 'difficulty':
                return faStar;
            case 'specialFeatures':
                return faLightbulb;
            default:
                return faTag;
        }
    };

    // Conditional styling based on selection mode and selection state
    const getCardStyles = () => {
        if (isSelectionMode) {
            // Compact version for selection with different styling based on selection state
            const baseStyle = 'flex flex-col bg-accentBlue drop-shadow-lg overflow-hidden h-[350px] w-full rounded cursor-pointer transition-all ease-in-out duration-300';
            
            // If selected, use mainRed border, otherwise use gray border
            return isSelected 
                ? `${baseStyle} outline outline-2 outline-mainRed hover:outline-mainYellow`
                : `${baseStyle} outline outline-1 outline-gray-700 hover:scale-105`;
        }
        
        // Original full-sized version with hover effects
        return 'flex flex-col bg-accentBlue drop-shadow-lg outline outline-12 outline-mainRed hover:outline-mainYellow overflow-hidden hover:scale-105 transition-all ease-in-out duration-300 h-[550px] w-[340px] rounded';
    };

    // Handle track card click in selection mode
    const handleCardClick = (e) => {
        if (isSelectionMode && onClick) {
            e.preventDefault(); // Prevent navigation if it's a link
            onClick(track._id);
        }
    };

    // Adjust image height for selection mode
    const imageHeight = isSelectionMode ? 'h-[140px]' : 'h-[220px]';

    const cardContent = (
        <>
            <div className={`relative w-full ${imageHeight}`}>
                <img src={firstImage} alt={track.name} className="w-full h-full object-cover" loading="lazy"/>
                
                {/* Checkmark icon for selected tracks */}
                {isSelectionMode && isSelected && (
                    <div className="absolute top-2 right-2 bg-mainRed rounded-full p-2 z-10">
                        <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
                    </div>
                )}
                
                <div className="absolute bottom-4 left-4 space-y-2 bg-gray-800 bg-opacity-50 p-2">
                    <div className='flex items-center space-x-2 max-w-72'>
                        <FontAwesomeIcon icon={faLocationDot} color='white' />
                        <p className='font-bold text-sm text-gray-300'>{track.location}</p>
                    </div>
                </div>
            </div>

            {userId && userId !== track.created_by?._id && !isSelectionMode && (
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

            <div className={`p-4 flex flex-col flex-grow ${isSelectionMode ? 'space-y-2' : 'p-6'}`}>
                <h3 className={`font-bold ${isSelectionMode ? 'text-lg' : 'text-xl'} text-white mb-2`}>{track.name}</h3>
                
                {/* Show shorter description in selection mode */}
                {isSelectionMode ? (
                    <p className='text-xs text-gray-300 line-clamp-2 mb-2'>{truncatedDescription}</p>
                ) : (
                    <p className='text-sm text-gray-300 line-clamp-4 mb-4'>{truncatedDescription}</p>
                )}
                
                {track.tags && track.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {/* Show fewer tags in selection mode */}
                        {track.tags.slice(0, isSelectionMode ? 2 : undefined).map((tag, index) => {
                            const tagInfo = getTagInfo(tag);
                            if (!tagInfo) return null;
                            return (
                                <div 
                                    key={index}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-800 text-white ${isSelectionMode ? 'text-xs' : 'text-sm'} font-medium border border-gray-700`}
                                >
                                    <FontAwesomeIcon icon={getTagIcon(tagInfo.category)} className="text-mainYellow" />
                                    <span>{tagInfo.label}</span>
                                </div>
                            );
                        })}
                        {isSelectionMode && track.tags.length > 2 && (
                            <div className="text-xs text-gray-400">+{track.tags.length - 2} more</div>
                        )}
                    </div>
                )}

                {!isSelectionMode && track.availability && track.availability.length > 0 && (
                    <div className="mt-2">
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
                    </div>
                )}
                
                {/* Compact availability display for selection mode */}
                {isSelectionMode && track.availability && track.availability.length > 0 && (
                    <div className="text-xs text-gray-400">
                        <span>{track.availability.length} available time slot{track.availability.length !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {!disableLink && !isSelectionMode && (
                <div className='fixed bottom-2 left-1/2 transform -translate-x-1/2'>
                    <span className="mt-2 text-sm font-semibold">{t('common.viewDetails')}</span>
                </div>
            )}
        </>
    );

    if (isSelectionMode && !disableLink) {
        return (
            <Link to={`/tracks/${track._id}`} className={`${getCardStyles()} ${className}`}>
                {cardContent}
            </Link>
        );
    }

    if (disableLink || isSelectionMode) {
        return (
            <div 
                className={`${getCardStyles()} ${className}`} 
                onClick={handleCardClick}
            >
                {cardContent}
            </div>
        );
    }

    return (
        <Link to={`/tracks/${track._id}`} className={`${getCardStyles()} ${className}`}>
            {cardContent}
        </Link>
    );
}