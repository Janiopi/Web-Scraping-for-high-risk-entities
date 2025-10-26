import apiService from '../services/apiService.js';

export class SearchComponent {
  constructor(container) {
    this.container = container;
    this.isLoading = false;
    this.results = null;
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.checkBackendHealth();
  }

  async checkBackendHealth() {
    try {
      await apiService.checkHealth();
      this.showStatus('Backend connected successfully', 'success');
    } catch (error) {
      this.showStatus(
        'Backend server is not running. Please start the backend first.',
        'error'
      );
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-6xl mx-auto p-6">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-800 mb-2">
            <i class="fas fa-search text-blue-600 mr-3"></i>
            High-Risk Entity Search
          </h1>
          <p class="text-gray-600">Search across Offshore Leaks, World Bank, and OFAC databases</p>
        </div>

        <!-- Status Message -->
        <div id="status-message" class="mb-4"></div>

        <!-- Search Form -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <form id="search-form" class="flex gap-4">
            <div class="flex-1">
              <input 
                type="text" 
                id="entity-name" 
                placeholder="Enter entity name to search..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
            </div>
            <button 
              type="submit" 
              id="search-button"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i class="fas fa-search"></i>
              Search
            </button>
          </form>
        </div>

        <!-- Loading Indicator -->
        <div id="loading" class="hidden text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Searching databases... This may take a few moments.</p>
        </div>

        <!-- Results Container -->
        <div id="results-container"></div>
      </div>
    `;
  }

  attachEventListeners() {
    const form = document.getElementById('search-form');
    form.addEventListener('submit', (e) => this.handleSearch(e)); //Will detect when submit
  }

  async handleSearch(e) {
    e.preventDefault();

    const entityName = document.getElementById('entity-name').value;
    if (!entityName) return;

    console.log('Starting search for:', entityName);
    this.setLoading(true);
    this.clearResults();

    try {
      console.log('Calling apiService.searchEntity...');
      const results = await apiService.searchEntity(entityName);
      console.log('Search results received:', results);

      this.displayResults(results);
      this.showStatus(`Search completed for "${entityName}"`, 'success');
    } catch (error) {
      console.error('Search error:', error);
      this.showStatus(error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    const loadingEl = document.getElementById('loading');
    const searchButton = document.getElementById('search-button');

    if (loading) {
      loadingEl.classList.remove('hidden');
      searchButton.disabled = true;
      searchButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Searching...';
    } else {
      loadingEl.classList.add('hidden');
      searchButton.disabled = false;
      searchButton.innerHTML = '<i class="fas fa-search"></i> Search';
    }
  }

  clearResults() {
    document.getElementById('results-container').innerHTML = '';
  }

  displayResults(results) {
    const container = document.getElementById('results-container');
    console.log('Displaying results:', results);

    // Show raw data for debugging
    container.innerHTML = `
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h3 class="font-bold text-green-800"> Search Completed Successfully!</h3>
        <p class="text-green-700 mt-2">Backend responded with data. Here's what we received:</p>
        <pre class="bg-white p-2 rounded text-xs mt-2 overflow-auto max-h-96 border">${JSON.stringify(
          results,
          null,
          2
        )}</pre>
      </div>
    `;

    // If no results structure, show success message
    if (!results.results || results.results.length === 0) {
      container.innerHTML += `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <i class="fas fa-info-circle text-blue-600 text-2xl mb-2"></i>
          <h3 class="text-lg font-semibold text-blue-800">Search Completed</h3>
          <p class="text-blue-700">The backend processed your request successfully.</p>
        </div>
      `;
      return;
    }

    // Transform backend data structure to frontend expected structure
    const transformedResults = results.results.map((sourceResult) => ({
      source: sourceResult.source,
      error: sourceResult.status !== 'success' ? 'Search failed' : null,
      results: sourceResult.data ? sourceResult.data.results : [],
    }));

    const resultsHtml = transformedResults
      .map((sourceResult, index) => {
        const sourceColors = {
          OffshoreLeaksScraper: 'bg-red-50 border-red-200',
          Ofac: 'bg-orange-50 border-orange-200',
          TheWorldBank: 'bg-blue-50 border-blue-200',
        };

        const sourceIcons = {
          OffshoreLeaksScraper: 'fas fa-file-alt text-red-600',
          Ofac: 'fas fa-ban text-orange-600',
          TheWorldBank: 'fas fa-university text-blue-600',
        };

        return `
        <div class="mb-6 ${
          sourceColors[sourceResult.source] || 'bg-gray-50 border-gray-200'
        } border rounded-lg overflow-hidden">
          <div class="p-4 border-b bg-white">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <i class="${
                sourceIcons[sourceResult.source] || 'fas fa-database'
              }"></i>
              ${this.getSourceDisplayName(sourceResult.source)}
              <span class="text-sm font-normal text-gray-500">
                (${sourceResult.results.length} result${
          sourceResult.results.length !== 1 ? 's' : ''
        })
              </span>
            </h3>
            ${
              sourceResult.error
                ? `<p class="text-red-600 text-sm mt-1">Error: ${sourceResult.error}</p>`
                : ''
            }
          </div>
          
          ${
            sourceResult.results.length > 0
              ? `
            <div class="p-4 space-y-4">
              ${sourceResult.results
                .map((result) =>
                  this.renderResultItem(result, sourceResult.source)
                )
                .join('')}
            </div>
          `
              : ''
          }
        </div>
      `;
      })
      .join('');

    container.innerHTML = `
      <div class="space-y-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center gap-2">
            <i class="fas fa-check-circle text-green-600"></i>
            <span class="font-semibold text-green-800">Search Summary</span>
          </div>
          <p class="text-green-700 mt-1">
            Found ${transformedResults.reduce(
              (total, source) => total + source.results.length,
              0
            )} total results 
            across ${transformedResults.length} database${
      transformedResults.length !== 1 ? 's' : ''
    }
          </p>
        </div>
        ${resultsHtml}
      </div>
    `;
  }

  renderResultItem(result, source) {
    const fields = Object.entries(result)
      .filter(([key, value]) => value && key !== 'id')
      .map(
        ([key, value]) => `
        <div class="flex">
          <span class="font-medium text-gray-700 w-24 flex-shrink-0 capitalize">${key}:</span>
          <span class="text-gray-900">${value}</span>
        </div>
      `
      )
      .join('');

    return `
      <div class="bg-white rounded border p-4">
        ${fields}
      </div>
    `;
  }

  getSourceDisplayName(source) {
    const names = {
      OffshoreLeaksScraper: 'Offshore Leaks Database',
      Ofac: 'OFAC Sanctions List',
      TheWorldBank: 'World Bank Debarment',
    };
    return names[source] || source;
  }

  showStatus(message, type) {
    const statusEl = document.getElementById('status-message');
    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle',
    };

    statusEl.innerHTML = `
      <div class="border rounded-lg p-3 ${colors[type] || colors.info}">
        <div class="flex items-center gap-2">
          <i class="${icons[type] || icons.info}"></i>
          <span>${message}</span>
        </div>
      </div>
    `;

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        statusEl.innerHTML = '';
      }, 5000);
    }
  }
}
