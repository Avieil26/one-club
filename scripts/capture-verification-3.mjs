import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = path.resolve('temp_edge_cdp_verify3');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, urlPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else {
      filePath = path.join(DIST_DIR, 'index.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  if (ext === '.html') {
    fs.readFile(filePath, 'utf8', (err, html) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      const injection = `
<script>
try {
  localStorage.setItem('fc27_demo_user', 'admin');
  localStorage.setItem('futz-terms-accepted-admin', '2026-09-28-v1');
  localStorage.setItem('futz-cookie-notice', 'essential-2026-09-27');
  const dbKey = 'fc27-community-db-v1';
  let raw = localStorage.getItem(dbKey);
  if (raw) {
    let parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      parsed.sessionUserId = 'admin';
      localStorage.setItem(dbKey, JSON.stringify(parsed));
    }
  }
} catch (e) {}
</script>
`;
      const modified = html.replace('<head>', `<head>${injection}`);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(modified);
    });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  await new Promise((resolve) => {
    server.listen(5091, '127.0.0.1', () => {
      console.log('Server running on http://127.0.0.1:5091');
      resolve();
    });
  });

  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9226',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9226/json/version');
      if (res.ok) break;
    } catch {}
    await sleep(200);
  }

  const listRes = await fetch('http://127.0.0.1:9226/json/list');
  const targets = await listRes.json();
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let idCounter = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const { resolve, reject } = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  async function take(filename) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const outPath = path.resolve(filename);
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: ${outPath}`);
  }

  async function clickText(text) {
    console.log(`Clicking "${text}"...`);
    const res = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const els = Array.from(document.querySelectorAll('*'));
          const target = els.reverse().find(el => {
            const t = (el.innerText || el.textContent || '').trim();
            return t === '${text}' || t.includes('${text}');
          });
          if (target) {
            target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            return true;
          }
          return false;
        })()
      `,
    });
    console.log(`Click result:`, res?.result?.value);
    await sleep(2500);
    return res?.result?.value;
  }

  console.log('Navigating to root...');
  await send('Page.navigate', { url: 'http://127.0.0.1:5091/' });

  // Wait for initial render
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    const evalRes = await send('Runtime.evaluate', {
      expression: 'document.body.innerText.includes("10,116")',
    });
    if (evalRes?.result?.value) {
      console.log('Ready!');
      break;
    }
  }

  // 1. Click 'שחקנים' to view Market
  await clickText('שחקנים');
  await sleep(2500);
  await take('preview-verify-market-haaland.png');

  // 2. Click 'SBC'
  await clickText('SBC');
  await sleep(2500);

  // Click on the first SBC challenge (Italy vs Belgium or POTM)
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const els = Array.from(document.querySelectorAll('*'));
        const tile = els.reverse().find(el => {
          const t = (el.innerText || '').trim();
          return t.includes('Italy') || t.includes('איטליה');
        });
        if (tile) {
          tile.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return true;
        }
        return false;
      })()
    `,
  });
  await sleep(3500);
  await take('preview-verify-sbc-screen.png');

  // 3. Click 'צילום פתרון מהמשחק'
  await clickText('צילום פתרון מהמשחק');
  await sleep(3000);
  await take('preview-verify-sbc-upload-page.png');

  ws.close();
  edge.kill();
  server.close();
  console.log('Verification finished!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
