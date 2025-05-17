
//Returns a query object that only includes non-archived items
export const activeOnly = (query = {}) => {
    return { ...query, isArchived: { $ne: true } };
};

//Checks if content should be visible based on archive status
export const isContentVisible = (content, includeArchived = false) => {
    if (!content) return false;
    return includeArchived || !content.isArchived;
}; 