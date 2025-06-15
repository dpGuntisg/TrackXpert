import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { faTag, faFlagCheckered, faRoad, faCar, faStar, faCog, faLightbulb, faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TagManager = ({ 
  tags = [], 
  onChange, 
  maxTags = 12, 
  maxTrackTypeTags = 4,
  isEvent = false,
  touched = false,
  showValidation = false // New prop to control when to show validation
}) => {
  const { t } = useTranslation();
  const [selectedTags, setSelectedTags] = useState(tags);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [validationState, setValidationState] = useState({
    hasTrackTypeTags: false,
    hasEnoughTags: false,
    hasTooManyTags: false,
    hasTooManyTrackTypeTags: false,
    hasDuplicateTags: false
  });

  // Get all valid tags from translations based on type
  const getValidTags = () => {
    const type = isEvent ? 'event' : 'track';
    const categories = isEvent 
      ? ['eventType', 'difficulty', 'vehicleRequirements', 'specialFeatures']
      : ['trackType', 'difficulty', 'surfaceType', 'vehicleType', 'specialFeatures'];
    
    return categories.reduce((acc, category) => {
      const categoryTags = t(`tags.${type}.${category}`, { returnObjects: true });
      return [...acc, ...Object.keys(categoryTags).filter(tag => tag !== 'title')];
    }, []);
  };

  // Get tag category and label
  const getTagInfo = (tag) => {
    const type = isEvent ? 'event' : 'track';
    const categories = isEvent 
      ? ['eventType', 'difficulty', 'vehicleRequirements', 'specialFeatures']
      : ['trackType', 'difficulty', 'surfaceType', 'vehicleType', 'specialFeatures'];
    
    for (const category of categories) {
      const categoryTags = t(`tags.${type}.${category}`, { returnObjects: true });
      if (categoryTags && typeof categoryTags === 'object' && tag in categoryTags) {
        return {
          category,
          label: t(`tags.${type}.${category}.${tag}`)
        };
      }
    }
    return null;
  };

  // Get icon for tag category
  const getTagIcon = (category) => {
    switch (category) {
      case 'trackType':
      case 'eventType':
        return faFlagCheckered;
      case 'surfaceType':
        return faRoad;
      case 'vehicleType':
      case 'vehicleRequirements':
        return faCar;
      case 'difficulty':
        return faStar;
      case 'specialFeatures':
        return faLightbulb;
      case 'eventFormat':
        return faCog;
      default:
        return faTag;
    }
  };

  // Validate tags and update validation state
  const validateTags = (tags) => {
    const hasEnoughTags = tags.length >= 1;
    const hasTooManyTags = tags.length > maxTags;
    const hasDuplicateTags = new Set(tags).size !== tags.length;

    // For tracks, check track type tags
    let hasTooManyTrackTypeTags = false;
    let hasTrackTypeTags = false;
    
    if (!isEvent) {
      const trackTypeTags = tags.filter(tag => getTagInfo(tag)?.category === 'trackType');
      hasTrackTypeTags = trackTypeTags.length > 0;
      hasTooManyTrackTypeTags = trackTypeTags.length > maxTrackTypeTags;
    }

    setValidationState({
      hasEnoughTags,
      hasTooManyTags,
      hasTooManyTrackTypeTags,
      hasDuplicateTags,
      hasTrackTypeTags
    });

    // Only set error if showValidation is true (after form submission attempt)
    if (showValidation) {
      if (hasTooManyTags) {
        setError(t('tracks.form.validation.tooManyTags', { max: maxTags }));
        return false;
      }
      if (hasTooManyTrackTypeTags) {
        setError(t('tracks.form.validation.tooManyTrackTypeTags', { max: maxTrackTypeTags }));
        return false;
      }
      if (hasDuplicateTags) {
        setError(t('tracks.form.validation.duplicateTags'));
        return false;
      }
      if (!hasEnoughTags) {
        setError(isEvent ? t('events.form.validation.tagsRequired') : t('tracks.form.validation.tagsRequired'));
        return false;
      }
    } else {
      setError(''); // Clear error when not showing validation
    }

    return true;
  };

  const handleTagClick = (tag) => {
    const tagInfo = getTagInfo(tag);
    if (!tagInfo) return;

    let newTags;
    if (selectedTags.includes(tag)) {
      // Remove tag
      newTags = selectedTags.filter(t => t !== tag);
    } else {
      // Add tag - check limits first
      
      // Check total tags limit
      if (selectedTags.length >= maxTags) {
        setError(t('tracks.form.validation.tooManyTags', { max: maxTags }) || `Maximum ${maxTags} tags allowed`);
        return;
      }

      // Check track type tags limit for tracks
      if (!isEvent && tagInfo.category === 'trackType') {
        const trackTypeTags = selectedTags.filter(t => getTagInfo(t)?.category === 'trackType');
        if (trackTypeTags.length >= maxTrackTypeTags) {
          setError(t('tracks.form.validation.tooManyTrackTypeTags', { max: maxTrackTypeTags }) || `Maximum ${maxTrackTypeTags} track type tags allowed`);
          return;
        }
      }

      // Check difficulty tags limit
      if (tagInfo.category === 'difficulty') {
        const difficultyTags = selectedTags.filter(t => getTagInfo(t)?.category === 'difficulty');
        if (difficultyTags.length >= 1) {
          setError(t('tracks.form.validation.oneDifficultyLevel') || 'Only one difficulty level allowed');
          return;
        }
      }

      newTags = [...selectedTags, tag];
    }

    setSelectedTags(newTags);
    validateTags(newTags);
    onChange(newTags);
    
    // Clear error when successfully adding/removing tags
    if (!showValidation) {
      setError('');
    }
  };

  // Get categories for the current type
  const getCategories = () => {
    const type = isEvent ? 'event' : 'track';
    return isEvent 
      ? ['eventType', 'difficulty', 'vehicleRequirements', 'specialFeatures']
      : ['trackType', 'difficulty', 'surfaceType', 'vehicleType', 'specialFeatures'];
  };

  // Get tags for a specific category
  const getTagsForCategory = (category) => {
    const type = isEvent ? 'event' : 'track';
    const categoryTags = t(`tags.${type}.${category}`, { returnObjects: true });
    return Object.keys(categoryTags).filter(tag => tag !== 'title');
  };

  // Check if a tag can be added (for visual feedback)
  const canAddTag = (tag) => {
    if (selectedTags.includes(tag)) return true; // Can always remove
    
    const tagInfo = getTagInfo(tag);
    if (!tagInfo) return false;

    // Check total limit
    if (selectedTags.length >= maxTags) return false;

    // Check track type limit
    if (!isEvent && tagInfo.category === 'trackType') {
      const trackTypeTags = selectedTags.filter(t => getTagInfo(t)?.category === 'trackType');
      if (trackTypeTags.length >= maxTrackTypeTags) return false;
    }

    // Check difficulty limit
    if (tagInfo.category === 'difficulty') {
      const difficultyTags = selectedTags.filter(t => getTagInfo(t)?.category === 'difficulty');
      if (difficultyTags.length >= 1) return false;
    }

    return true;
  };

  // Initialize validation state
  useEffect(() => {
    validateTags(selectedTags);
  }, [showValidation]);

  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-sm font-medium text-gray-400">
        {isEvent
          ? 'Select event tags (type, difficulty, vehicle requirements, features)'
          : t(`tags.track.title`)}
      </h3>

      {/* Tag count indicator */}
      <div className="text-sm text-gray-400">
        {t('tracks.form.tagCounter', { 
          total: selectedTags.length,
          trackType: selectedTags.filter(tag => getTagInfo(tag)?.category === 'trackType').length
        })}
      </div>

      {/* Category Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {getCategories().map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border-2
                      ${activeCategory === category 
                        ? 'bg-mainRed text-white border-mainRed shadow-lg' 
                        : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-mainRed'}`}
          >
            <FontAwesomeIcon icon={getTagIcon(category)} />
            <span>{t(`tags.${isEvent ? 'event' : 'track'}.${category}.title`)}</span>
          </button>
        ))}
      </div>

      {/* Tags for Selected Category */}
      {activeCategory && (
        <div className="flex flex-wrap gap-2">
          {getTagsForCategory(activeCategory).map(tag => {
            const tagInfo = getTagInfo(tag);
            if (!tagInfo) return null;

            const isSelected = selectedTags.includes(tag);
            const canAdd = canAddTag(tag);
            
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                disabled={!canAdd && !isSelected}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium 
                          transition-all duration-200 transform hover:scale-105
                          ${isSelected 
                            ? 'bg-mainRed text-white shadow-lg' 
                            : canAdd
                              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                              : 'bg-gray-900 text-gray-500 cursor-not-allowed opacity-50'}`}
              >
                <FontAwesomeIcon 
                  icon={getTagIcon(tagInfo.category)} 
                  className={isSelected ? 'text-white' : canAdd ? 'text-mainYellow' : 'text-gray-600'} 
                />
                <span>{tagInfo.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Tags Display */}
      <div className={`mt-4 ${showValidation && !validationState.hasEnoughTags ? 'border-2 border-red-500 rounded-lg p-4' : ''}`}>
        <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          {t('tracks.form.selectedTags')}
          {validationState.hasEnoughTags && !validationState.hasTooManyTags && !validationState.hasTooManyTrackTypeTags && (
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
          )}
        </h3>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => {
            const tagInfo = getTagInfo(tag);
            if (!tagInfo) return null;
            
            return (
              <div
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-white text-sm font-medium border border-mainRed shadow-lg"
              >
                <FontAwesomeIcon icon={getTagIcon(tagInfo.category)} className="text-mainRed" />
                <span>{tagInfo.label}</span>
                <button
                  onClick={() => handleTagClick(tag)}
                  className="ml-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation Messages - only show when showValidation is true or when user hits limits */}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-2">
          <FontAwesomeIcon icon={faExclamationCircle} />
          {error}
        </p>
      )}
    </div>
  );
};

export default TagManager;