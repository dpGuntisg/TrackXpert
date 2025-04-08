import React, { useCallback, useEffect } from 'react';
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

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    onSearch(newValue);
  }, [onSearch]);

  // Reset search when value becomes empty
  useEffect(() => {
    if (value === '') {
      onSearch('');
    }
  }, [value, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={t(placeholder)}
        disabled={disabled}
        autoFocus={autoFocus}
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