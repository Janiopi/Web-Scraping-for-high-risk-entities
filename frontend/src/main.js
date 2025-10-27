// Main app

import AppComponent from './components/AppComponent.js';

class App {
  constructor() {
    this.appComponent = null;
    this.init();
  }

  init() {
    console.log('Starting Web Scraping App with Authentication...');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  async start() {
    try {
      const appContainer = document.getElementById('app');

      if (!appContainer) {
        console.error('App container not found');
        return;
      }

      console.log('App container found, initializing...');

      // Initialize the main app component with authentication
      this.appComponent = new AppComponent();

      console.log('App initialized successfully');
    } catch (error) {
      console.error(' Error starting app:', error);
      this.showError('Error al inicializar la aplicación');
    }
  }

  showError(message) {
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gray-50">
          <div class="text-center">
            <i class="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p class="text-gray-600 mb-4">${message}</p>
            <button 
              onclick="location.reload()" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              <i class="fas fa-refresh mr-2"></i>Recargar
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Start the application
new App();
