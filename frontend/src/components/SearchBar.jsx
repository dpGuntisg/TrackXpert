import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search...", 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchPanelRef = useRef(null);
  const searchButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen && 
        searchPanelRef.current && 
        searchButtonRef.current &&
        !searchPanelRef.current.contains(event.target) &&
        !searchButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchQuery('');
        onSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onSearch]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchQuery('');
      onSearch('');
    }
  };

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
            <h2 className="text-xl font-semibold text-mainYellow">Search</h2>
            <button
              onClick={handleToggle}
              className="p-2 "
              aria-label="Close search"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl text-mainYellow hover:text-mainRed transition-colors duration-200" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={placeholder}
              className="w-full bg-inputBlue text-mainYellow border border-accentGray rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-mainRed focus:ring-2 focus:ring-mainRed"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mainYellow" />
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

export default SearchBar; 