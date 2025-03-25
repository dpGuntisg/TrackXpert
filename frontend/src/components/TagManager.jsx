import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { faTag } from '@fortawesome/free-solid-svg-icons';
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
          const category = tagInfo.category;
          
          // Determine color based on category
          let colorClasses = "bg-gray-100 text-gray-700 hover:bg-gray-200";
          if (isSelected) {
            switch (category) {
              case 'trackType':
                colorClasses = "bg-blue-100 text-blue-700 hover:bg-blue-200";
                break;
              case 'roadType':
                colorClasses = "bg-green-100 text-green-700 hover:bg-green-200";
                break;
              case 'carType':
                colorClasses = "bg-purple-100 text-purple-700 hover:bg-purple-200";
                break;
              case 'eventType':
                colorClasses = "bg-red-100 text-red-700 hover:bg-red-200";
                break;
              case 'specialFeatures':
                colorClasses = "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
                break;
              case 'carRequirements':
                colorClasses = "bg-indigo-100 text-indigo-700 hover:bg-indigo-200";
                break;
              default:
                colorClasses = "bg-gray-100 text-gray-700 hover:bg-gray-200";
                break;
            }
          }

          return (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${colorClasses}`}
            >
              {tagInfo.label}
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