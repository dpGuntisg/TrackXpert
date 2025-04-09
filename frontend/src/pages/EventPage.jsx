import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import SearchAndFilter from '../components/SearchAndFilter';

function EventPage() {
    const { t } = useTranslation();
    const { userId } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        tags: [],
        minLength: '',
        maxLength: '',
        availability: {
            days: [],
            filterType: 'single',
            rangeDays: {
                from: '',
                to: ''
            }
        }
    });

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
                        to="/create-event"
                        aria-label={t('event.createEvent')}>
                        <span className="text-xl">+</span>
                        <span className="hidden sm:inline">{t('event.createEvent')}</span>
                    </Link>
                }
            </div>
        </div>
    );
}       

export default EventPage
