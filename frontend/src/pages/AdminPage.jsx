import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faSquarePollVertical, faUsers, faUserCheck, faRoute, faCalendarAlt, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import TracksPerCountryChart from '../components/AdminPanelComponents/TracksPerCountryChart';
import UserGrowthChart from '../components/AdminPanelComponents/UserGrowthChart';
const AdminPage = () => {
    // logs state 
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [action, setAction] = useState('');
    const [userId, setUserId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [totalPages, setTotalPages] = useState(1);
    // stats state 
    const [tracksPerCountry, setTracksPerCountry] = useState(null);
    const [userCount, setUserCount] = useState(null);
    const [activeUserCount, setActiveUserCount] = useState(null);
    const [trackCount, setTrackCount] = useState(null);
    const [eventCount, setEventCount] = useState(null);
    const [growthDates, setGrowthDates] = useState([]); 
    const [growthCounts, setGrowthCounts] = useState([]);

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

    // Fetch tracks per country
    useEffect(() => {
        const fetchTracksPerCountry = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/admin/stats/tracks-per-country');
                setTracksPerCountry(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTracksPerCountry();
    }, []);

    // Fetch summary stats
    useEffect(() =>{
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get('/admin/stats/summary');
                setUserCount(res.data.userCount);
                setActiveUserCount(res.data.activeUserCount);
                setTrackCount(res.data.trackCount);
                setEventCount(res.data.eventCount);
            } catch (error) {
                console.error('Failed to fetch admin summary stats', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSummary();
    }, [])

    useEffect(() => {
        const fetchGrowth = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get('/admin/stats/monthly-growth');
                const data = res.data;
                setGrowthDates(data.map(entry => entry.day));
                setGrowthCounts(data.map(entry => entry.count));
            } catch (error) {
                console.error('Failed to fetch admin growth stats', error);
            } finally {
                setLoading(false);
            }
        }
        fetchGrowth();
    }, []);
    

      
    const renderTab = () => {
        switch (tab) {
            case 'statistics':
                return (
                    <div className="rounded-xl space-y-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainYellow"></div>
                            </div>
                        ) : tracksPerCountry && tracksPerCountry.length > 0 ? (
                            <>
                                {/* Summary Statistics Section */}
                                <div className="bg-accentBlue rounded-xl shadow-md p-6">
                                    <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center text-white">
                                        <FontAwesomeIcon icon={faSquarePollVertical} className="mr-2 text-mainYellow" />
                                        {t('admin.summaryStatistics')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {userCount !== null && (
                                            <div className="bg-mainBlue rounded-lg shadow-sm p-4 flex items-center border border-accentGray">
                                                <FontAwesomeIcon icon={faUsers} className="text-mainYellow text-3xl mr-4" />
                                                <div>
                                                    <p className="text-sm text-mainYellow font-semibold">{t('admin.userCount')}</p>
                                                    <p className="text-xl text-white">{userCount}</p>
                                                </div>
                                            </div>
                                        )}
                                        {activeUserCount !== null && (
                                            <div className="bg-mainBlue rounded-lg shadow-sm p-4 flex items-center border border-accentGray">
                                                <FontAwesomeIcon icon={faUserCheck} className="text-mainYellow text-3xl mr-4" />
                                                <div>
                                                    <p className="text-sm text-mainYellow font-semibold">{t('admin.activeUsers')}</p>
                                                    <p className="text-xl text-white">{activeUserCount}</p>
                                                </div>
                                            </div>
                                        )}
                                        {trackCount !== null && (
                                            <div className="bg-mainBlue rounded-lg shadow-sm p-4 flex items-center border border-accentGray">
                                                <FontAwesomeIcon icon={faRoute} className="text-mainYellow text-3xl mr-4" />
                                                <div>
                                                    <p className="text-sm text-mainYellow font-semibold">{t('admin.trackCount')}</p>
                                                    <p className="text-xl text-white">{trackCount}</p>
                                                </div>
                                            </div>
                                        )}
                                        {eventCount !== null && (
                                            <div className="bg-mainBlue rounded-lg shadow-sm p-4 flex items-center border border-accentGray">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="text-mainYellow text-3xl mr-4" />
                                                <div>
                                                    <p className="text-sm text-mainYellow font-semibold">{t('admin.eventCount')}</p>
                                                    <p className="text-xl text-white">{eventCount}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Charts */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-accentBlue rounded-xl shadow-md p-6">
                                        <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center text-white">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-mainYellow" />
                                            {t('admin.tracksPerCountry')}
                                        </h2>
                                        <div className="">
                                            <TracksPerCountryChart data={tracksPerCountry} />
                                        </div>
                                    </div>
                                    <div className="bg-accentBlue rounded-xl shadow-md p-6">
                                        <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center text-white">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-mainYellow" />
                                            {t('admin.tracksPerCountry')}
                                        </h2>
                                        <div>
                                            <UserGrowthChart data={growthCounts.map((count, index) => ({ day: growthDates[index], count }))} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-white">{t('admin.noStatsAvailable')}</div>
                        )}
                    </div>
                );
            case 'logs':
                return (
                    <div className="bg-accentBlue p-6 rounded-xl shadow-lg text-white space-y-4">
                        <h2 className="text-xl font-semibold mb-4 border-b border-mainRed pb-2 flex items-center">
                            <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-mainYellow" />
                            {t('admin.activityLogs')}
                        </h2>
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
                                <div className="grid grid-cols-4 gap-4 bg-mainBlue rounded-t-lg p-4 border-b border-accentGray font-semibold text-mainYellow">
                                    <div>{t('common.user')}</div>
                                    <div>{t('admin.action')}</div>
                                    <div>{t('admin.details')}</div>
                                    <div>{t('admin.date')}</div>
                                </div>

                                {/* Table Body*/}
                                <div className="divide-y divide-accentGray">
                                    {logs.map((log) => (
                                        <div key={log._id} className="grid grid-cols-4 gap-4 p-4 hover:bg-mainBlue/20 transition duration-150">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{log.userId?.username}</span>
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
                                        <div className="flex items-center px-3 py-1 bg-mainBlue border border-accentGray rounded">
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
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-mainBlue p-5 sm:p-10">
            <header className='mb-8 text-center'>
                <h1 className='text-2xl sm:text-3xl font-bold text-mainYellow'>{t('admin.title')}</h1>
            </header>
            {/* Tabs Navigation*/}
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
            <div className="container mx-auto">
                {renderTab()}
            </div>
        </div>
    );
};

export default AdminPage;