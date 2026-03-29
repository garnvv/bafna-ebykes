import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://bafna-ebykes.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('bafna_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
