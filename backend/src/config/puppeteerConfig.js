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
      ],
      // Try different Chrome paths for Render
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
