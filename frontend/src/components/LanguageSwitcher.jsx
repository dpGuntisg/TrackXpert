import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faCheck } from "@fortawesome/free-solid-svg-icons";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize language code by removing region part (e.g., 'en-gb' becomes 'en')
  const currentLang = i18n.language.split('-')[0];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-mainYellow hover:text-mainRed text-left rounded transition-all duration-500 sm:px-4 sm:py-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FontAwesomeIcon icon={faAngleDown} className="mr-2" />
        {currentLang.toUpperCase()}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-20 rounded bg-accentBlue shadow-lg z-10 border border-accentGray">
          <button
            onClick={() => changeLanguage('en')}
            className={`block w-full text-left px-4 py-2 hover:text-mainRed ${
              currentLang === 'en' ? 'font-bold text-mainRed' : 'text-mainYellow ml-5'
            }`}
          >
            {currentLang === 'en' && <FontAwesomeIcon icon={faCheck} className="mr-2" />}
            EN
          </button>
          <button
            onClick={() => changeLanguage('lv')}
            className={`block w-full text-left px-4 py-2 hover:text-mainRed ${
              currentLang === 'lv' ? 'font-bold text-mainRed' : 'text-mainYellow ml-5'
            }`}
          >
            {currentLang === 'lv' && <FontAwesomeIcon icon={faCheck} className="mr-2" />}
            LV
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;