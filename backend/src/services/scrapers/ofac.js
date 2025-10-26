import puppeteer from 'puppeteer';

class Ofac {
  async search(entityName) {
    console.log(` Searching ${entityName} in Ofac sanctions list`);
    try {
      const browser = await puppeteer.launch({ headless: false, slowMo: 400 }); // Puppeteer will simulate a client visiting the site
      const page = await browser.newPage();

      //Navigate to the page and search
      await page.goto('https://sanctionssearch.ofac.treas.gov/');

      // Now wait for the main search page to load
      await page.waitForSelector('#ctl00_MainContent_txtLastName', {
        timeout: 10000,
      });

      // Type the search term
      await page.type('#ctl00_MainContent_txtLastName', entityName);

      // Click the search button
      await page.click('#ctl00_MainContent_btnSearch');

      // Wait for the results table to load
      await page.waitForSelector('#scrollResults', {
        timeout: 30000,
      });

      // Get the results count (number of table rows)
      let count = 0;
      count = await page.$$eval(
        '#gvSearchResults tbody tr',
        (rows) => rows.length
      );

      // Extract data from the OFAC results table
      const results = await page.$$eval('#gvSearchResults tbody tr', (rows) => {
        return rows.map((row) => {
          const cells = row.querySelectorAll('td');
          return {
            name: cells[0]?.querySelector('a')?.textContent?.trim() || '',
            // detailsLink: cells[0]?.querySelector('a')?.href || '',
            address: cells[1]?.textContent?.trim() || '',
            type: cells[2]?.textContent?.trim() || '',
            programs: cells[3]?.textContent?.trim() || '',
            list: cells[4]?.textContent?.trim() || '',
            score: cells[5]?.textContent?.trim() || '',
          };
        });
      });

      await browser.close();
      // console.log('Results:', results);
      // console.log('Count:', count);

      return {
        source: 'OFAC Sanctions List',
        count,
        results,
      };
    } catch (error) {
      console.log(`Error searching in Offshore Leaks: ${error.message}`);
      throw new Error(`Error al buscar en Offshore Leaks: ${error.message}`);
    }
  }
}

export { Ofac };

/*
// Test
const offShoreLeak = new Ofac();
offShoreLeak.search('Test ');
*/
