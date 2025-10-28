import puppeteer from 'puppeteer';

class TheWorldBank {
  async search(entityName) {
    console.log(` Searching ${entityName} in The World Bank`);
    try {
      const browser = await puppeteer.launch({
        headless: true, //process.env.NODE_ENV === 'production',
        slowMo: 400,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      }); // Puppeteer will simulate a client visiting the site
      const page = await browser.newPage();

      //Navigate to the page and search
      await page.goto(
        'https://projects.worldbank.org/en/projects-operations/procurement/debarred-firms'
      );

      // Now wait for the main search page to load
      await page.waitForSelector('#category', { timeout: 10000 }); // Id category

      // Type the search term
      await page.type('#category', entityName);

      // Wait for the k-debarred-firms table to load
      await page.waitForSelector('#k-debarred-firms tbody tr', {
        timeout: 40000,
      });

      // Numbers of rows from k-debarred-firms table
      let count = 0;
      count = await page.$$eval(
        '#k-debarred-firms tbody tr',
        (rows) => rows.length
      );

      // Extract data from the k-debarred-firms table
      const results = await page.$$eval(
        '#k-debarred-firms tbody tr',
        (rows) => {
          return rows.map((row) => {
            const cells = row.querySelectorAll('td');
            return {
              firmName: cells[0]?.textContent?.trim() || '',
              // additionalInfo: cells[1]?.textContent?.trim() || '',
              address: cells[2]?.textContent?.trim() || '',
              country: cells[3]?.textContent?.trim() || '',
              fromDate: cells[4]?.textContent?.trim() || '',
              toDate: cells[5]?.textContent?.trim() || '',
              grounds: cells[6]?.textContent?.trim() || '',
            };
          });
        }
      );

      await browser.close();

      return {
        source: 'The World Bank',
        count,
        results,
      };
    } catch (error) {
      console.log(`Error searching in Offshore Leaks: ${error.message}`);
      throw new Error(`Error al buscar en Offshore Leaks: ${error.message}`);
    }
  }
}

export { TheWorldBank };
