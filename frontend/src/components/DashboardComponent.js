import authService from '../services/authService.js';
import SearchComponent from './SearchComponent.js';

class DashboardComponent {
  constructor() {
    this.user = authService.getCurrentUser();
    this.searchComponent = null;
    this.render();
    this.attachEventListeners();
    this.initializeSearch();
  }

  render() {
    const dashboardContainer = document.getElementById('dashboard-container');
    if (!dashboardContainer) return;

    dashboardContainer.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        <!-- Header/Navbar -->
        <nav class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
              <!-- Title -->
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-shield-alt text-2xl text-blue-600"></i>
                </div>
                <div class="ml-3">
                  <h1 class="text-xl font-semibold text-gray-900">
                    Web Scraping for High-Risk Entities
                  </h1>
                  
                </div>
              </div>

              <!-- User menu -->
              <div class="flex items-center space-x-4">
                <!-- User info -->
                <div class="flex items-center space-x-3">
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">
                      <i class="fas fa-user mr-2"></i>${
                        this.user?.username || 'User'
                      }
                    </p>
                    <p class="text-xs text-gray-500">${
                      this.user?.email || ''
                    }</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      this.user?.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }">
                      <i class="fas fa-${
                        this.user?.role === 'admin' ? 'crown' : 'user'
                      } mr-1"></i>
                      ${this.user?.role || 'user'}
                    </span>
                  </div>
                </div>

                <!-- Logout button -->
                <button
                  id="logout-btn"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <i class="fas fa-sign-out-alt mr-2"></i>
                  Log out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <!-- Main content -->
        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <!-- Welcome section -->
          <div class="px-4 py-6 sm:px-0">



            <!-- Search Component Container -->
            <div id="search-container"></div>
          </div>
        </main>
      </div>
    `;
  }

  attachEventListeners() {
    // Logout button
    document
      .getElementById('logout-btn')
      ?.addEventListener('click', async () => {
        try {
          await authService.logout();
          window.dispatchEvent(new CustomEvent('auth-logout'));
        } catch (error) {
          console.error('Logout error:', error);
          // Force logout even if API call fails
          window.dispatchEvent(new CustomEvent('auth-logout'));
        }
      });

    // Listen for auth events
    window.addEventListener('auth-logout', () => {
      this.cleanup();
    });
  }

  initializeSearch() {
    // Initialize the search component in the dashboard
    const searchContainer = document.getElementById('search-container');
    if (searchContainer) {
      // Clear any existing content
      searchContainer.innerHTML = '';

      // Create search component with container
      this.searchComponent = new SearchComponent(searchContainer);
    }
  }

  cleanup() {
    // Clean up any event listeners or resources
    if (this.searchComponent) {
      this.searchComponent = null;
    }
  }

  // Method to refresh user data
  async refreshUserData() {
    try {
      const result = await authService.getProfile();
      if (result.success) {
        this.user = result.user;
        this.render();
        this.attachEventListeners();
        this.initializeSearch();
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }
}

export default DashboardComponent;
