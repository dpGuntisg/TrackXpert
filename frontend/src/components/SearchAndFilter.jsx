import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import Filter from './Filter';
import SearchBar from './SearchBar';

const SearchAndFilter = ({ 
  onSearch, 
  onFilterChange,
  type = 'track',
  searchPlaceholder = "Search...",
  className = "",
  initialFilters = {
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
  }
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const searchButtonRef = useRef(null);
  const searchPanelRef = useRef(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchPanelRef.current && 
        !searchPanelRef.current.contains(event.target) &&
        searchButtonRef.current &&
        !searchButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Toggle Button */}
      <button
        ref={searchButtonRef}
        onClick={handleToggle}
        className="p-2 rounded-lg bg-mainBlue text-mainYellow hover:bg-accentBlue transition-colors duration-200 shadow-lg"
        aria-label={isOpen ? "Close search" : "Open search"}
      >
        {isOpen ? (
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        ) : (
          <FontAwesomeIcon icon={faSearch} className="text-xl" />
        )}
      </button>

      {/* Search Panel */}
      <div
        ref={searchPanelRef}
        className={`fixed left-0 top-0 h-screen bg-accentBlue shadow-lg transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-[280px] sm:w-[320px] z-[40]`}
      >
        <div className="p-4 mt-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-mainYellow">{t('common.search')}</h2>
            <button
              onClick={handleToggle}
              className="p-2"
              aria-label="Close search"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl text-mainYellow hover:text-mainRed transition-colors duration-200" />
            </button>
          </div>
          <div className="mb-6">
            <SearchBar
              value={searchQuery}
              onSearch={handleSearch}
              placeholder={searchPlaceholder}
              autoFocus={isOpen}
            />
          </div>
          
          {/* Filter Component */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-mainYellow mb-4">{t('common.filter')}</h3>
            <Filter 
              onFilterChange={handleFilterChange}
              type={type}
            />
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[30] sm:hidden"
          onClick={handleToggle}
        />
      )}
    </>
  );
};

export default SearchAndFilter; 