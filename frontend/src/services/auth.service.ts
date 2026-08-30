// frontend/src/services/auth.service.ts
import axios from 'axios';
import type { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Export the api instance
export { api };

class AuthService {
  async login(): Promise<User> {
    try {
      console.log('🔐 Attempting login...');
      const response = await api.post('/api/auth/login');
      console.log('🔐 Login response:', response);
      if (response.data.status === 'success') {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error('🔐 Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🔐 Logging out...');
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('🔐 Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('🔐 Getting current user...');
      const response = await api.get('/api/auth/me');
      console.log('🔐 Get user response:', response);
      if (response.data.status === 'success') {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('🔐 Get user error:', error);
      return null;
    }
  }
}

export default new AuthService();