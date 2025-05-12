import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const SearchBar = React.memo(({ 
  onSearch, 
  value = '',
  placeholder = "Search...",
  className = "",
  disabled = false,
  autoFocus = false
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(value);
  const searchTimeoutRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      onSearch(newValue);
    }, 300); // 300ms debounce
  }, [onSearch]);

  // Clear search on inputValue becoming empty
  useEffect(() => {
    if (inputValue === '') {
      onSearch('');
    }
  }, [inputValue, onSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={t(placeholder)}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={t(placeholder)}
        className="w-full bg-gray-800 text-mainYellow border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-mainRed focus:ring-2 focus:ring-mainRed disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <FontAwesomeIcon 
        icon={faSearch} 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mainYellow" 
      />
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
