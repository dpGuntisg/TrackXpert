import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false); // Close the dropdown after selecting a language
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
        className="relative overflow-hidden text-mainRed hover:bg-mainRed text-left rounded transition-all duration-500
                  px-4 py-2 hover:text-mainYellow"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {i18n.language.toUpperCase()}
        
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-20 rounded bg-accentBlue shadow-lg z-10 border border-mainRed">
          <button
            onClick={() => changeLanguage('en')}
            className={`block w-full text-left px-4 py-2 text-mainRed hover:bg-mainRed hover:text-mainYellow ${
              i18n.language === 'en' ? 'font-bold bg-mainRed text-mainYellow' : ''
            }`}
          >
            EN
          </button>
          <button
            onClick={() => changeLanguage('lv')}
            className={`block w-full text-left px-4 py-2 text-mainRed hover:bg-mainRed hover:text-mainYellow ${
              i18n.language === 'lv' ? 'font-bold bg-mainRed text-mainYellow' : ''
            }`}
          >
            LV
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;