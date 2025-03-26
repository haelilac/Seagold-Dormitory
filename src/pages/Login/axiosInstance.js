import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://seagold-laravel-production.up.railway.app/', // deployed backend URL
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
        const refreshResponse = await axiosInstance.post('/api/auth/refresh-token');
        const newToken = refreshResponse.data.access_token;

        localStorage.setItem('token', newToken); // Save new token
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${newToken}`; // Set the new token in the headers

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`; // Retry the failed request with the new token

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;
