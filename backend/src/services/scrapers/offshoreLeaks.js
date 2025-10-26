import puppeteer from 'puppeteer';

class OffshoreLeaksScraper {
  async search(entityName) {
    console.log(` Searching ${entityName} in OffShore Leaks DataBase`);
    try {
      // Puppeteer will simulate a client visiting the site
      const browser = await puppeteer.launch({ headless: false, slowMo: 300 }); //In case of offShoreLeaks, it detects bots
      const page = await browser.newPage();

      //Navigate to the page and search
      await page.goto('https://offshoreleaks.icij.org');

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

      // Type the search term
      await page.type('input[name="q"]', entityName);

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
