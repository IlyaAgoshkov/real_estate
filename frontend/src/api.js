import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.13:8000/apartments/api',
  headers: { 'Content-Type': 'application/json' },
});

// Добавляем токен в каждый запрос, если он есть
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }
  return config;
});

export default api; 