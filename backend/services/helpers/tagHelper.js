// Define the tag categories and their valid values
const TRACK_TAG_CATEGORIES = {
    trackType: ['rally_stage', 'hill_climb', 'circuit', 'off_road', 'circuit_race'],
    roadType: ['tarmac', 'gravel', 'dirt', 'snow'],
    carType: ['road_car', 'sports_car', 'rally_car', 'formula_car']
};

const EVENT_TAG_CATEGORIES = {
    eventType: ['track_day', 'race', 'rally_event', 'drift_event', 'championship'],
    specialFeatures: ['night_event', 'international', 'beginner_friendly', 'advanced'],
    carRequirements: ['all_cars', 'road_cars_only', 'sports_cars_only', 'rally_cars_only', 'electric_cars_only', 'formula_cars_only']
};

// Get all valid tag values
export const getValidTags = () => {
    return Object.values(TRACK_TAG_CATEGORIES).reduce((acc, category) => {
        return [...acc, ...category];
    }, []);
};

// Get tag category
export const getTagCategory = (tag) => {
    for (const [category, tags] of Object.entries(TRACK_TAG_CATEGORIES)) {
        if (tags.includes(tag)) {
            return category;
        }
    }
    return null;
};

// Validate track tags
export const validateTrackTags = (tags) => {
    if (!tags || !Array.isArray(tags)) {
        throw new Error("Tags must be an array");
    }

    // Check total number of tags
    if (tags.length > 5) {
        throw new Error("Track cannot have more than 5 tags total");
    }

    // Check track type tags limit
    const trackTypeTags = tags.filter(tag => TRACK_TAG_CATEGORIES.trackType.includes(tag));
    if (trackTypeTags.length > 2) {
        throw new Error("Track cannot have more than 2 track type tags");
    }

    // Validate tag values
    const validTags = getValidTags();
    const invalidTags = tags.filter(tag => !validTags.includes(tag));
    if (invalidTags.length > 0) {
        throw new Error(`Invalid tags: ${invalidTags.join(', ')}`);
    }

    return true;
};

// Validate event tags
export const validateEventTags = (tags) => {
    if (!tags || !Array.isArray(tags)) {
        throw new Error("Tags must be an array");
    }

    // Check if there's at least one event type tag
    const eventTypeTags = tags.filter(tag => EVENT_TAG_CATEGORIES.eventType.includes(tag));
    if (eventTypeTags.length === 0) {
        throw new Error("Event must have at least one event type tag");
    }

    // Check if there's at least one car requirement tag
    const carRequirementTags = tags.filter(tag => EVENT_TAG_CATEGORIES.carRequirements.includes(tag));
    if (carRequirementTags.length === 0) {
        throw new Error("Event must have at least one car requirement tag");
    }

    // Validate tag values
    const validTags = getValidTags();
    const invalidTags = tags.filter(tag => !validTags.includes(tag));
    if (invalidTags.length > 0) {
        throw new Error(`Invalid tags: ${invalidTags.join(', ')}`);
    }

    return true;
}; 