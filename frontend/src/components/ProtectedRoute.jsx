import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ children }) => {
  const { userId, loading, isBanned, banReason, bannedUntil } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainRed"></div>
      </div>
    );
  }

  if (isBanned) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg w-full">
          <h2 className="text-xl font-bold mb-2">{t('auth.banned')}</h2>
          <p className="mb-2">{t('auth.banReason')}: {banReason}</p>
          {bannedUntil && (
            <p>{t('auth.bannedUntil')}: {new Date(bannedUntil).toLocaleString()}</p>
          )}
        </div>
      </div>
    );
  }

  if (!userId) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute; 