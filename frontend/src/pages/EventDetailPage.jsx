import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, faCalendarAlt, faMapMarkerAlt, faUsers, faTicketAlt, 
  faTag, faFlagCheckered, faRoad, faCar, faStar, faCog, faLightbulb,
  faChevronLeft, faChevronRight, faArrowLeft, faClock, faIdCard,
  faCheckCircle, faTimesCircle, faInfoCircle, faSpinner, faExclamationCircle,
  faPencil, faTrash
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import UserContact from "../components/UserContact.jsx";
import TrackCard from "../components/TrackCard.jsx";
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import RegistrationModal from '../components/RegistrationModal';
import EventParticipants from '../components/EventParticipants';

// Reuse tag utility functions from EventCard
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

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  });
};

const EventDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId, isAuthenticated } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [isEventCreator, setIsEventCreator] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/events/${id}`);
                setEvent(response.data.event);
                setLikeCount(response.data.event.likes?.length || 0);
                
                if (userId && response.data.event.likes) {
                    setIsLiked(response.data.event.likes.some(likeId => likeId?.toString() === userId));
                }
                
                // Check if current user is the event creator
                if (userId && response.data.event.created_by?._id) {
                    setIsEventCreator(userId === response.data.event.created_by._id.toString());
                }
                
                if (response.data.event.registrationDate) {
                    const now = new Date();
                    const startDate = new Date(response.data.event.registrationDate.startDate);
                    const endDate = new Date(response.data.event.registrationDate.endDate);
                    setIsRegistrationOpen(now >= startDate && now <= endDate);
                }
                
                // Check if user is already registered
                if (userId) {
                    try {
                        const registrationResponse = await axiosInstance.get(`/event-registrations/user`);
                        const userRegistration = registrationResponse.data.registrations.find(
                            reg => reg.event._id === id
                        );
                        setIsRegistered(!!userRegistration);
                        if (userRegistration) {
                            setEvent(prev => ({
                                ...prev,
                                registrationStatus: userRegistration.status
                            }));
                        }
                    } catch (error) {
                        console.error('Error checking registration status:', error);
                    }
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching event:', err);
                setError(err.response?.data?.message || 'Failed to load event');
                setLoading(false);
                toast.error(t('common.error'));
            }
        };

        fetchEvent();
    }, [id, userId, t]);

    const handleLikeClick = async () => {
        if (!userId) {
            toast.error(t('auth.loginRequired'));
            return;
        }
        
        try {
            const endpoint = isLiked ? `/events/${id}/unlike` : `/events/${id}/like`;
            const response = await axiosInstance.post(endpoint);
            const updatedEvent = response.data.event;
            setIsLiked(!isLiked);
            setLikeCount(updatedEvent.likes.length);
        } catch (error) {
            console.error('Error updating like status:', error);
            toast.error(t('common.error'));
        }
    };

    const handleRegister = async (registrationInfo) => {
        if (!userId) {
            toast.error(t('auth.loginRequired'));
            return;
        }
        
        try {
            const response = await axiosInstance.post(`/event-registrations/register/${id}`, {
                registrationInfo: registrationInfo || null
            });
            
            if (response.data.success) {
                setIsRegistered(true);
                setShowRegistrationModal(false);
                toast.success(t('event.registrationSuccess'));
                
                // Update event's current participants count
                if (event && !event.unlimitedParticipants) {
                    setEvent(prev => ({
                        ...prev,
                        currentParticipants: prev.currentParticipants + 1
                    }));
                }
            }
        } catch (error) {
            console.error('Error during registration:', error);
            toast.error(error.response?.data?.message || t('common.error'));
        }
    };

    const handleImageNavigation = (direction) => {
        if (!event || !event.images || event.images.length <= 1) return;
        
        if (direction === 'prev') {
            setCurrentImageIndex(prev => (prev === 0 ? event.images.length - 1 : prev - 1));
        } else {
            setCurrentImageIndex(prev => (prev === event.images.length - 1 ? 0 : prev + 1));
        }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/events/${id}`);
            toast.success(t('event.deletedSuccessfully'));
            navigate('/events');
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error(error.response?.data?.message || t('common.error'));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainRed"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-4 flex flex-col items-center justify-center">
                <div className="text-mainRed text-6xl mb-4"><FontAwesomeIcon icon={faTimesCircle} /></div>
                <h1 className="text-2xl font-bold text-white mb-4">{t('common.error')}</h1>
                <p className="text-gray-400 mb-6">{error}</p>
                <Link to="/events" className="flex items-center text-mainYellow hover:text-yellow-300 transition-colors">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    {t('common.backToEvents')}
                </Link>
            </div>
        );
    }

    if (!event) return null;

    const eventStartDate = new Date(event.date?.startDate);
    const eventEndDate = new Date(event.date?.endDate);
    const registrationStartDate = new Date(event.registrationDate?.startDate);
    const registrationEndDate = new Date(event.registrationDate?.endDate);
    
    const now = new Date();
    const eventStatus = now > eventEndDate ? 'completed' : (now >= eventStartDate ? 'active' : 'upcoming');

    return (
        <div className="min-h-screen bg-mainBlue text-white p-4 sm:p-6 md:p-8">
            {/* Back navigation */}
            <div className="max-w-7xl mx-auto mb-6">
                <Link to="/events" className="flex items-center text-mainYellow hover:text-yellow-300 transition-colors">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    {t('common.backToEvents')}
                </Link>
            </div>
            
            <div className="max-w-7xl mx-auto">
                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column - Images and main info */}
                    <div className="lg:col-span-2">
                        {/* Hero section with image */}
                        <div className="relative group">
                            <div className="relative bg-gray-800 rounded-xl overflow-hidden mb-6 aspect-[16/9]">
                                {event.images && event.images.length > 0 ? (
                                    <>
                                        <img 
                                            src={event.images[currentImageIndex]?.data || '/placeholder-event.jpg'} 
                                            alt={event.name}
                                            className="w-full h-full object-cover"
                                        />
                                        
                                        {event.images.length > 1 && (
                                            <>
                                                <button 
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                                                    onClick={() => handleImageNavigation('prev')}
                                                    aria-label={t('common.previous')}
                                                >
                                                    <FontAwesomeIcon icon={faChevronLeft} />
                                                </button>
                                                <button
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                                                    onClick={() => handleImageNavigation('next')}
                                                    aria-label={t('common.next')}
                                                >
                                                    <FontAwesomeIcon icon={faChevronRight} />
                                                </button>
                                                
                                                {/* Image counter */}
                                                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                                                    {currentImageIndex + 1} / {event.images.length}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                        <p className="text-gray-400">{t('common.noImagesAvailable')}</p>
                                    </div>
                                )}
                                
                                {/* Event status badge */}
                                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                                    eventStatus === 'completed' ? 'bg-gray-800 text-gray-300' : 
                                    eventStatus === 'active' ? 'bg-green-600 text-white' : 
                                    'bg-mainYellow text-mainBlue'
                                }`}>
                                    {t(`event.status.${eventStatus}`)}
                                </div>
                            </div>
                        </div>
                        
                        {/* Event details */}
                        <div className="bg-accentBlue p-6 rounded-xl shadow-lg mb-8">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-3xl font-bold text-mainYellow">{event.name}</h1>
                                
                                <div className="flex items-center gap-2">
                                    {/* Like button */}
                                    {userId && userId !== event.created_by?._id && (
                                        <button
                                            onClick={handleLikeClick}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                                                isLiked ? 'bg-mainRed text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            } transition-colors`}
                                        >
                                            <FontAwesomeIcon icon={faHeart} />
                                            <span>{likeCount}</span>
                                        </button>
                                    )}
                                    
                                    {/* Edit and Delete buttons for event owner */}
                                    {userId === event.created_by?._id && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/events/edit/${id}`)}
                                                className="font-semibold text-mainYellow px-6 py-2 rounded-lg hover:text-mainRed transition-colors flex items-center"
                                            >
                                                <FontAwesomeIcon icon={faPencil} className="mr-2" />
                                                <span>{t('common.edit')}</span>
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmation(true)}
                                                className="font-semibold text-mainYellow px-6 py-2 rounded-lg hover:text-mainRed transition-colors flex items-center"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                                <span>{t('common.delete')}</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {event.tags && event.tags.map((tag, idx) => {
                                    const tagInfo = getTagInfoUniversal(tag, t);
                                    if (!tagInfo) return null;
                                    return (
                                        <span key={idx} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gray-800 text-white font-medium border border-gray-700">
                                            <FontAwesomeIcon icon={getTagIcon(tagInfo.category)} className="text-mainYellow" />
                                            <span>{tagInfo.label}</span>
                                        </span>
                                    );
                                })}
                            </div>
                            
                            {/* Description */}
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-3 text-white">{t('event.description')}</h2>
                                <p className="text-gray-300 whitespace-pre-line">{event.description}</p>
                            </div>
                        </div>
                        
                        {/* Tracks section */}
                        <div className="bg-accentBlue p-6 rounded-xl shadow-lg mb-8">
                            <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center">
                                <FontAwesomeIcon icon={faFlagCheckered} className="mr-2 text-mainYellow" />
                                {t('event.tracks')}
                            </h2>
                            
                            {event.tracks && event.tracks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {event.tracks.map((track, index) => (
                                        <TrackCard
                                            key={track._id || index}
                                            track={track}
                                            disableLink={false}
                                            className="compact-track-selection"
                                            isSelectionMode={true}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400">{t('event.noTracks')}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Right column - Registration and organizer info */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Registration card */}
                        <div className="bg-accentBlue p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center">
                                <FontAwesomeIcon icon={faTicketAlt} className="mr-2 text-mainYellow" />
                                {t('event.registration')}
                            </h2>
                            
                            {/* Registration status - only show if not registered and not showing registration button */}
                            {!isRegistered && !showRegistrationModal && (
                                <div className={`mb-6 p-3 rounded-lg ${
                                    isRegistrationOpen ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon 
                                            icon={isRegistrationOpen ? faCheckCircle : faTimesCircle} 
                                            className={isRegistrationOpen ? 'text-green-500' : 'text-red-500'} 
                                        />
                                        <p className="font-medium text-white">
                                            {isRegistrationOpen ? t('event.registrationOpen') : t('event.registrationClosed')}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {isRegistrationOpen 
                                            ? t('event.registrationCloses', { date: formatDate(registrationEndDate) })
                                            : (now < registrationStartDate 
                                                ? t('event.registrationOpens', { date: formatDate(registrationStartDate) })
                                                : t('event.registrationEnded'))
                                        }
                                    </p>
                                </div>
                            )}
                            
                            {/* Registration button or status */}
                            {isRegistrationOpen && (
                                <div className="mt-4">
                                    {isRegistered ? (
                                        <div className={`p-3 rounded-lg ${
                                            event.requireManualApproval 
                                                ? (event.registrationStatus === 'pending' 
                                                    ? 'bg-yellow-900/30 border border-yellow-700'
                                                    : event.registrationStatus === 'rejected'
                                                    ? 'bg-red-900/30 border border-red-700'
                                                    : 'bg-green-900/30 border border-green-700')
                                                : 'bg-green-900/30 border border-green-700'
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon 
                                                    icon={event.requireManualApproval 
                                                        ? (event.registrationStatus === 'pending' 
                                                            ? faClock
                                                            : event.registrationStatus === 'rejected'
                                                            ? faTimesCircle
                                                            : faCheckCircle)
                                                        : faCheckCircle} 
                                                    className={event.requireManualApproval 
                                                        ? (event.registrationStatus === 'pending' 
                                                            ? 'text-yellow-500'
                                                            : event.registrationStatus === 'rejected'
                                                            ? 'text-red-500'
                                                            : 'text-green-500')
                                                        : 'text-green-500'} 
                                                />
                                                <p className="font-medium text-white">
                                                    {event.requireManualApproval 
                                                        ? (event.registrationStatus === 'pending' 
                                                            ? t('event.registrationPending')
                                                            : event.registrationStatus === 'rejected'
                                                            ? t('event.registrationRejected')
                                                            : t('event.registrationConfirmed'))
                                                        : t('event.registrationConfirmed')}
                                                </p>
                                            </div>
                                            {event.requireManualApproval && event.registrationStatus === 'rejected' && (
                                                <p className="text-sm text-gray-300 mt-1">
                                                    {t('event.registrationRejectedMessage')}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowRegistrationModal(true)}
                                            disabled={!userId || event.currentParticipants >= event.maxParticipants || isEventCreator}
                                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                                !userId || event.currentParticipants >= event.maxParticipants || isEventCreator
                                                    ? 'bg-gray-700 cursor-not-allowed opacity-60'
                                                    : 'bg-mainRed hover:bg-red-700'
                                            } text-white`}
                                        >
                                            {!userId
                                                ? t('event.loginToRegister')
                                                : isEventCreator
                                                ? t('event.cannotRegisterAsCreator')
                                                : event.currentParticipants >= event.maxParticipants
                                                ? t('event.registrationFull')
                                                : t('event.register')}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* PDF tickets info */}
                            {event.generatePdfTickets && (
                                <div className="flex items-center gap-2 mt-4 text-gray-300">
                                    <FontAwesomeIcon icon={faTicketAlt} className="text-mainYellow" />
                                    <span>{t('event.pdfTicketsProvided')}</span>
                                </div>
                            )}
                        </div>

                        {/* Participants section */}
                        <EventParticipants eventId={id} />

                        {/* Dates section */}
                        <div className="bg-accentBlue p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-mainYellow" />
                                {t('event.dates')}
                            </h2>
                            
                            <div className="space-y-4">
                                {/* Event dates */}
                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faFlagCheckered} className="text-mainYellow" />
                                        {t('event.schedule')}
                                    </h3>
                                    <p className="text-white">
                                        {formatDate(event.date?.startDate)} - {formatDate(event.date?.endDate)}
                                    </p>
                                </div>
                                
                                {/* Registration dates */}
                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faTicketAlt} className="text-mainYellow" />
                                        {t('event.registrationPeriod')}
                                    </h3>
                                    <p className="text-white">
                                        {formatDate(event.registrationDate?.startDate)} - {formatDate(event.registrationDate?.endDate)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Organizer information */}
                        <div className="bg-accentBlue rounded-xl shadow-lg">
                            <UserContact created_by={event.created_by} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <DeleteConfirmationModal 
                    onCancel={() => setDeleteConfirmation(false)}
                    onConfirm={handleDelete}
                    title={t('event.deleteEvent')}
                    message={t('event.confirmDelete')}
                    confirmText={t('event.confirmDelete')}
                    cancelText={t('common.cancel')}
                />
            )}

            {/* Registration Modal */}
            <RegistrationModal
                isOpen={showRegistrationModal}
                onClose={() => setShowRegistrationModal(false)}
                onRegister={handleRegister}
                registrationInstructions={event.registrationInstructions}
                requireManualApproval={event.requireManualApproval}
                eventStatus={eventStatus}
            />
        </div>
    );
};

export default EventDetailPage;
