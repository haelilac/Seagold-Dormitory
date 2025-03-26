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
        const response = await axiosInstance.post('/api/auth/refresh-token', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const newToken = response.data.access_token;
        if (newToken) {
          localStorage.setItem('token', newToken);
          axiosInstance.defaults.headers['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
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
