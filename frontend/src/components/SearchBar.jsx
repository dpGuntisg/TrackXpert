import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search...",
  className = "" 
}) => {
  const { t } = useTranslation();

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-inputBlue text-mainYellow border border-accentGray rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-mainRed focus:ring-2 focus:ring-mainRed"
      />
      <FontAwesomeIcon 
        icon={faSearch} 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mainYellow" 
      />
    </div>
  );
};

export default SearchBar; 