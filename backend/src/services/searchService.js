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

  async search(entityName) {
    // Validate input
    if (!entityName || typeof entityName !== 'string') {
      throw new Error('Entity name is required and must be a string');
    }

    // Unique ID
    const searchId = uuidv4();
    console.log(`Starting search for "${entityName}" with ID: ${searchId}`);

    try {
      // Always search in all available sources
      const sources = Object.keys(this.scrapers);

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
