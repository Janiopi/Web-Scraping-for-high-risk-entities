import { Ofac } from './scrapers/ofac.js';
import { TheWorldBank } from './scrapers/theWorldBank.js';
import { OffshoreLeaksScraper } from './scrapers/offshoreLeaks.js';

import { v4 as uuidv4 } from 'uuid';

class SearchService {
  constructor() {
    this.scrapers = {
      OffshoreLeaksScraper: new OffshoreLeaksScraper(),
      Ofac: new Ofac(),
      TheWorldBank: new TheWorldBank(),
    };
  }

  // Get available sources
  getAvailableSources() {
    return Object.keys(this.scrapers).map((key) => ({
      key,
      name: this.getSourceDisplayName(key),
      description: this.getSourceDescription(key),
    }));
  }

  // Helper method to get display names
  getSourceDisplayName(key) {
    const displayNames = {
      OffshoreLeaksScraper: 'Offshore Leaks Database',
      Ofac: 'OFAC Sanctions List',
      TheWorldBank: 'World Bank Debarred Firms',
    };
    return displayNames[key] || key;
  }

  // Helper method to get source descriptions
  getSourceDescription(key) {
    const descriptions = {
      OffshoreLeaksScraper:
        'International Consortium of Investigative Journalists offshore entities database',
      Ofac: 'US Treasury Office of Foreign Assets Control sanctions list',
      TheWorldBank: 'World Bank list of debarred firms and individuals',
    };
    return descriptions[key] || 'No description available';
  }

  async search(entityName, selectedSources = null) {
    // Validate input
    if (!entityName || typeof entityName !== 'string') {
      throw new Error('Entity name is required and must be a string');
    }

    // Unique ID
    const searchId = uuidv4();
    console.log(`Starting search for "${entityName}" with ID: ${searchId}`);

    try {
      // Determine which sources to use
      const availableSources = Object.keys(this.scrapers);
      let sources;

      if (
        selectedSources &&
        Array.isArray(selectedSources) &&
        selectedSources.length > 0
      ) {
        // Validate selected sources exist
        const invalidSources = selectedSources.filter(
          (source) => !availableSources.includes(source)
        );
        if (invalidSources.length > 0) {
          throw new Error(
            `Invalid sources: ${invalidSources.join(
              ', '
            )}. Available sources: ${availableSources.join(', ')}`
          );
        }
        sources = selectedSources;
        console.log(`Using selected sources: ${sources.join(', ')}`);
      } else {
        // Use all available sources if none specified
        sources = availableSources;
        console.log(`Using all available sources: ${sources.join(', ')}`);
      }

      // Create search promises for each scraper
      const searchPromises = sources.map(async (source) => {
        try {
          console.log(`Searching in ${source}...`);
          const result = await this.scrapers[source].search(entityName);
          return { source, status: 'success', data: result };
        } catch (error) {
          console.error(`Error in ${source}:`, error.message);
          return { source, status: 'error', error: error.message, data: null };
        }
      });

      const results = await Promise.all(searchPromises);

      const searchResult = {
        searchId,
        timestamp: new Date().toISOString(),
        entityName,
        sources,
        availableSources,
        results,
        summary: {
          total: results.length,
          successful: results.filter((r) => r.status === 'success').length,
          failed: results.filter((r) => r.status === 'error').length,
        },
      };

      console.log(
        `Search completed for "${entityName}". Summary:`,
        searchResult.summary
      );
      return searchResult;
    } catch (error) {
      console.error(`Search failed for "${entityName}":`, error.message);
      throw new Error(`Search service error: ${error.message}`);
    }
  }
}

export { SearchService };

/*
// Test
const searchService = new SearchService();
const results = await searchService.search('test');

console.log('\nRESULTS...');
console.dir(results, { depth: null, colors: true });
*/
