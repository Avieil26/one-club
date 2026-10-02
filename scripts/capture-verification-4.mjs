import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = path.resolve('temp_edge_cdp_verify4');

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, urlPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.html' ? 'text/html; charset=utf-8' : ext === '.js' ? 'application/javascript; charset=utf-8' : 'application/octet-stream';
  if (ext === '.html') {
    fs.readFile(filePath, 'utf8', (err, html) => {
      const injection = `<script>try { localStorage.setItem('fc27_demo_user', 'admin'); localStorage.setItem('futz-terms-accepted-admin', '2026-09-28-v1'); } catch(e){}</script>`;
      res.writeHead(200, { 'Content-Type': mime });
      res.end(html.replace('<head>', `<head>${injection}`));
    });
    return;
  }
  fs.readFile(filePath, (err, data) => {
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  await new Promise((resolve) => server.listen(5093, '127.0.0.1', resolve));

  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9227',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    'about:blank',
  ]);

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9227/json/version');
      if (res.ok) break;
    } catch {}
    await sleep(200);
  }

  const listRes = await fetch('http://127.0.0.1:9227/json/list');
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
    fs.writeFileSync(path.resolve(filename), Buffer.from(shot.data, 'base64'));
  }

  await send('Page.navigate', { url: 'http://127.0.0.1:5093/' });
  await sleep(4000);

  // Click SBC
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const els = Array.from(document.querySelectorAll('*'));
        const tab = els.reverse().find(e => (e.innerText||'').trim() === 'SBC');
        if (tab) tab.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      })()
    `,
  });
  await sleep(2000);

  // Click Italy vs Belgium
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const els = Array.from(document.querySelectorAll('*'));
        const tile = els.reverse().find(e => (e.innerText||'').includes('Italy') || (e.innerText||'').includes('איטליה'));
        if (tile) tile.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      })()
    `,
  });
  await sleep(2500);

  // Scroll down under pitch to capture buttons
  await send('Runtime.evaluate', { expression: `window.scrollBy(0, 500);` });
  await sleep(1500);
  await take('preview-verify-sbc-buttons.png');

  // Navigate to Haaland in players
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const els = Array.from(document.querySelectorAll('*'));
        const tab = els.reverse().find(e => (e.innerText||'').trim() === 'שחקנים');
        if (tab) tab.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      })()
    `,
  });
  await sleep(2500);

  // Type haaland in search
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const input = document.querySelector('input');
        if (input) {
          input.focus();
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, 'האלנד');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `,
  });
  await sleep(2500);
  await take('preview-verify-haaland-search.png');

  ws.close();
  edge.kill();
  server.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
