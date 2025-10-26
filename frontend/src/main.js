import { SearchComponent } from './components/SearchComponent.js';

class App {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    const appContainer = document.getElementById('app');

    if (!appContainer) {
      console.error('App container not found');
      return;
    }

    // Initialize the search component
    new SearchComponent(appContainer);
  }
}

// Start the application
new App();
