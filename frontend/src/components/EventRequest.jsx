import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImagePortrait, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const EventRequest = ({ request, className = "", onStatusUpdate, showActions = false, isSentByCurrentUser, selectionMode = false, selected = false, onSelect }) => {
  const { t } = useTranslation();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const borderClasses = selectionMode 
    ? selected 
        ? 'border border-mainRed' 
        : 'border border-mainYellow'
    : 'border border-gray-700';

  return (
    <div 
      className={`flex items-start gap-4 p-4 ${borderClasses} rounded-lg hover:bg-gray-800 transition-colors ${className} ${selectionMode ? 'cursor-pointer' : ''}`}
      onClick={selectionMode ? () => onSelect(request._id) : undefined}
    >
      {selectionMode && selected && (
        <div className="absolute top-23 left-5 bg-mainRed rounded-full p-2 z-10">
          <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
        </div>
      )}

      {/* Profile Image */}
      <div className="flex-shrink-0">
        {request.user?.profile_image?.data ? (
          <img
            src={request.user.profile_image.data}
            alt={request.user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
            <FontAwesomeIcon icon={faImagePortrait} className="text-gray-500 text-xl" />
          </div>
        )}
      </div>

      {/* Request Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
          {isSentByCurrentUser ? (
            <span className="text-gray-300">
              <span className="text-mainYellow">{t('common.you')}</span> {t('notifications.HaveSent')}
            </span>
          ) : (
            <span className="font-medium text-mainYellow">{request.user?.username}</span>
          )}
          <span>{isSentByCurrentUser ? t('notifications.requestToRegister') : t('notifications.wantsToRegister')}</span>
          <span className="font-medium text-mainYellow">{request.event?.name}</span>
        </div>

        {request.registrationInfo && (
          <p className="text-sm text-gray-400 mt-2 break-words whitespace-pre-wrap">{request.registrationInfo}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className={`text-sm font-medium ${getStatusColor(request.status)}`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
          {showActions && request.status === 'pending' && !selectionMode && (
            <div className="flex gap-2">
              <button 
                className="px-4 py-1.5 text-sm font-medium bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-md transition-colors" 
                onClick={() => onStatusUpdate(request._id, 'approved')}
              >
                {t('common.accept')}
              </button>
              <button 
                className="px-4 py-1.5 text-sm font-medium bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-md transition-colors" 
                onClick={() => onStatusUpdate(request._id, 'rejected')}
              >
                {t('common.decline')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRequest; 