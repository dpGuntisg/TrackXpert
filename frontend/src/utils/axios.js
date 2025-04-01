import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Validate URL to prevent SSRF attacks
const isValidUrl = (url) => {
    try {
        const parsedUrl = new URL(url.startsWith('http') ? url : `${API_BASE_URL}${url}`);
        // Allow relative URLs and requests to your API domain
        return url.startsWith('/') || parsedUrl.origin === new URL(API_BASE_URL).origin;
    } catch (error) {
        return false;
    }
};

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // This is important for sending cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to validate URLs
axiosInstance.interceptors.request.use(
    (config) => {
        // Validate the URL before making the request
        if (config.url && !isValidUrl(config.url)) {
            return Promise.reject(new Error('Invalid URL: Potential SSRF attack detected'));
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance; 