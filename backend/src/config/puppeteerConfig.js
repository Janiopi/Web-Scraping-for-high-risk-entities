// Puppeteer configuration for production deployment
export const getPuppeteerConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      headless: 'new', // Use new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--user-data-dir=/tmp/chrome-user-data',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-pings',
        '--window-size=1366,768',
      ],
      // Use Chrome from system
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        '/usr/bin/google-chrome-stable',
    };
  }

  // Development configuration
  return {
    headless: true,
    slowMo: 400,
    args: [],
  };
};
