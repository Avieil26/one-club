import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = path.resolve('temp_edge_cdp_profile');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) break;
    } catch {}
    await sleep(200);
  }

  const listRes = await fetch('http://127.0.0.1:9222/json/list');
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

  await send('Network.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
  });

  console.log('Navigating to root...');
  await send('Page.navigate', { url: 'http://127.0.0.1:5055/' });

  // Wait for initial render
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    const evalRes = await send('Runtime.evaluate', {
      expression: 'document.body.innerText.includes("Futz")',
    });
    if (evalRes?.result?.value) {
      console.log('Page ready after', (i + 1) * 500, 'ms');
      break;
    }
  }

  await sleep(1500);

  async function clickTab(text) {
    console.log(`Clicking tab: "${text}"...`);
    const res = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const els = Array.from(document.querySelectorAll('*'));
          const target = els.reverse().find(el => {
            const t = (el.innerText || el.textContent || '').trim();
            return t === '${text}';
          });
          if (target) {
            target.click();
            return true;
          }
          return false;
        })()
      `,
    });
    console.log(`Click "${text}" result:`, res?.result?.value);
    await sleep(2500);
  }

  async function take(name) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const out = path.resolve(`tab-${name}.png`);
    fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log(`Captured tab-${name}.png`);
  }

  // 1. Home
  await take('1-home');

  // 2. Career Scout
  await clickTab('קריירה');
  await take('2-career-scout');

  // 3. Career Challenges
  console.log('Switching to career challenges sub-tab...');
  const chClick = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('[role="button"], div, span'));
        const target = btns.find(b => {
          const t = (b.innerText || b.textContent || '').trim();
          return t.includes('אתגרי קריירה') && t.includes('🏆');
        });
        if (target) {
          target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return true;
        }
        return false;
      })()
    `,
  });
  console.log('Career challenge click result:', chClick?.result?.value);
  await sleep(2500);
  await take('3-career-challenges');

  // 4. Ultimate
  await clickTab('אולטימייט');
  await take('4-ultimate');

  // 5. SBC
  await clickTab('SBC');
  await take('5-sbc');

  // 6. Market (שחקנים)
  await clickTab('שחקנים');
  await take('6-market');

  // 7. Grounds (גראונדס)
  await clickTab('גראונדס');
  await take('7-grounds');

  ws.close();
  edge.kill();
  console.log('All tabs captured!');
}

run().catch(console.error);
