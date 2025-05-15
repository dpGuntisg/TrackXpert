import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faSquarePollVertical, faUsers, faUserCheck, faRoute, faCalendarAlt, faMapMarkerAlt, faAngleDown, faAngleUp, faFilter } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import TracksPerCountryChart from '../components/AdminPanelComponents/TracksPerCountryChart';
import UserGrowthChart from '../components/AdminPanelComponents/UserGrowthChart';
import SearchBar from '../components/SearchBar';
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
    const [searchQuery, setSearchQuery] = useState('');
    const actionTypes = ["created", "edited", "deleted", "joined"];
    const [selectedActionType, setSelectedActionType] = useState("");

    const actionColors = {
        created_account: "bg-green-900/30 border border-green-700 text-green-400",
        created_track: "bg-green-900/30 border border-green-700 text-green-400",
        updated_track: "bg-yellow-900/30 border border-yellow-700 text-yellow-400",
        deleted_track: "bg-red-900/30 border border-red-700 text-red-400",
        created_event: "bg-green-900/30 border border-green-700 text-green-400",
        updated_event: "bg-yellow-900/30 border border-yellow-700 text-yellow-400",
        deleted_event: "bg-red-900/30 border border-red-700 text-red-400",
        updated_account: "bg-yellow-900/30 border border-yellow-700 text-yellow-400"
      };
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
            if (searchQuery) params.append('search', searchQuery.trim());
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
    }, [action, userId, startDate, endDate, sortOrder, limit, page, searchQuery]);

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
                setError(error.response?.data?.message || 'Error fetching tracks per country');
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

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        setPage(1); // Reset page on new search
    }, [setSearchQuery, setPage]);

    const toggleSortOrder = () => {
        setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
      };
    

      
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
                                            {t('admin.userGrowth')}
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
                        <div className="mb-4">
                            <SearchBar onSearch={handleSearch} placeholder={t('admin.searchLogs')} />
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainYellow"></div>
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="grid grid-cols-4 gap-4 bg-mainBlue rounded-t-lg p-4 border-b border-accentGray font-semibold text-mainYellow">
                                    <div>{t('common.user')}</div>
                                    <div>{t('admin.action')}</div>
                                    <div>{t('admin.details')}</div>
                                    <button
                                        onClick={toggleSortOrder}
                                        className="flex flex-row items-center focus:outline-none hover:opacity-80"
                                    >
                                        {t('admin.date')}
                                        <span className="ml-2">
                                            {sortOrder === 'asc' ? <FontAwesomeIcon icon={faAngleUp} />
                                            : <FontAwesomeIcon icon={faAngleDown} />}
                                        </span>
                                    </button>
                                </div>

                                {/* Table Body*/}
                                <div className="bg-accentBlue rounded-b-lg">
                                    {logs.length === 0 ? (
                                        <div className='text-center py-16'>
                                            <p className="text-2xl mb-4">
                                                {searchQuery ? t('admin.noSearchResults') : t('admin.noLogs')}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-accentGray">
                                            {logs.map((log) => (
                                                <div key={log._id} className="grid grid-cols-4 gap-4 p-4 hover:bg-mainBlue/20 transition duration-150">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-white">{log.userId?.username}</span>
                                                        <span className="text-xs text-gray-400">({log.userId?._id})</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className={`px-2 py-1 rounded text-sm ${actionColors[log.action] || "bg-gray-100 text-gray-800"}`}>
                                                        {t(`admin.actions.${log.action}`)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        {log.metadata && (
                                                            <div className="text-sm text-gray-300 max-h-24 overflow-y-auto">
                                                                {Object.entries(log.metadata).map(([key, value]) => (
                                                                    <div key={key} className="mb-1">
                                                                        <span className="text-mainYellow">{key}:</span>{" "}
                                                                        <span className="text-gray-400">
                                                                            {renderMetadataValue(key, value)}
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
                                    )}
                                </div>

                                {/* Pagination */}
                                {logs.length > 0 && (
                                    <div className="flex justify-center items-center mt-6 px-2">
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
                                                {t('tracks.next')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const renderMetadataValue = (key, value) => {
        // If the value is an object, stringify it
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        // If it's an ID and the action is related to tracks or events, make it a link
        if (key === 'id' && value) {
            const log = logs.find(log => log.metadata?.id === value);
            const action = log?.action;
            
            // Don't show links for deleted items
            if (action === 'deleted_track' || action === 'deleted_event') {
                return value.toString();
            }
            
            if (action?.includes('track')) {
                return (
                    <Link 
                        to={`/tracks/${value}`}
                        className="text-mainYellow hover:text-yellow-400 underline"
                    >
                        {value}
                    </Link>
                );
            } else if (action?.includes('event')) {
                return (
                    <Link 
                        to={`/events/${value}`}
                        className="text-mainYellow hover:text-yellow-400 underline"
                    >
                        {value}
                    </Link>
                );
            }
        }

        return value.toString();
    };

    return (
        <div className="min-h-screen bg-mainBlue p-5 sm:p-10">
            <header className='mb-8 text-center'>
                <h1 className='text-2xl sm:text-3xl font-bold text-mainYellow'>{t('admin.title')}</h1>
            </header>

            <div className="container mx-auto">
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
            {/* Tabs Render*/}
            </div>
                {renderTab()}
            </div>
        </div>
    );
};

export default AdminPage;