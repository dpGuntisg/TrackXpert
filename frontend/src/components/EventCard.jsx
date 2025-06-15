import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCalendar, faTag, faFlagCheckered,faRoad, faCar, faStar, faCog, faLightbulb,} from '@fortawesome/free-solid-svg-icons';

const getTagIcon = (category) => {
    switch (category) {
        case 'trackType':
        case 'eventType':
            return faFlagCheckered;
        case 'surfaceType':
            return faRoad;
        case 'vehicleType':
        case 'vehicleRequirements':
            return faCar;
        case 'difficulty':
            return faStar;
        case 'specialFeatures':
            return faLightbulb;
        case 'eventFormat':
            return faCog;
        default:
            return faTag;
    }
};

const getTagInfoUniversal = (tag, t) => {
    // Try event categories first
    const eventCategories = ['eventType', 'difficulty', 'vehicleRequirements', 'specialFeatures', 'eventFormat'];
    for (const category of eventCategories) {
        const label = t(`tags.event.${category}.${tag}`);
        if (label && label !== `tags.event.${category}.${tag}`) {
            return {
                category,
                label,
                type: 'event'
            };
        }
    }
    // Try track categories
    const trackCategories = ['trackType', 'difficulty', 'surfaceType', 'vehicleType', 'specialFeatures'];
    for (const category of trackCategories) {
        const label = t(`tags.track.${category}.${tag}`);
        if (label && label !== `tags.track.${category}.${tag}`) {
            return {
                category,
                label,
                type: 'track'
            };
        }
    }
    return null;
};

const formatDateRange = (start, end) => {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;
    const startStr = `${startDate.getDate().toString().padStart(2, '0')} ${startDate.toLocaleString('en-US', { month: 'short' })}`;
    if (endDate) {
        const endStr = `${endDate.getDate().toString().padStart(2, '0')} ${endDate.toLocaleString('en-US', { month: 'short' })}`;
        return `${startStr} - ${endStr}`;
    }
    return startStr;
};

const EventCard = ({ event }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userId } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(event.likes?.length || 0);
    const firstImage = event.thumbnailImage?.data;
    const dateRange = formatDateRange(event.date?.startDate, event.date?.endDate);
    
    // Track names (populated)
    const trackNames = event.tracks && Array.isArray(event.tracks) && event.tracks.length > 0
        ? event.tracks.map(track => track?.name).filter(Boolean).join(', ')
        : null;

    useEffect(() => {
        if (event && Array.isArray(event.likes) && userId) {
            setIsLiked(event.likes.some(likeId => likeId?.toString() === userId.toString()));
        }
    }, [event, userId]);

    const handleLikeClick = async (e) => {
        e.preventDefault();
        if (!userId) {
            navigate('/signin');
            return;
        }
        try {
            const endpoint = isLiked
                ? `/events/${event._id}/unlike`
                : `/events/${event._id}/like`;
            const response = await axiosInstance.post(endpoint);
            const updatedEvent = response.data.event;
            setIsLiked(!isLiked);
            setLikeCount(updatedEvent.likes.length);
        } catch (error) {
            console.error('Error updating like status:', error);
        }
    };

    // Get the primary tag (for header background color)
    const primaryTag = event.tags && event.tags.length > 0 
        ? getTagInfoUniversal(event.tags[0], t) 
        : null;

    // Filter tags to show only the most important ones
    const limitedTags = event.tags ? event.tags.slice(0, 3) : [];
    const hasMoreTags = event.tags && event.tags.length > 3;

    return (
        <div className="group relative h-full w-full overflow-hidden rounded-xl bg-accentBlue shadow-xl border-2 border-transparent transition-all duration-300 transform-gpu hover:shadow-2xl hover:border-mainYellow will-change-transform flex flex-col">            
            {/* Image Section*/}
            <div className="relative h-64 w-full overflow-hidden sm:h-72">
                {firstImage ? (
                    <div className="h-full w-full overflow-hidden">
                        <img 
                            src={firstImage} 
                            alt={event.name} 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-110" 
                            loading="lazy" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-accentBlue to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-20"></div>
                    </div>
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-mainBlue">
                        <FontAwesomeIcon icon={faFlagCheckered} className="text-6xl text-gray-600 transition-colors duration-300 group-hover:text-mainYellow" />
                    </div>
                )}
                
                {/* Date badge */}
                <div className="absolute left-0 top-6 bg-mainYellow px-4 py-2 font-bold text-mainBlue shadow-lg transform transition-transform duration-300 group-hover:translate-x-2">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar} />
                        <span>{dateRange}</span>
                    </div>
                </div>
            </div>
            
            {/* Content Section*/}
            <div className="flex flex-col flex-grow p-5 pb-16 relative">
                {/* Title */}
                <h3 className="text-2xl font-bold text-white transition-colors duration-300 group-hover:text-mainYellow">{event.name}</h3>
                
                {/* Track info if available */}
                {trackNames && (
                    <div className="flex items-center gap-2 text-gray-300 mt-3">
                        <FontAwesomeIcon icon={faRoad} className="text-mainYellow" />
                        <span className="line-clamp-1">{trackNames}</span>
                    </div>
                )}
                
                {/* Tags*/}
                {limitedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {limitedTags.map((tag, idx) => {
                            const tagInfo = getTagInfoUniversal(tag, t);
                            if (!tagInfo) return null;
                            return (
                                <span 
                                    key={idx} 
                                    className="flex items-center gap-1.5 rounded-full bg-gray-800 px-3 py-1.5 text-sm font-medium text-white transition-transform duration-200 hover:scale-105 hover:text-mainRed"
                                >
                                    <FontAwesomeIcon icon={getTagIcon(tagInfo.category)} className="text-mainYellow" />
                                    <span>{tagInfo.label}</span>
                                </span>
                            );
                        })}
                        {hasMoreTags && (
                            <span className="flex items-center rounded-full bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-400">
                                +{event.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
                
                {/* Description*/}
                <div className="line-clamp-2 text-sm text-gray-300 transition-colors duration-300 mt-3">
                    {event.description}
                </div>
                
                {/* Footer - buttons */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-5">
                    {/* Like button */}
                    {userId && userId !== event.created_by?._id ? (
                        <button
                            onClick={handleLikeClick}
                            className={`text-2xl ${
                                isLiked ? 'text-mainRed' : 'text-gray-400'
                            } hover:text-mainRed transition-colors duration-200 z-10`}
                            aria-label={isLiked ? t('event.unlike') : t('event.like')}
                        >
                            <FontAwesomeIcon icon={faHeart} />
                        </button>
                    ) : (
                        <span></span> // Empty span to maintain spacing when no like button
                    )}
                    
                    {/* View Details button */}
                    <span className="rounded-lg bg-mainRed px-4 py-2 text-sm font-medium text-white transition-all duration-300 group-hover:bg-mainYellow group-hover:text-mainBlue group-hover:shadow-md">
                        {t('common.viewDetails')}
                    </span>
                </div>
            </div>
            
            {/* Link overlay for the entire card */}
            <Link 
                to={`/events/${event._id}`} 
                className="absolute inset-0 z-0" 
                tabIndex={-1} 
                aria-label={event.name}
            ></Link>
        </div>
    );
};

export default EventCard;