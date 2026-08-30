import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

export interface User {
  id: string;
  email: string;
  name: string | null;
}

class AuthService {
  async login(): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`);
      if (response.data.status === 'success') {
        return response.data.data;
      }
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`);
      if (response.data.status === 'success') {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
}

export default new AuthService();