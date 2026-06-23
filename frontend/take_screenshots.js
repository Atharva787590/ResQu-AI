const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'public', 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const pages = [
  { name: 'dashboard', url: 'http://localhost:3000/' },
  { name: 'chat', url: 'http://localhost:3000/chat' },
  { name: 'shelters', url: 'http://localhost:3000/shelters' },
  { name: 'routes', url: 'http://localhost:3000/routes' },
  { name: 'medical', url: 'http://localhost:3000/medical' },
  { name: 'sos', url: 'http://localhost:3000/sos' },
  { name: 'missing', url: 'http://localhost:3000/missing' },
  { name: 'volunteers', url: 'http://localhost:3000/volunteers' },
  { name: 'offline', url: 'http://localhost:3000/offline' }
];

(async () => {
  console.log('Launching Brave Browser...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const p of pages) {
    console.log(`Navigating to ${p.url}...`);
    try {
      await page.goto(p.url, { waitUntil: 'networkidle2' });
      // Wait for Leaflet maps, Recharts animations, and data fetches
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const filePath = path.join(screenshotDir, `${p.name}.png`);
      await page.screenshot({ path: filePath });
      console.log(`Saved screenshot: ${filePath}`);
    } catch (err) {
      console.error(`Failed to capture ${p.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('Done capturing screenshots!');
})();
