/**
 * Builds a MongoDB query object based on the provided filters
 * @param {Object} filters - The filter parameters
 * @returns {Object} MongoDB query object
 */
export const buildTrackQuery = (filters) => {
    const query = {};

    // Search filter
    if (filters.search) {
        query.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { location: { $regex: filters.search, $options: 'i' } }
        ];
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
    }

    // Length filters
    if (filters.minLength || filters.maxLength) {
        query.distance = { $gt: 0 };
        
        if (filters.minLength) {
            query.distance.$gte = parseFloat(filters.minLength);
        }
        if (filters.maxLength) {
            query.distance.$lte = parseFloat(filters.maxLength);
        }
    }

    // Availability filter
    if (filters.availability) {
        if (filters.availability.filterType === 'single' && filters.availability.days.length > 0) {
            query['availability'] = {
                $elemMatch: {
                    $or: filters.availability.days.map(day => ({
                        startDay: { $lte: day },
                        endDay: { $gte: day }
                    }))
                }
            };
        } else if (filters.availability.filterType === 'range' && 
                  filters.availability.rangeDays.from && 
                  filters.availability.rangeDays.to) {
            query['availability'] = {
                $elemMatch: {
                    startDay: { $lte: filters.availability.rangeDays.to },
                    endDay: { $gte: filters.availability.rangeDays.from }
                }
            };
        }
    }

    return query;
}; 