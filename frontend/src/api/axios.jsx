import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agregar token JWT a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Renovar automáticamente el token
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/token/refresh/') &&
      localStorage.getItem('refresh_token')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          localStorage.getItem('refresh_token');

        const response = await api.post(
          '/token/refresh/',
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = response.data.access;

        localStorage.setItem(
          'access_token',
          newAccessToken
        );

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        window.location.reload();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;