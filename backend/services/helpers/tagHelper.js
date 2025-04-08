// Define the tag categories and their valid values
const TRACK_TAG_CATEGORIES = {
    trackType: [
        'road_course', 'circuit', 'rally_stage', 'hill_climb', 'off_road', 
        'karting_track', 'drift_circuit', 'time_attack', 'training_course',
        'endurance_circuit', 'drag_strip', 'autocross', 'motocross', 'supercross'
    ],
    difficulty: [
        'beginner', 'intermediate', 'advanced', 'professional', 'expert',
        'novice', 'club', 'national', 'international', 'championship'
    ],
    surfaceType: [
        'tarmac', 'gravel', 'dirt', 'snow', 'ice', 'mixed', 'wet', 'dry',
        'concrete', 'asphalt', 'grass', 'sand', 'mud', 'paved', 'unpaved'
    ],
    vehicleType: [
        'road_car', 'sports_car', 'rally_car', 'formula_car', 'kart',
        'drift_car', 'time_attack_car', 'endurance_car', 'drag_car',
        'off_road_vehicle', 'motorcycle', 'supercar', 'hypercar', 'classic_car'
    ],
    specialFeatures: [
        'night_lights', 'pit_lane', 'grandstand', 'medical_center',
        'fuel_station', 'garage_boxes', 'spectator_areas', 'timing_system',
        'video_surveillance', 'safety_car', 'medical_car', 'training_facilities',
        'restaurant', 'hotel', 'camping'
    ]
};

const EVENT_TAG_CATEGORIES = {
    eventType: [
        'track_day', 'race', 'rally_event', 'drift_event', 'championship',
        'time_attack', 'endurance_race', 'training_session', 'karting_event',
        'drag_race', 'autocross', 'hill_climb', 'track_walk', 'driver_training',
        'corporate_event', 'media_event', 'test_session'
    ],
    difficulty: [
        'beginner', 'intermediate', 'advanced', 'professional', 'expert',
        'novice', 'club', 'national', 'international', 'championship'
    ],
    vehicleRequirements: [
        'all_cars', 'road_cars_only', 'sports_cars_only', 'rally_cars_only',
        'formula_cars_only', 'karts_only', 'drift_cars_only', 'time_attack_cars',
        'endurance_cars', 'drag_cars', 'off_road_vehicles', 'motorcycles',
        'supercars', 'hypercars', 'classic_cars'
    ],
    specialFeatures: [
        'night_event', 'international', 'beginner_friendly', 'advanced',
        'professional_coaching', 'data_logging', 'video_analysis', 'pit_lane_access',
        'media_coverage', 'prize_money', 'trophies', 'championship_points',
        'qualifying_session', 'practice_session', 'warm_up'
    ],
    eventFormat: [
        'single_day', 'multi_day', 'championship_round', 'qualifying_round',
        'knockout', 'time_trial', 'endurance', 'sprint', 'team_event',
        'individual', 'pairs', 'relay', 'elimination', 'points_series'
    ]
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
    if (tags.length > 8) {
        throw new Error("Track cannot have more than 8 tags total");
    }

    // Check track type tags limit
    const trackTypeTags = tags.filter(tag => TRACK_TAG_CATEGORIES.trackType.includes(tag));
    if (trackTypeTags.length > 2) {
        throw new Error("Track cannot have more than 2 track type tags");
    }

    // Check difficulty tags limit
    const difficultyTags = tags.filter(tag => TRACK_TAG_CATEGORIES.difficulty.includes(tag));
    if (difficultyTags.length > 1) {
        throw new Error("Track can only have one difficulty level");
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

    // Check if there's at least one vehicle requirement tag
    const vehicleRequirementTags = tags.filter(tag => EVENT_TAG_CATEGORIES.vehicleRequirements.includes(tag));
    if (vehicleRequirementTags.length === 0) {
        throw new Error("Event must have at least one vehicle requirement tag");
    }

    // Check difficulty tags limit
    const difficultyTags = tags.filter(tag => EVENT_TAG_CATEGORIES.difficulty.includes(tag));
    if (difficultyTags.length > 1) {
        throw new Error("Event can only have one difficulty level");
    }

    // Check total number of tags
    if (tags.length > 10) {
        throw new Error("Event cannot have more than 10 tags total");
    }

    // Validate tag values
    const validTags = Object.values(EVENT_TAG_CATEGORIES).reduce((acc, category) => {
        return [...acc, ...category];
    }, []);
    const invalidTags = tags.filter(tag => !validTags.includes(tag));
    if (invalidTags.length > 0) {
        throw new Error(`Invalid tags: ${invalidTags.join(', ')}`);
    }

    return true;
}; 