import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, faCalendarAlt, faTicketAlt, faFlagCheckered,
  faChevronLeft, faChevronRight, faArrowLeft, faClock,
  faCheckCircle, faTimesCircle, faPencil, faTrash, faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import UserContact from "../components/UserContact.jsx";
import TrackCard from "../components/TrackCard.jsx";
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import RegistrationModal from '../components/RegistrationModal';
import EventParticipants from '../components/EventParticipants';
import ReportForm from "../components/ReportForm.jsx";
import { getTagIcon, getTagInfoUniversal } from '../utils/tagUtils.js';


//Format a date string to a localized format
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  });
};

// MAIN COMPONENT
const EventDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, role } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null); // Add separate state for registration status
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isEventCreator, setIsEventCreator] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false); // Add loading state for registration

  // Fetch event data
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
        
        // Check if registration is currently open
        if (response.data.event.registrationDate) {
          const now = new Date();
          const startDate = new Date(response.data.event.registrationDate.startDate);
          const endDate = new Date(response.data.event.registrationDate.endDate);
          // Set end date to end of day (23:59:59) to include the full end date
          endDate.setHours(23, 59, 59, 999);
          setIsRegistrationOpen(now >= startDate && now <= endDate);
        }
        
        // Check if user is already registered
        if (userId) {
          await checkRegistrationStatus();
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event:', err);
        if (err.response?.status === 404 || err.response?.data?.message?.includes('Cast to ObjectId failed')) {
          navigate('/404');
        } else {
          setError(err.response?.data?.message || 'Failed to load event');
          toast.error(t('common.error'));
        }
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, userId, t, navigate]);

  const checkRegistrationStatus = async () => {
    if (!userId) {
      setIsRegistered(false);
      setRegistrationStatus(null);
      return;
    }

    try {
      // First check if user is in approvedParticipants
      const isApproved = event?.approvedParticipants?.some(
        participant => participant.user._id === userId || participant.user === userId
      );

      if (isApproved) {
        setIsRegistered(true);
        setRegistrationStatus('approved');
        return;
      }

      // If not approved, check registration status
      const registrationResponse = await axiosInstance.get(`/event-registrations/user`);
      const userRegistration = registrationResponse.data.registrations.find(
        reg => reg.event._id === id
      );
      
      if (userRegistration) {
        setIsRegistered(true);
        setRegistrationStatus(userRegistration.status);
      } else {
        setIsRegistered(false);
        setRegistrationStatus(null);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
      setIsRegistered(false);
      setRegistrationStatus(null);
    }
  };

  // Update canRegister function to also check approvedParticipants
  const canRegister = () => {
    if (!userId || isEventCreator) return false;
    if (!isRegistrationOpen) return false;
    if (!event.unlimitedParticipants && event.currentParticipants >= event.maxParticipants) return false;
    
    // Check if user is already approved
    const isApproved = event?.approvedParticipants?.some(
      participant => participant.user._id === userId || participant.user === userId
    );
    if (isApproved) return false;

    return true;
  };

  // Add effect to check registration status when event data changes
  useEffect(() => {
    if (event && userId) {
      checkRegistrationStatus();
    }
  }, [event, userId]);

  // Handles like/unlike button click
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

  //Handles event registration submission
  const handleRegister = async (registrationInfo) => {
    if (!userId) {
      toast.error(t('auth.loginRequired'));
      return;
    }
    
    try {
      setRegistrationLoading(true);
      
      await axiosInstance.post(`/event-registrations/register/${id}`, {
        registrationInfo: registrationInfo || null
      });
      
      setShowRegistrationModal(false);
      
      // Update registration state
      setIsRegistered(true);
      
      // Check if the event requires manual approval to determine the status
      if (event.requireManualApproval) {
        setRegistrationStatus('pending');
        toast.success(t('event.registrationSubmitted')); // 
      } else {
        setRegistrationStatus('approved');
        toast.success(t('event.registrationSuccess'));
      }
      
      // Refetch event data to get updated participant count
      const response = await axiosInstance.get(`/events/${id}`);
      setEvent(prev => ({
        ...prev,
        ...response.data.event
      }));
      
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error(error.response?.data?.message || t('common.error'));
      // Reset registration state on error
      setIsRegistered(false);
      setRegistrationStatus(null);
    } finally {
      setRegistrationLoading(false);
    }
  };


   //Handle image carousel navigation

  const handleImageNavigation = (direction) => {
    if (!event || !event.images || event.images.length <= 1) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => (prev === 0 ? event.images.length - 1 : prev - 1));
    } else {
      setCurrentImageIndex(prev => (prev === event.images.length - 1 ? 0 : prev + 1));
    }
  };

   //Handles event deletion
  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/events/${id}`);
      toast.success(t('event.deletedSuccess'));
      navigate('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  //Handles ticket download
  const handleTicketDownload = async () => {
    try {
      const response = await axiosInstance.get(`/tickets/event-ticket/${id}`, {
        responseType: 'blob',
      });
      
      // Create a URL for the blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor and click it
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Event_Ticket_${id}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
    }
  };

    // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-mainBlue">
        <div className="flex flex-col items-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-mainRed h-12 w-12 mb-4"></div>
          <p className="text-lg">{t('event.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && error !== "No token provided" && error !== "Invalid or expired token") {
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

  // If event is null after loading and no error, render nothing
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
                  <div className="relative w-full h-full">
                    <img 
                      src={event.images[currentImageIndex]?.data || '/placeholder-event.jpg'} 
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Navigation Buttons */}
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

                        {/* Pagination Dots */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {event.images.map((_, idx) => (
                            <button 
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full ${currentImageIndex === idx ? 'bg-mainYellow' : 'bg-white/50'}`}
                              aria-label={t('events.goToImage', { number: idx + 1 })}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
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

                {/* Report button */}
                {( userId && userId !== event.created_by?._id) &&(
                    <div className="absolute bottom-6 right-6">
                        <ReportForm targetType="Event" targetId={event._id}
                            triggerComponent={
                                <button className="flex items-center gap-2 bg-red-900/80 border border-red-700 text-red-400  px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-mainRed" />
                                    {t("report.title")}
                                </button>
                            }
                        />
                    </div>
                )}
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
                  {(userId === event.created_by?._id || role === "admin") && (
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
                        ? (registrationStatus === 'pending' 
                          ? 'bg-yellow-900/30 border border-yellow-700'
                          : registrationStatus === 'rejected'
                          ? 'bg-red-900/30 border border-red-700'
                          : 'bg-green-900/30 border border-green-700')
                        : 'bg-green-900/30 border border-green-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon 
                          icon={event.requireManualApproval 
                            ? (registrationStatus === 'pending' 
                              ? faClock
                              : registrationStatus === 'rejected'
                              ? faTimesCircle
                              : faCheckCircle)
                            : faCheckCircle} 
                          className={event.requireManualApproval 
                            ? (registrationStatus === 'pending' 
                              ? 'text-yellow-500'
                              : registrationStatus === 'rejected'
                              ? 'text-red-500'
                              : 'text-green-500')
                            : 'text-green-500'} 
                        />
                        <p className="font-medium text-white">
                          {event.requireManualApproval 
                            ? (registrationStatus === 'pending' 
                              ? t('event.registrationPending')
                              : registrationStatus === 'rejected'
                              ? t('event.registrationRejected')
                              : t('event.registrationConfirmed'))
                            : t('event.registrationConfirmed')}
                        </p>
                      </div>
                      {event.requireManualApproval && registrationStatus === 'rejected' && (
                        <p className="text-sm text-gray-300 mt-1">
                          {t('event.registrationRejectedMessage')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRegistrationModal(true)}
                      disabled={registrationLoading || !canRegister()}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        registrationLoading || !canRegister()
                          ? 'bg-gray-700 cursor-not-allowed opacity-60'
                          : 'bg-mainRed hover:bg-red-700'
                      } text-white`}
                    >
                      {registrationLoading
                        ? t('common.loading')
                        : !userId
                        ? t('event.loginToRegister')
                        : isEventCreator
                        ? t('event.cannotRegisterAsCreator')
                        : !event.unlimitedParticipants && event.currentParticipants >= event.maxParticipants
                        ? t('event.registrationFull')
                        : t('event.register')}
                    </button>
                  )}
                  {isRegistered && registrationStatus === 'approved' && (
                    <button 
                      onClick={handleTicketDownload} 
                      className="w-full py-3 px-4 rounded-lg mt-4 font-medium transition-colors bg-mainRed hover:bg-red-700"
                    >
                      <FontAwesomeIcon icon={faTicketAlt} className="mr-2" />
                      {t('event.downloadTicket')}
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
      <DeleteConfirmationModal 
        isOpen={deleteConfirmation}
        onCancel={() => setDeleteConfirmation(false)}
        onConfirm={handleDelete}
        title={t('event.deleteEvent')}
        message={t('event.confirmDelete')}
        confirmText={t('event.confirmDelete')}
        cancelText={t('common.cancel')}
      />

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