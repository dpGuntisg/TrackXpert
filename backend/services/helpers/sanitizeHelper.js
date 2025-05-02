export const sanitizeName = (name) => {
    return name
        .trim()  // Remove leading/trailing spaces
        .replace(/[<>:"/\\|?*]/g, '')  // Remove special characters
        .replace(/\s+/g, ' ');  // Replace multiple spaces with a single one
};
