import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { faTag, faFlagCheckered, faRoad, faCar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TagManager = ({ 
  tags = [], 
  onChange, 
  maxTags = 5, 
  maxTrackTypeTags = 2,
  isEvent = false,
  helperText = "Select tags"
}) => {
  const { t } = useTranslation();
  const [selectedTags, setSelectedTags] = useState(tags);
  const [error, setError] = useState('');

  // Get all valid tags from translations based on type
  const getValidTags = () => {
    const type = isEvent ? 'event' : 'track';
    const categories = isEvent 
      ? ['eventType', 'specialFeatures', 'carRequirements']
      : ['trackType', 'roadType', 'carType'];
    
    return categories.reduce((acc, category) => {
      const categoryTags = t(`tags.${type}.${category}`, { returnObjects: true });
      return [...acc, ...Object.keys(categoryTags).filter(tag => tag !== 'title')];
    }, []);
  };

  // Get tag category and label
  const getTagInfo = (tag) => {
    const type = isEvent ? 'event' : 'track';
    const categories = isEvent 
      ? ['eventType', 'specialFeatures', 'carRequirements']
      : ['trackType', 'roadType', 'carType'];
    
    for (const category of categories) {
      const categoryTags = t(`tags.${type}.${category}`, { returnObjects: true });
      if (tag in categoryTags && tag !== 'title') {
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
        return faFlagCheckered;
      case 'roadType':
        return faRoad;
      case 'carType':
        return faCar;
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

      // For events, ensure at least one event type and one car requirement tag
      if (isEvent) {
        const eventTypeTags = selectedTags.filter(t => getTagInfo(t)?.category === 'eventType');
        const carRequirementTags = selectedTags.filter(t => getTagInfo(t)?.category === 'carRequirements');
        
        if (tagInfo.category === 'eventType' && eventTypeTags.length === 0) {
          setError('At least one event type tag is required');
          return;
        }
        if (tagInfo.category === 'carRequirements' && carRequirementTags.length === 0) {
          setError('At least one car requirement tag is required');
          return;
        }
      }

      newTags = [...selectedTags, tag];
    }

    setSelectedTags(newTags);
    onChange(newTags);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-gray-600">
        <FontAwesomeIcon icon={faTag} className="text-gray-400" />
        <span className="text-sm font-medium">{helperText}</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {getValidTags().map(tag => {
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

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default TagManager; 