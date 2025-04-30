import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImagePortrait } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const TrackRequest = ({ request, className = "", onStatusUpdate, showActions = false, action, isSentByCurrentUser }) => {
  const { t } = useTranslation();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'accepted':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
<div className={`flex items-start gap-4 p-4 border rounded-lg border-accentGray hover:bg-gray-800 transition-colors ${className}`}>
  {/* Profile Image */}
  <div className="flex-shrink-0">
    {request.sender?.profile_image?.data ? (
      <img
        src={request.sender.profile_image.data}
        alt={request.sender.username}
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
        <span className="font-medium text-mainYellow">{request.sender?.username}</span>
      )}
      <span>{action}</span>
      <span className="font-medium text-mainYellow">{request.track?.name}</span>
    </div>

    {request.content && (
      <p className="text-sm text-gray-400 mt-2 break-words whitespace-pre-wrap">{request.content}</p>
    )}

    <div className="flex items-center justify-between mt-3">
      <span className={`text-sm font-medium ${getStatusColor(request.status)}`}>
        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
      </span>
      {showActions && request.status === 'pending' && (
        <div className="flex gap-2">
          <button 
            className="px-4 py-1.5 text-sm font-medium bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-md transition-colors" 
            onClick={() => onStatusUpdate(request._id, 'accepted')}
          >
            Accept
          </button>
          <button 
            className="px-4 py-1.5 text-sm font-medium bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-md transition-colors" 
            onClick={() => onStatusUpdate(request._id, 'rejected')}
          >
            Decline
          </button>
        </div>
      )}
    </div>
  </div>
</div>

  );
};

export default TrackRequest; 