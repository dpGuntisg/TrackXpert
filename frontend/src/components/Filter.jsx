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
import Calendar from './Calendar';

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

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
        days: []
      }
    })
  }
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(initialFilters);
  const [showCalendar, setShowCalendar] = useState(false);

  // Ensure availability is always defined for tracks
  const currentFilters = type === 'track' ? {
    ...filters,
    availability: filters.availability || {
      days: []
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

  const handleAvailabilityChange = (day) => {
    const newFilters = {
      ...currentFilters,
      availability: {
        ...currentFilters.availability,
        days: day 
          ? currentFilters.availability.days.includes(day)
            ? currentFilters.availability.days.filter(d => d !== day)
            : [...currentFilters.availability.days, day]
          : currentFilters.availability.days
      }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (dates) => {
    const newFilters = {
      ...currentFilters,
      dateRange: {
        startDate: dates[0],
        endDate: dates[1]
      }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const categories = type === 'event' 
    ? ['eventType', 'difficulty', 'vehicleRequirements', 'specialFeatures', 'eventFormat']
    : ['trackType', 'difficulty', 'surfaceType', 'vehicleType', 'specialFeatures'];

  return (
    <div className={`h-full overflow-y-auto ${className}`}>
      <div className="space-y-4 pb-4">
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

        {/* Availability Section - Only for tracks (simplified, no day ranges) */}
        {type === 'track' && (
          <div>
            <h4 className="text-sm font-medium text-mainYellow mb-2">{t('common.availability')}</h4>
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
          </div>
        )}

        {/* Date Range Section - Only for events */}
        {type === 'event' && (
          <div>
            <h4 className="text-sm font-medium text-mainYellow mb-2">{t('event.schedule')}</h4>
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="flex items-center justify-center w-full py-3 px-4 bg-gray-800 rounded-lg cursor-pointer transition-colors border border-gray-700 hover:border-mainRed"
            >
              <FontAwesomeIcon icon={faCalendar} className="mr-2" />
              {currentFilters.dateRange?.startDate && currentFilters.dateRange?.endDate ? (
                `${formatDate(currentFilters.dateRange.startDate)} to ${formatDate(currentFilters.dateRange.endDate)}`
              ) : (
                t('event.selectDates')
              )}
            </button>
          </div>
        )}

        {showCalendar && (
          <Calendar
            isRange={true}
            startDate={currentFilters.dateRange?.startDate}
            endDate={currentFilters.dateRange?.endDate}
            onChange={handleDateRangeChange}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Filter;