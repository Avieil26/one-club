import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';

const OUT_DIR = path.resolve('mobile-previews');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  // 1080x1920 physical resolution (360x640 CSS @ 3x scale factor - standard FHD mobile)
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
  });

  const page = await context.newPage();

  console.log('Navigating to home...');
  await page.goto('https://fc27-israel.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const homePath = path.join(OUT_DIR, 'mobile-home-1080x1920.png');
  await page.screenshot({ path: homePath });
  console.log('Saved:', homePath);

  console.log('Navigating to market...');
  await page.goto('https://fc27-israel.vercel.app/market', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  const marketPath = path.join(OUT_DIR, 'mobile-market-1080x1920.png');
  await page.screenshot({ path: marketPath });
  console.log('Saved:', marketPath);

  console.log('Navigating to career...');
  await page.goto('https://fc27-israel.vercel.app/career', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  const careerPath = path.join(OUT_DIR, 'mobile-career-1080x1920.png');
  await page.screenshot({ path: careerPath });
  console.log('Saved:', careerPath);

  console.log('Navigating to ultimate...');
  await page.goto('https://fc27-israel.vercel.app/ultimate', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  const ultimatePath = path.join(OUT_DIR, 'mobile-ultimate-1080x1920.png');
  await page.screenshot({ path: ultimatePath });
  console.log('Saved:', ultimatePath);

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
