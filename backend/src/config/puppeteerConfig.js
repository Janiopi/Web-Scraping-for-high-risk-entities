// Puppeteer configuration for production deployment
export const getPuppeteerConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      headless: true,
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
      ],
      // Let Puppeteer find the downloaded Chrome
      executablePath: undefined,
    };
  }

  // Development configuration
  return {
    headless: true,
    slowMo: 400,
    args: [],
  };
};
