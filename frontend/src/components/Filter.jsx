import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFlagCheckered, 
  faRoad, 
  faCar, 
  faStar, 
  faLightbulb,
  faCalendar,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const Filter = ({ 
  onFilterChange,
  type = 'track',
  className = "",
  activeCategory,
  onCategorySelect,
  initialFilters = {
    tags: [],
    ...(type === 'event' ? {
      dateRange: {
        startDate: null,
        endDate: null
      }
    } : {
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
    })
  }
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(initialFilters);

  // Ensure availability is always defined for tracks
  const currentFilters = type === 'track' ? {
    ...filters,
    availability: filters.availability || {
      days: [],
      filterType: 'single',
      rangeDays: {
        from: '',
        to: ''
      }
    }
  } : filters;

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'trackType':
        return faFlagCheckered;
      case 'surfaceType':
        return faRoad;
      case 'vehicleType':
        return faCar;
      case 'difficulty':
        return faStar;
      case 'specialFeatures':
        return faLightbulb;
      case 'eventType':
        return faFlagCheckered;
      case 'vehicleRequirements':
        return faCar;
      case 'eventFormat':
        return faCalendar;
      default:
        return null;
    }
  };

  const handleTagChange = (tag) => {
    const newTags = currentFilters.tags.includes(tag)
      ? currentFilters.tags.filter(t => t !== tag)
      : [...currentFilters.tags, tag];
    
    const newFilters = { ...currentFilters, tags: newTags };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLengthChange = (min, max) => {
    const newFilters = {
      ...currentFilters,
      minLength: min === '' ? undefined : parseFloat(min),
      maxLength: max === '' ? undefined : parseFloat(max)
    };
    
    if (newFilters.minLength !== undefined && newFilters.maxLength !== undefined && newFilters.maxLength < newFilters.minLength) {
      newFilters.maxLength = newFilters.minLength;
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAvailabilityChange = (day, filterType) => {
    const newFilters = {
      ...currentFilters,
      availability: {
        ...currentFilters.availability,
        days: day 
          ? currentFilters.availability.days.includes(day)
            ? currentFilters.availability.days.filter(d => d !== day)
            : [...currentFilters.availability.days, day]
          : currentFilters.availability.days,
        filterType: filterType || currentFilters.availability.filterType,
        rangeDays: filterType === 'range' ? currentFilters.availability.rangeDays : { from: '', to: '' }
      }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRangeDayChange = (type, value) => {
    const newFilters = {
      ...currentFilters,
      availability: {
        ...currentFilters.availability,
        rangeDays: {
          ...currentFilters.availability.rangeDays,
          [type]: value
        }
      }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (startDate, endDate) => {
    const newFilters = {
      ...currentFilters,
      dateRange: {
        startDate,
        endDate
      }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const categories = type === 'event' 
    ? ['eventType', 'difficulty', 'vehicleRequirements', 'specialFeatures', 'eventFormat']
    : ['trackType', 'difficulty', 'surfaceType', 'vehicleType', 'specialFeatures'];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Categories Section */}
      <div>
        <h4 className="text-sm font-medium text-mainYellow mb-2">{t('common.categories')}</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`w-full flex items-center justify-between p-2 rounded-lg ${
                activeCategory === category
                  ? 'bg-mainRed text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={getCategoryIcon(category)} />
                <span>{t(`tags.${type}.${category}.title`)}</span>
              </div>
              <FontAwesomeIcon 
                icon={faChevronRight} 
                className={`transform transition-transform ${
                  activeCategory === category ? 'rotate-90' : ''
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Tags Section - Only show when a category is selected */}
      {activeCategory && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-mainYellow mb-2">
            {t(`tags.${type}.${activeCategory}.title`)}
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(t(`tags.${type}.${activeCategory}`, { returnObjects: true }))
              .filter(([tag]) => tag !== 'title')
              .map(([tag, label]) => (
                <button
                  key={tag}
                  onClick={() => handleTagChange(tag)}
                  className={`px-2 py-1 rounded text-sm ${
                    currentFilters.tags.includes(tag)
                      ? 'bg-mainRed text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Length Section - Only for tracks */}
      {type === 'track' && (
        <div>
          <h4 className="text-sm font-medium text-mainYellow mb-2">{t('common.length')}</h4>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={t('common.min')}
              value={currentFilters.minLength || ''}
              onChange={(e) => handleLengthChange(e.target.value, currentFilters.maxLength)}
              className="w-1/2 bg-gray-800 text-mainYellow border border-gray-700 rounded px-2 py-1"
            />
            <input
              type="number"
              placeholder={t('common.max')}
              value={currentFilters.maxLength || ''}
              onChange={(e) => handleLengthChange(currentFilters.minLength, e.target.value)}
              className="w-1/2 bg-gray-800 text-mainYellow border border-gray-700 rounded px-2 py-1"
            />
          </div>
        </div>
      )}

      {/* Availability Section - Only for tracks */}
      {type === 'track' && (
        <div>
          <h4 className="text-sm font-medium text-mainYellow mb-2">{t('common.availability')}</h4>
          <div className="space-y-2">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => handleAvailabilityChange(null, 'single')}
                className={`px-2 py-1 rounded text-sm ${
                  currentFilters.availability.filterType === 'single'
                    ? 'bg-mainRed text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t('availability.singleDay')}
              </button>
              <button
                onClick={() => handleAvailabilityChange(null, 'range')}
                className={`px-2 py-1 rounded text-sm ${
                  currentFilters.availability.filterType === 'range'
                    ? 'bg-mainRed text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t('availability.dayRange')}
              </button>
            </div>

            {currentFilters.availability.filterType === 'single' ? (
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <button
                    key={day}
                    onClick={() => handleAvailabilityChange(day)}
                    className={`px-2 py-1 rounded text-sm ${
                      currentFilters.availability.days.includes(day)
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
                    value={currentFilters.availability.rangeDays.from || ''}
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
                    value={currentFilters.availability.rangeDays.to || ''}
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
      )}

      {/* Date Range Section - Only for events */}
      {type === 'event' && (
        <div>
          <h4 className="text-sm font-medium text-mainYellow mb-2">{t('event.schedule')}</h4>
          <div className="flex gap-2">
            <input
              type="date"
              value={currentFilters.dateRange?.startDate || ''}
              onChange={(e) => handleDateRangeChange(e.target.value, currentFilters.dateRange?.endDate)}
              className="w-1/2 bg-gray-800 text-mainYellow border border-gray-700 rounded px-2 py-1"
            />
            <input
              type="date"
              value={currentFilters.dateRange?.endDate || ''}
              onChange={(e) => handleDateRangeChange(currentFilters.dateRange?.startDate, e.target.value)}
              className="w-1/2 bg-gray-800 text-mainYellow border border-gray-700 rounded px-2 py-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter; 