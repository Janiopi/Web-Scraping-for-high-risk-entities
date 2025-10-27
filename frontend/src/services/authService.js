// Handles operations with the backend

const API_BASE_URL = 'http://localhost:3000';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // Log in
  async login(email, password) {
    try {
      console.log('Attempting login for:', email);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Save token and user in  localStorage
        this.token = data.data.token;
        this.user = data.data.user;

        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        console.log('Login successful:', this.user.email);
        return { success: true, user: this.user };
      } else {
        console.error('Login failed:', data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Unable to connect to server. Please try again.',
      };
    }
  }

  // Register

  async register(username, email, password) {
    try {
      console.log('Attempting registration for:', email);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Save token and user in  localStorage
        this.token = data.data.token;
        this.user = data.data.user;

        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        console.log(' Registration successful:', this.user.email);
        return { success: true, user: this.user };
      } else {
        console.error(' Registration failed:', data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error(' Registration error:', error);
      return {
        success: false,
        error: 'Unable to connect to server. Please try again.',
      };
    }
  }

  // Log out
  async logout() {
    try {
      if (this.token) {
        console.log('Logging out user:', this.user?.email);

        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      // Clean data
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Logout completed');
    }
  }

  async getProfile() {
    try {
      if (!this.token) {
        return { success: false, error: 'No authentication token' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        this.user = data.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        return { success: true, user: this.user };
      } else {
        // Token inválido o expirado
        this.logout();
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error(' Profile error:', error);
      return { success: false, error: 'Unable to get profile' };
    }
  }

  isAuthenticated() {
    return !!(this.token && this.user);
  }

  getCurrentUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  getAuthHeaders() {
    if (this.token) {
      return {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  }

  async verifyToken() {
    try {
      if (!this.token) return false;

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Token is valid');
        return true;
      } else {
        console.log('Token is invalid, logging out');
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      this.logout();
      return false;
    }
  }
}

// Unique instance of the service
const authService = new AuthService();

export default authService;
