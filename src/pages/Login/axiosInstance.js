import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://seagold-laravel-production.up.railway.app', // Hardcode URL to ensure correctness
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default axiosInstance;

