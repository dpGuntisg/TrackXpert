import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { faTag, faFlagCheckered, faRoad, faCar, faStar, faCog, faLightbulb, faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TagManager = ({ 
  tags = [], 
  onChange, 
  maxTags = 8, 
  maxTrackTypeTags = 2,
  isEvent = false,
  touched = false
}) => {
  const { t } = useTranslation();
  const [selectedTags, setSelectedTags] = useState(tags);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [validationState, setValidationState] = useState({
    hasTrackTypeTags: false,
    hasEnoughTags: false,
    hasTooManyTags: false,
    hasTooManyTrackTypeTags: false
  });

  // Get all valid tags from translations based on type
  const getValidTags = () => {
    const type = isEvent ? 'event' : 'track';
    const categories = isEvent 
      ? ['eventType', 'difficulty', 'vehicleRequirements', 'specialFeatures', 'eventFormat']
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
      ? ['eventType', 'difficulty', 'vehicleRequirements', 'specialFeatures', 'eventFormat']
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
    const trackTypeTags = tags.filter(tag => getTagInfo(tag)?.category === 'trackType');
    const hasTrackTypeTags = trackTypeTags.length > 0;
    const hasEnoughTags = tags.length >= 1;
    const hasTooManyTags = tags.length > maxTags;
    const hasTooManyTrackTypeTags = trackTypeTags.length > maxTrackTypeTags;

    setValidationState({
      hasTrackTypeTags,
      hasEnoughTags,
      hasTooManyTags,
      hasTooManyTrackTypeTags
    });

    if (hasTooManyTags) {
      setError(t('tracks.form.validation.tooManyTags'));
      return false;
    }
    if (hasTooManyTrackTypeTags) {
      setError(t('tracks.form.validation.tooManyTrackTypeTags'));
      return false;
    }
    if (!hasEnoughTags) {
      setError(t('tracks.form.validation.tagsRequired'));
      return false;
    }
    if (!hasTrackTypeTags) {
      setError(t('tracks.form.validation.trackTypeRequired'));
      return false;
    }

    setError('');
    return true;
  };

  const handleTagClick = (tag) => {
    const tagInfo = getTagInfo(tag);
    if (!tagInfo) return;

    let newTags;
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter(t => t !== tag);
    } else {
      // Check total tags limit
      if (selectedTags.length >= maxTags) {
        setError(t('tracks.form.validation.tooManyTags'));
        return;
      }

      // Check track type tags limit for tracks
      if (!isEvent && tagInfo.category === 'trackType') {
        const trackTypeTags = selectedTags.filter(t => getTagInfo(t)?.category === 'trackType');
        if (trackTypeTags.length >= maxTrackTypeTags) {
          setError(t('tracks.form.validation.tooManyTrackTypeTags'));
          return;
        }
      }

      // Check difficulty tags limit
      if (tagInfo.category === 'difficulty') {
        const difficultyTags = selectedTags.filter(t => getTagInfo(t)?.category === 'difficulty');
        if (difficultyTags.length >= 1) {
          setError(t('tracks.form.validation.oneDifficultyLevel'));
          return;
        }
      }

      newTags = [...selectedTags, tag];
    }

    setSelectedTags(newTags);
    validateTags(newTags);
    onChange(newTags);
  };

  // Get categories for the current type
  const getCategories = () => {
    const type = isEvent ? 'event' : 'track';
    return isEvent 
      ? ['eventType', 'difficulty', 'vehicleRequirements', 'specialFeatures', 'eventFormat']
      : ['trackType', 'difficulty', 'surfaceType', 'vehicleType', 'specialFeatures'];
  };

  // Get tags for a specific category
  const getTagsForCategory = (category) => {
    const type = isEvent ? 'event' : 'track';
    const categoryTags = t(`tags.${type}.${category}`, { returnObjects: true });
    return Object.keys(categoryTags).filter(tag => tag !== 'title');
  };

  // Initialize validation state
  useEffect(() => {
    validateTags(selectedTags);
  }, []);

  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-sm font-medium text-gray-400">
        {t(`tags.${isEvent ? 'event' : 'track'}.title`)}
      </h3>

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
            
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium 
                          transition-all duration-200 transform hover:scale-105
                          ${isSelected 
                            ? 'bg-mainRed text-white shadow-lg' 
                            : 'bg-gray-800 text-gray-300'}`}
              >
                <FontAwesomeIcon 
                  icon={getTagIcon(tagInfo.category)} 
                  className={isSelected ? 'text-white' : 'text-mainYellow'} 
                />
                <span>{tagInfo.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Tags Display */}
      <div className={`mt-4 ${touched && !validationState.hasEnoughTags ? 'border-2 border-red-500 rounded-lg p-4' : ''}`}>
        <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          {t('tracks.form.selectedTags')}
          {validationState.hasEnoughTags && validationState.hasTrackTypeTags && !validationState.hasTooManyTags && !validationState.hasTooManyTrackTypeTags && (
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

      {/* Validation Messages */}
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