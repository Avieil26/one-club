const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://localhost:8090', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText('כניסה כמנהל', { exact: false }).waitFor({ timeout: 90000 });
  await page.getByText('כניסה כמנהל', { exact: false }).click();
  await page.getByText('שלום, אביאל').waitFor({ timeout: 15000 });
  await page.getByText('תור אישור').click();
  await page.getByText('הפועל רמת גן').waitFor();
  await page.getByRole('button', { name: 'אישור' }).first().click();
  await page.getByText('הפועל רמת גן').waitFor({ state: 'detached', timeout: 10000 });
  await page.goBack();
  await page.getByText('קריירה', { exact: true }).click();
  await page.getByText('רק שחקני אקדמיה עד ינואר').first().waitFor();
  await page.getByText('אולטימייט', { exact: true }).click();
  await page.getByText('4-2-3-1').first().waitFor();
  await page.getByText('גראונדס', { exact: true }).click();
  await page.getByText('וואטסאפ').first().waitFor();
  await page.getByText('SBC', { exact: true }).click();
  await page.getByText('מחשבון Streamlined').click();
  await page.getByText('הכל מדירוג 75').first().waitFor();
  const body = await page.locator('body').innerText();
  if (!body.includes('20000')) throw new Error('calculator target missing');
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('web flow passed');
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
