import {
  faTag,
  faFlagCheckered,
  faRoad,
  faCar,
  faStar,
  faCog,
  faLightbulb,
  faClock
} from '@fortawesome/free-solid-svg-icons';

// Universal function to get tag information
export const getTagInfoUniversal = (tag, t) => {
  // Try track categories first
  const trackCategories = ['trackType', 'difficulty', 'surfaceType', 'vehicleType', 'specialFeatures'];
  for (const category of trackCategories) {
    const label = t(`tags.track.${category}.${tag}`);
    if (label && label !== `tags.track.${category}.${tag}`) {
      return { category, label, type: 'track' };
    }
  }

  // Try event categories
  const eventCategories = ['eventType', 'difficulty', 'vehicleRequirements', 'specialFeatures', 'eventFormat'];
  for (const category of eventCategories) {
    const label = t(`tags.event.${category}.${tag}`);
    if (label && label !== `tags.event.${category}.${tag}`) {
      return { category, label, type: 'event' };
    }
  }

  return null;
};

// Function to get appropriate icon for a tag category
export const getTagIcon = (category) => {
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
    case 'availability':
      return faClock;
    default:
      return faTag;
  }
};