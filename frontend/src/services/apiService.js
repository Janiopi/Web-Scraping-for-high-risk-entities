import axios from 'axios';
import authService from './authService.js';

class ApiService {
  constructor() {
    this.baseURL =
      'https://web-scraping-for-high-risk-entities-lwp7.onrender.com/api'; // Backend endpoint
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 120000, // 2 minutes timeout for scraping operations
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor to add auth token automatically
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(' Adding auth token to request');
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor for managing auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('Authentication failed, logging out');
          authService.logout();
          // Opcionalmente redirigir al login
          window.dispatchEvent(new CustomEvent('auth-logout'));
        }
        return Promise.reject(error);
      }
    );
  }

  async searchEntity(entityName) {
    try {
      const response = await this.api.get('/search', {
        params: { entityName },
      });
      console.log('API Response:', response.data);

      // Backend returns { success: true, data: { results: [...], message:  } }
      // We need to return { results: [...] } for the frontend
      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Search failed');
      } else if (error.request) {
        throw new Error(
          'Unable to connect to the server. Please check if the backend is running.'
        );
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  async checkHealth() {
    try {
      // Use axios directly for health check
      const response = await axios.get(
        'https://web-scraping-for-high-risk-entities-lwp7.onrender.com/health',
        {
          timeout: 5000,
        }
      );
      console.log('Health check response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw new Error('Backend server is not responding');
    }
  }
}

export default new ApiService();
