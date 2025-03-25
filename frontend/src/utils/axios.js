import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // This is important for sending cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosInstance; 