import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://seagold-laravel-production.up.railway.app/', 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Automatically refresh token if it expires
axiosInstance.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axiosInstance.get('/sanctum/csrf-cookie'); // Refresh CSRF token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
