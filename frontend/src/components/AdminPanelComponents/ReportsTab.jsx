import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTriangleExclamation, 
  faImagePortrait,
  faRoute,
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle 
} from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ReportsTab = ({ reports, loading, error, onReportUpdate }) => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [expandedReports, setExpandedReports] = useState({});
  const { user } = useAuth();

  
  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await axiosInstance.patch(`/reports/${reportId}/status`, { 
        status: newStatus
      });
      toast.success(t('report.statusUpdated'));
      if (onReportUpdate) {
        onReportUpdate();
      }
    } catch (error) {
      toast.error(t('report.statusUpdateError'));
    }
  };

  const toggleReportExpansion = (reportId) => {
    setExpandedReports(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  const getTargetTypeIcon = (type) => {
    switch (type) {
      case 'Track': return faRoute;
      case 'Event': return faCalendarAlt;
      default: return faTriangleExclamation;
    }
  };

  const filteredReports = reports.filter(report => 
    report.status === statusFilter
  );

  return (
    <div className="bg-accentBlue p-6 rounded-xl shadow-lg text-white space-y-4">
      <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center">
        <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2 text-mainYellow" />
        {t('admin.reports')}
      </h2>
      
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1 text-sm rounded-full border ${
            statusFilter === 'pending'
              ? 'bg-mainYellow text-mainBlue border-mainYellow'
              : 'border-accentGray text-gray-300 hover:bg-mainBlue/20'
          }`}
        >
          {t('admin.pendingReports')}
        </button>
        <button 
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1 text-sm rounded-full border ${
            statusFilter === 'resolved'
              ? 'bg-mainYellow text-mainBlue border-mainYellow'
              : 'border-accentGray text-gray-300 hover:bg-mainBlue/20'
          }`}
        >
          {t('admin.resolvedReports')}
        </button>
        <button 
          onClick={() => setStatusFilter('dismissed')}
          className={`px-3 py-1 text-sm rounded-full border ${
            statusFilter === 'dismissed'
              ? 'bg-mainYellow text-mainBlue border-mainYellow'
              : 'border-accentGray text-gray-300 hover:bg-mainBlue/20'
          }`}
        >
          {t('admin.dismissedReports')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainYellow"></div>
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report._id} className="flex items-start gap-4 p-4 border rounded-lg border-accentGray hover:bg-mainBlue/30 transition-colors">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {report.reportedBy?.profile_image?.data ? (
                  <img
                    src={report.reportedBy.profile_image.data}
                    alt={report.reportedBy.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                    <FontAwesomeIcon icon={faImagePortrait} className="text-gray-500 text-xl" />
                  </div>
                )}
              </div>
              
              {/* Report Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
                  <span className="font-medium text-mainYellow">{report.reportedBy?.username}</span>
                  <span>{t('report.reported')}</span>
                  <span className="font-medium text-white flex items-center">
                    <FontAwesomeIcon icon={getTargetTypeIcon(report.targetType)} className="mr-1 text-mainYellow" />
                    {report.targetType}
                    {report.targetType === 'Track' && (
                      <Link 
                        to={`/tracks/${report.targetId}`}
                        className="ml-2 text-mainYellow hover:text-yellow-400 underline"
                      >
                        #{report.targetId}
                      </Link>
                    )}
                    {report.targetType === 'Event' && (
                      <Link 
                        to={`/events/${report.targetId}`}
                        className="ml-2 text-mainYellow hover:text-yellow-400 underline"
                      >
                        #{report.targetId}
                      </Link>
                    )}
                  </span>
                </div>
                
                <div className="mt-2">
                  <button 
                    onClick={() => toggleReportExpansion(report._id)} 
                    className="text-sm text-mainYellow hover:text-yellow-400 underline flex items-center"
                  >
                    {expandedReports[report._id] ? t('report.hideReason') : t('report.showReason')}
                  </button>
                  
                  {expandedReports[report._id] && (
                    <p className="text-sm text-gray-400 mt-2 p-3 bg-mainBlue/30 rounded border border-accentGray break-words whitespace-pre-wrap">
                      {report.reason}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-400">
                    {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm')}
                  </span>
                  
                  {report.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-1.5 text-sm font-medium bg-green-900/30 border border-green-700 text-green-400 hover:bg-green-900/50 rounded-md transition-colors"
                        onClick={() => handleStatusUpdate(report._id, 'resolved')}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> {t('report.resolve')}
                      </button>
                      <button
                        className="px-4 py-1.5 text-sm font-medium bg-red-900/30 border border-red-700 text-red-400 hover:bg-red-900/50 rounded-md transition-colors"
                        onClick={() => handleStatusUpdate(report._id, 'dismissed')}
                      >
                        <FontAwesomeIcon icon={faTimesCircle} className="mr-1" /> {t('report.dismiss')}
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2 py-1 rounded text-sm ${
                      report.status === 'resolved' 
                        ? "bg-green-900/30 border border-green-700 text-green-400" 
                        : "bg-red-900/30 border border-red-700 text-red-400"
                    }`}>
                      {report.status === 'resolved' ? t('report.resolved') : t('report.dismissed')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-accentGray rounded-lg">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-mainYellow text-4xl mb-4" />
          <p className="text-lg text-gray-300">
            {statusFilter === 'pending' 
              ? t('report.noPendingReports')
              : t('report.noFilteredReports')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;