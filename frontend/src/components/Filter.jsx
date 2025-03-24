import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Filter = ({ 
  onFilterChange,
  type = 'track', // 'track' or 'event'
  className = ""
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    tags: [],
    minLength: '',
    maxLength: '',
    availability: {
      days: [],
      filterType: 'single', // 'single' or 'range'
      rangeDays: {
        from: '',
        to: ''
      }
    }
  });

  const handleTagChange = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLengthChange = (min, max) => {
    const newFilters = {
      ...filters,
      minLength: min === '' ? '' : parseFloat(min),
      maxLength: max === '' ? '' : parseFloat(max)
    };
    
    // Ensure maxLength is not less than minLength
    if (newFilters.minLength !== '' && newFilters.maxLength !== '' && newFilters.maxLength < newFilters.minLength) {
      newFilters.maxLength = newFilters.minLength;
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAvailabilityChange = (day, filterType) => {
    const newFilters = {
      ...filters,
      availability: {
        ...filters.availability,
        days: day 
          ? filters.availability.days.includes(day)
            ? filters.availability.days.filter(d => d !== day)
            : [...filters.availability.days, day]
          : filters.availability.days,
        filterType: filterType || filters.availability.filterType,
        rangeDays: filterType === 'range' ? filters.availability.rangeDays : { from: '', to: '' }
      }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRangeDayChange = (type, value) => {
    const newFilters = {
      ...filters,
      availability: {
        ...filters.availability,
        rangeDays: {
          ...filters.availability.rangeDays,
          [type]: value
        }
      }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tags Section */}
      <div>
        <h4 className="text-sm font-medium text-mainYellow mb-2">{t('common.tags')}</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(t(`tags.${type}`, { returnObjects: true })).map(([category, tags]) => (
            <div key={category} className="w-full">
              <h5 className="text-xs text-gray-400 mb-1">{t(`tags.${type}.${category}.title`)}</h5>
              <div className="flex flex-wrap gap-2">
                {Object.entries(tags).filter(([tag]) => tag !== 'title').map(([tag, label]) => (
                  <button
                    key={tag}
                    onClick={() => handleTagChange(tag)}
                    className={`px-2 py-1 rounded text-sm ${
                      filters.tags.includes(tag)
                        ? 'bg-mainRed text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Length Section */}
      <div>
        <h4 className="text-sm font-medium text-mainYellow mb-2">{t('common.length')}</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t('common.min')}
            value={filters.minLength}
            onChange={(e) => handleLengthChange(e.target.value, filters.maxLength)}
            className="w-1/2 bg-gray-800 text-mainYellow border border-gray-700 rounded px-2 py-1"
          />
          <input
            type="number"
            placeholder={t('common.max')}
            value={filters.maxLength}
            onChange={(e) => handleLengthChange(filters.minLength, e.target.value)}
            className="w-1/2 bg-gray-800 text-mainYellow border border-gray-700 rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Availability Section */}
      <div>
        <h4 className="text-sm font-medium text-mainYellow mb-2">{t('common.availability')}</h4>
        <div className="space-y-2">
          {/* Filter Type Selection */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => handleAvailabilityChange(null, 'single')}
              className={`px-2 py-1 rounded text-sm ${
                filters.availability.filterType === 'single'
                  ? 'bg-mainRed text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t('availability.singleDay')}
            </button>
            <button
              onClick={() => handleAvailabilityChange(null, 'range')}
              className={`px-2 py-1 rounded text-sm ${
                filters.availability.filterType === 'range'
                  ? 'bg-mainRed text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t('availability.dayRange')}
            </button>
          </div>

          {/* Days Selection based on filter type */}
          {filters.availability.filterType === 'single' ? (
            <div className="flex flex-wrap gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <button
                  key={day}
                  onClick={() => handleAvailabilityChange(day)}
                  className={`px-2 py-1 rounded text-sm ${
                    filters.availability.days.includes(day)
                      ? 'bg-mainRed text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t(`availability.days.${day}`)}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">{t('availability.startDay')}</label>
                <select
                  value={filters.availability.rangeDays.from}
                  onChange={(e) => handleRangeDayChange('from', e.target.value)}
                  className="w-full bg-gray-800 text-mainYellow border border-gray-700 rounded px-2 py-1"
                >
                  <option value="">{t('availability.selectDay')}</option>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <option key={day} value={day}>{t(`availability.days.${day}`)}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">{t('availability.endDay')}</label>
                <select
                  value={filters.availability.rangeDays.to}
                  onChange={(e) => handleRangeDayChange('to', e.target.value)}
                  className="w-full bg-gray-800 text-mainYellow border border-gray-700 rounded px-2 py-1"
                >
                  <option value="">{t('availability.selectDay')}</option>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <option key={day} value={day}>{t(`availability.days.${day}`)}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter; 