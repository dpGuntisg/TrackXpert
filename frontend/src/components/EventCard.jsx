import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCalendar, faTag, faFlagCheckered, faRoad, faCar, faStar, faCog, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

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
    const firstImage = event.images?.[0]?.data;
    const dateRange = formatDateRange(event.date?.startDate, event.date?.endDate);
    // Track names (populated)
    const trackNames = event.tracks && Array.isArray(event.tracks) && event.tracks.length > 0
        ? event.tracks.map(track => track?.name).filter(Boolean).join(', ')
        : null;

    useEffect(() => {
        if (event && Array.isArray(event.likes) && userId) {
            setIsLiked(event.likes.some(likeId => likeId?.toString() === userId));
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
            if (isLiked) {
                toast.warning('You unliked this event!');
            } else {
                toast.success('You liked this event!');
            }
        } catch (error) {
            console.error('Error updating like status:', error);
        }
    };

    const cardBase = 'h-[320px] w-full bg-accentBlue rounded-xl shadow-lg overflow-hidden relative flex flex-col drop-shadow-lg outline outline-12 outline-mainRed hover:outline-mainYellow hover:scale-105 transition-all ease-in-out duration-300';

    return (
        <div className={cardBase + ' group'}>
            {/* Image */}
            {firstImage && (
                <img src={firstImage} alt={event.name} className="h-1/2 w-full object-cover" loading="lazy" />
            )}
            {/* Date badge */}
            <div className="absolute top-3 left-3 bg-mainYellow text-mainBlue rounded px-3 py-1 text-base font-bold shadow">
                {dateRange}
            </div>
            {/* Like button */}
            {userId && userId !== event.created_by?._id && (
                <button
                    onClick={handleLikeClick}
                    className={`absolute top-3 right-3 text-2xl z-10 ${isLiked ? 'text-mainRed' : 'text-gray-400'} hover:text-mainRed transition-colors duration-200`}
                >
                    <FontAwesomeIcon icon={faHeart} />
                    <span className="ml-1 text-base align-middle">{likeCount}</span>
                </button>
            )}
            {/* Content */}
            <div className="flex flex-col flex-grow p-5">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{event.name}</h3>
                {trackNames && (
                    <div className="text-sm text-gray-300 mb-2 line-clamp-1">
                        <span className="font-semibold text-mainYellow">{t('event.tracks')}: </span>{trackNames}
                    </div>
                )}
                <div className="flex flex-wrap gap-2 mb-2">
                    {event.tags && event.tags.length > 0 && event.tags.map((tag, idx) => {
                        const tagInfo = getTagInfoUniversal(tag, t);
                        if (!tagInfo) return null;
                        return (
                            <span key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-gray-800 text-white font-medium border border-gray-700">
                                <FontAwesomeIcon icon={getTagIcon(tagInfo.category)} className="text-mainYellow" />
                                <span>{tagInfo.label}</span>
                            </span>
                        );
                    })}
                </div>
                <div className="text-xs text-gray-400 line-clamp-2">
                    {event.description}
                </div>
            </div>
            {/* Link overlay */}
            <Link to={`/events/${event._id}`} className="absolute inset-0 z-0" tabIndex={-1} aria-label={event.name}></Link>
        </div>
    );
};

export default EventCard;