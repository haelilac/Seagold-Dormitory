import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://seagold-laravel-production.up.railway.app/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ✅ Attach token to each request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 🔁 Handle expired session or CSRF token
axiosInstance.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axiosInstance.get('/sanctum/csrf-cookie');
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
