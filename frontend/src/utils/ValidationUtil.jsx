export const validateTrackForm = (values) => {
    if (!values.name || values.name.length < 5) {
        return "Track name must be at least 5 characters long.";
    }
    if (!values.description || values.description.length < 10) {
        return "Track description must be at least 10 characters long.";
    }
    if (values.description.length > 15000) {
        return "Track description is too long.";
    }
    if (!values.location || values.location.length < 5) {
        return "Track location must be at least 5 characters long.";
    }
    if (!values.image) {
        return "Track image is required.";
    }
    return "";
};