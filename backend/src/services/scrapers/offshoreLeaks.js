import puppeteer from 'puppeteer';
import { getPuppeteerConfig } from '../../config/puppeteerConfig.js';

class OffshoreLeaksScraper {
  async search(entityName) {
    console.log(` Searching ${entityName} in OffShore Leaks DataBase`);
    try {
      // Get puppeteer config and add anti-detection measures
      const config = getPuppeteerConfig();

      // Add anti-detection args for OffshoreLeaks
      if (process.env.NODE_ENV === 'production') {
        config.args.push(
          '--disable-blink-features=AutomationControlled',
          '--exclude-switches=enable-automation',
          '--disable-plugins-discovery',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );
      } else {
        config.slowMo = 500; // Slower in development for human-like behavior
      }

      const browser = await puppeteer.launch(config); //In case of offShoreLeaks, it detects bots

      const page = await browser.newPage();

      // Anti-detection measures
      await page.evaluateOnNewDocument(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });

        // Mock plugins and languages
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });

        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });

        // Override the `plugins` property to use a custom getter.
        Object.defineProperty(navigator, 'plugins', {
          get: function () {
            return [1, 2, 3, 4, 5];
          },
        });
      });

      // Set a more realistic viewport
      await page.setViewport({ width: 1366, height: 768 });

      // Set additional headers to look more like a real browser
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
      });

      //Navigate to the page and search with more realistic options
      await page.goto('https://offshoreleaks.icij.org', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Random delay to appear more human-like
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      // Accept terms and conditions
      // Wait for the modal to appear
      await page.waitForSelector('.modal-body', { timeout: 10000 });

      // Click the checkbox to accept terms in the modal
      await page.click('#accept');

      // Click the Submit button in the modal to proceed
      await page.click(
        'button[type="submit"].btn.btn-primary.btn-block.btn-lg'
      );

      // Now wait for the main search page to load
      await page.waitForSelector('input[name="q"]', { timeout: 10000 });

      // Type the search term slowly to simulate human typing
      await page.type('input[name="q"]', entityName, { delay: 100 });

      // Wait for the search button to be enabled after typing
      await page.waitForSelector('button[type="submit"]:not([disabled])', {
        timeout: 5000,
      });

      // Click the search button
      await page.click('button[type="submit"].btn.btn-primary');

      // Wait for the results table to load
      await page.waitForSelector('tbody tr', { timeout: 30000 });

      // Numbers of coincidences
      let count = 0;
      count = await page.$$eval('tbody tr', (rows) => rows.length);

      // Extract data from the results table
      const results = await page.$$eval('tbody tr', (rows) => {
        return rows.map((row) => {
          const cells = row.querySelectorAll('td');
          return {
            entity: cells[0]?.querySelector('a')?.textContent?.trim() || '',
            // entityLink: cells[0]?.querySelector('a')?.href || '',
            jurisdiction: cells[1]?.textContent?.trim() || '',
            linkedTo: cells[2]?.textContent?.trim() || '',
            dataFrom: cells[3]?.querySelector('a')?.textContent?.trim() || '',
            // sourceLink: cells[3]?.querySelector('a')?.href || '',
          };
        });
      });

      await browser.close();

      return {
        source: 'Offshore Leaks Database',
        count,
        results,
      };
    } catch (error) {
      console.log(`Error searching in Offshore Leaks: ${error.message}`);
      throw new Error(`Error al buscar en Offshore Leaks: ${error.message}`);
    }
  }
}

export { OffshoreLeaksScraper };
