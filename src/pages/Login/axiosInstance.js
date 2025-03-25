import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_LARAVEL_URL, // Use environment variable
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default axiosInstance;

