import authService from '../services/authService.js';
import AuthComponent from './AuthComponent.js';
import DashboardComponent from './DashboardComponent.js';

class AppComponent {
  constructor() {
    this.currentComponent = null;
    this.isAuthenticated = false;
    this.init();
  }

  async init() {
    console.log('Initializing App...');

    // Setup the main container
    this.setupMainContainer();

    // Check if user is already authenticated
    await this.checkAuthStatus();

    // Setup event listeners
    this.setupEventListeners();

    // Render the appropriate component
    this.render();
  }

  setupMainContainer() {
    const app = document.getElementById('app');
    if (!app) {
      console.error('App container not found');
      return;
    }

    app.innerHTML = `
      <!-- Loading overlay -->
      <div id="loading-overlay" class="fixed inset-0 bg-gray-50 z-50 hidden">
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p class="text-gray-600">Loading ...</p>
          </div>
        </div>
      </div>

      <!-- Auth container -->
      <div id="auth-container" class="hidden"></div>

      <!-- Dashboard container -->
      <div id="dashboard-container" class="hidden"></div>

      <!-- Notification container -->
      <div id="notification-container" class="fixed top-4 right-4 z-40"></div>
    `;
  }

  async checkAuthStatus() {
    this.showLoading(true);

    try {
      // Check if we have a token
      if (!authService.isAuthenticated()) {
        console.log('No authentication token found');
        this.isAuthenticated = false;
        return;
      }

      // Verify token is still valid
      const isValid = await authService.verifyToken();

      if (isValid) {
        console.log(
          'User is authenticated:',
          authService.getCurrentUser()?.email
        );
        this.isAuthenticated = true;
      } else {
        console.log('Token is invalid or expired');
        this.isAuthenticated = false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      this.isAuthenticated = false;
    } finally {
      this.showLoading(false);
    }
  }

  setupEventListeners() {
    // Listen for successful authentication
    window.addEventListener('auth-success', (event) => {
      console.log('Authentication successful:', event.detail);
      this.isAuthenticated = true;
      this.showNotification(' Session initialized correctly', 'success');
      setTimeout(() => {
        this.render();
      }, 1000);
    });

    // Listen for logout events
    window.addEventListener('auth-logout', () => {
      console.log('User logged out');
      this.isAuthenticated = false;
      this.showNotification('Session closed correctly', 'info');
      this.render();
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.render();
    });
  }

  render() {
    console.log(' Rendering app, authenticated:', this.isAuthenticated);

    // Clean up current component
    this.cleanup();

    if (this.isAuthenticated) {
      this.renderDashboard();
    } else {
      this.renderAuth();
    }
  }

  renderAuth() {
    console.log('Rendering auth component');

    // Show auth container, hide others
    this.showContainer('auth-container');

    // Create auth component
    this.currentComponent = new AuthComponent();
  }

  renderDashboard() {
    console.log('Rendering dashboard component');

    // Show dashboard container, hide others
    this.showContainer('dashboard-container');

    // Create dashboard component
    this.currentComponent = new DashboardComponent();
  }

  showContainer(containerId) {
    // Hide all containers
    document.getElementById('auth-container')?.classList.add('hidden');
    document.getElementById('dashboard-container')?.classList.add('hidden');

    // Show the specified container
    document.getElementById(containerId)?.classList.remove('hidden');
  }

  showLoading(show = true) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      if (show) {
        overlay.classList.remove('hidden');
      } else {
        overlay.classList.add('hidden');
      }
    }
  }

  showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const id = Date.now();
    const typeClasses = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const typeIcons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-triangle',
      warning: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle',
    };

    const notification = document.createElement('div');
    notification.id = `notification-${id}`;
    notification.className = `mb-4 p-4 border rounded-md shadow-sm ${typeClasses[type]} transform transition-all duration-300 translate-x-full`;

    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <i class="${typeIcons[type]} mr-2"></i>
          <span class="text-sm font-medium">${message}</span>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    container.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Auto remove
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }

  cleanup() {
    if (
      this.currentComponent &&
      typeof this.currentComponent.cleanup === 'function'
    ) {
      this.currentComponent.cleanup();
    }
    this.currentComponent = null;
  }

  // Public methods for external access
  async refreshAuth() {
    await this.checkAuthStatus();
    this.render();
  }

  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      user: authService.getCurrentUser(),
    };
  }
}

export default AppComponent;
