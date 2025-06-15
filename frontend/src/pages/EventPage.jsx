import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import SearchAndFilter from '../components/SearchAndFilter';
import EventCard from '../components/EventCard';

function EventPage() {
    const { t } = useTranslation();
    const { userId } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        tags: [],
        dateRange: {
            startDate: null,
            endDate: null
        }
    });

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (searchQuery) {
                params.append('search', searchQuery);
            }
            
            if (filters.tags.length > 0) {
                params.append('tags', filters.tags.join(','));
            }
            
            if (filters.dateRange.startDate) {
                params.append('startDate', filters.dateRange.startDate);
            }
            
            if (filters.dateRange.endDate) {
                params.append('endDate', filters.dateRange.endDate);
            }
            
            const response = await axiosInstance.get(`/events/getevents?${params.toString()}`);
            setEvents(response.data.events);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [searchQuery, filters]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className='p-5 sm:p-10 bg-mainBlue min-h-screen'>
            <div className="flex items-center justify-between mb-10">
                <SearchAndFilter
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    type="event"
                    searchPlaceholder={t('event.searchPlaceholder')}
                />
                <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                    <h1 className="text-4xl font-bold">{t('event.title')}</h1>
                </div>
                {userId && 
                    <Link className="flex items-center gap-2 bg-mainRed hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        to="/events/create"
                        aria-label={t('event.createEvent')}>
                        <span className="text-xl">+</span>
                        <span className="hidden sm:inline">{t('event.createEvent')}</span>
                    </Link>
                }
            </div>

            {/* Loader */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="flex flex-col items-center">
                        <div className="loader ease-linear rounded-full border-4 border-t-4 border-mainRed h-12 w-12 mb-4"></div>
                        <p className="text-lg">{t('event.loading')}</p>
                    </div>
                </div>
            ) : (
                // Events Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.length > 0 ? (
                        events.map(event => (
                            <EventCard key={event._id} event={event} />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-400">
                            {t('event.noEvents')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}       

export default EventPage
