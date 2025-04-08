import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { faTag, faFlagCheckered, faRoad, faCar, faStar, faCog, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TagManager = ({ 
  tags = [], 
  onChange, 
  maxTags = 8, 
  maxTrackTypeTags = 2,
  isEvent = false,
  helperText = "Select tags"
}) => {
  const { t } = useTranslation();
  const [selectedTags, setSelectedTags] = useState(tags);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

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

  const handleTagClick = (tag) => {
    setError('');
    const tagInfo = getTagInfo(tag);
    if (!tagInfo) return;

    let newTags;
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter(t => t !== tag);
    } else {
      // Check total tags limit
      if (selectedTags.length >= maxTags) {
        setError(`Maximum ${maxTags} tags allowed`);
        return;
      }

      // Check track type tags limit for tracks
      if (!isEvent && tagInfo.category === 'trackType') {
        const trackTypeTags = selectedTags.filter(t => getTagInfo(t)?.category === 'trackType');
        if (trackTypeTags.length >= maxTrackTypeTags) {
          setError(`Maximum ${maxTrackTypeTags} track type tags allowed`);
          return;
        }
      }

      // Check difficulty tags limit
      if (tagInfo.category === 'difficulty') {
        const difficultyTags = selectedTags.filter(t => getTagInfo(t)?.category === 'difficulty');
        if (difficultyTags.length >= 1) {
          setError('Only one difficulty level can be selected');
          return;
        }
      }

      // For events, ensure at least one event type and one vehicle requirement tag
      if (isEvent) {
        const eventTypeTags = selectedTags.filter(t => getTagInfo(t)?.category === 'eventType');
        const vehicleRequirementTags = selectedTags.filter(t => getTagInfo(t)?.category === 'vehicleRequirements');
        
        if (tagInfo.category === 'eventType' && eventTypeTags.length === 0) {
          setError('At least one event type tag is required');
          return;
        }
        if (tagInfo.category === 'vehicleRequirements' && vehicleRequirementTags.length === 0) {
          setError('At least one vehicle requirement tag is required');
          return;
        }
      }

      newTags = [...selectedTags, tag];
    }

    setSelectedTags(newTags);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600">
        <FontAwesomeIcon icon={faTag} className="text-gray-400" />
        <span className="text-sm font-medium">{helperText}</span>
      </div>
      
      {/* Category Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {getCategories().map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                      ${activeCategory === category 
                        ? 'bg-mainRed text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-white text-sm font-medium 
                          border ${isSelected ? 'border-mainRed' : 'border-gray-700'} 
                          hover:border-mainRed transition-colors duration-200`}
              >
                <FontAwesomeIcon 
                  icon={getTagIcon(tagInfo.category)} 
                  className={isSelected ? 'text-mainRed' : 'text-mainYellow'} 
                />
                <span>{tagInfo.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Tags Display */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Selected Tags:</h3>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => {
            const tagInfo = getTagInfo(tag);
            if (!tagInfo) return null;
            
            return (
              <div
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-white text-sm font-medium border border-mainRed"
              >
                <FontAwesomeIcon icon={getTagIcon(tagInfo.category)} className="text-mainRed" />
                <span>{tagInfo.label}</span>
                <button
                  onClick={() => handleTagClick(tag)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default TagManager; 