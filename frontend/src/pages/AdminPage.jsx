import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faSquarePollVertical } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';

const AdminPage = () => {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [action, setAction] = useState('');
    const [userId, setUserId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('statistics');

    const { t } = useTranslation();

    // Fetch logs
    const fetchLogs = useCallback(async (currentPage = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                sortOrder: sortOrder
            });
    
            if (action) params.append('action', action);
            if (userId) params.append('userId', userId);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
    
            const response = await axiosInstance.get(`/admin/logs?${params.toString()}`);
            setLogs(response.data.logs);
            setPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching Logs');
        } finally {
            setLoading(false);
        }
    }, [action, userId, startDate, endDate, sortOrder, limit, page]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const renderTab = () => {
        switch(tab){
            case 'statistics':
                return(
                    <div className="bg-accentBlue p-6 rounded-xl shadow-lg">

                    </div>
                );
            case 'logs':
                return(
                    <div className="overflow-x-auto bg-accentBlue p-6 rounded-xl shadow-lg">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainYellow"></div>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className='text-center py-16'>
                                <p className="text-2xl mb-4">{t('admin.noLogs')}</p>
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="grid grid-cols-4 gap-4 bg-accentBlue rounded-t-lg p-4 border-b border-accentGray font-semibold text-mainYellow">
                                    <div>{t('common.user')}</div>
                                    <div>{t('admin.action')}</div>
                                    <div>{t('admin.details')}</div>
                                    <div>{t('admin.date')}</div>
                                </div>
                                
                                {/* Table Body */}
                                <div className="divide-y divide-accentGray">
                                    {logs.map((log) => (
                                        <div key={log._id} className="grid grid-cols-4 gap-4 p-4 hover:bg-mainBlue/20 transition duration-150">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{log.userId?.username}</span>
                                                <span className="text-xs text-gray-400">({log.userId?._id})</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="py-1 px-2 bg-mainBlue/30 text-mainYellow rounded text-sm">
                                                    {log.action}
                                                </span>
                                            </div>
                                            <div>
                                                {log.metadata && (
                                                    <div className="text-sm text-gray-300 max-h-24 overflow-y-auto">
                                                        {Object.entries(log.metadata).map(([key, value]) => (
                                                            <div key={key} className="mb-1">
                                                                <span className="text-mainYellow">{key}:</span>{" "}
                                                                <span className="text-gray-400">
                                                                    {typeof value === "object" ? JSON.stringify(value) : value.toString()}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Pagination */}
                                <div className="flex justify-between items-center mt-6 px-2">
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => fetchLogs(page - 1)} 
                                            disabled={page === 1}
                                            className={`px-3 py-1 rounded border ${page === 1 ? 'border-gray-600 text-gray-600 cursor-not-allowed' : 'border-mainYellow text-mainYellow hover:bg-mainYellow hover:text-mainBlue'}`}
                                        >
                                            {t('tracks.previous')}
                                        </button>
                                        <div className="flex items-center px-3 py-1 bg-accentBlue border border-accentGray rounded">
                                            <span>{page} / {totalPages}</span>
                                        </div>
                                        <button 
                                            onClick={() => fetchLogs(page + 1)} 
                                            disabled={page === totalPages}
                                            className={`px-3 py-1 rounded border ${page === totalPages ? 'border-gray-600 text-gray-600 cursor-not-allowed' : 'border-mainYellow text-mainYellow hover:bg-mainYellow hover:text-mainBlue'}`}
                                        >
                                            {t('admin.next')}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )
            default:
                return null;
        }
    }

    return (
        <div className="p-5 sm:p-10 min-h-screen">
            <header className='mb-8 text-center'>
                <h1 className='text-2xl sm:text-3xl font-bold'>{t('admin.title')}</h1>
            </header>
            {/* Tabs Navigation */}
            <div className='flex flex-row justify-center sm:justify-start gap-4'>
                <button 
                    className={`px-6 py-3 font-medium flex items-center ${tab === 'statistics' ? 'border-b-2 border-mainYellow text-mainYellow' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setTab('statistics')}
                >
                    <FontAwesomeIcon icon={faSquarePollVertical} className='mr-2' />
                    {t('admin.stats')}
                </button>
                <button
                    className={`px-6 py-3 font-medium flex items-center ${tab === 'logs' ? 'border-b-2 border-mainYellow text-mainYellow' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setTab('logs')}                    
                >
                    <FontAwesomeIcon icon={faFileAlt} className='mr-2' />
                    {t('admin.logs')}
                </button>
            </div>
            {renderTab()}
        </div>
    );
};

export default AdminPage;
