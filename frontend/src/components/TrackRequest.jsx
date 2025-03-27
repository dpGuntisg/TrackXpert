import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImagePortrait } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const TrackRequest = ({ request, className = "" }) => {
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
    <div className={`flex items-start gap-3 p-3 border rounded-sm border-accentGray hover:bg-gray-800 transition-colors ${className}`}>
      {/* Profile Image */}
      <div className="flex-shrink-0">
        {request.sender?.profile_image?.data ? (
          <img
            src={request.sender.profile_image.data}
            alt={request.sender.username}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <FontAwesomeIcon icon={faImagePortrait} className="text-gray-500" />
          </div>
        )}
      </div>

      {/* Request Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300">
          <span className="font-medium text-mainYellow">{request.sender?.username}</span>
          {' '}wants to join your track{' '}
          <span className="font-medium text-mainYellow">{request.track?.name}</span>
        </p>
        {request.content && (
          <p className="text-xs text-gray-400 mt-1">{request.content}</p>
        )}
        <span className={`text-xs ${getStatusColor(request.status)} mt-1 block`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>
    </div>
  );
};

export default TrackRequest; 