import api from './api';

export const authService = {
  // Login
  async login(username, password) {
    console.log('Login attempt:', { username });
    const response = await api.post('/auth/admin-login', { username, password });
    console.log('Login response:', response);

    // Backend returns { success: true, data: { token, admin } }
    if (response.data && response.data.data && response.data.data.token) {
      localStorage.setItem('admin_token', response.data.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.data.admin));
      console.log('Token saved successfully');
      return response.data;
    } else {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response format');
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
  },

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if authenticated
  isAuthenticated() {
    return !!localStorage.getItem('admin_token');
  },

  // Get token
  getToken() {
    return localStorage.getItem('admin_token');
  },
};
