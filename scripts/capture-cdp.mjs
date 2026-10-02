import fs from 'node:fs';

async function cdp(ws, method, params = {}) {
  const id = Math.floor(Math.random() * 1000000);
  return new Promise((resolve, reject) => {
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function main() {
  const targetsRes = await fetch('http://127.0.0.1:9222/json/new?https://fc27-israel.vercel.app', { method: 'PUT' });
  const target = await targetsRes.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  await new Promise((res) => ws.addEventListener('open', res));
  console.log('Connected to page websocket');

  await cdp(ws, 'Page.enable');
  await cdp(ws, 'Runtime.enable');

  // Exact 1080x1920 physical mobile resolution (360x640 CSS @ 3x DPR)
  await cdp(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 640,
    deviceScaleFactor: 3,
    mobile: true,
    fitWindow: false,
  });

  await cdp(ws, 'Emulation.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
  });

  console.log('Waiting for initial load...');
  await sleep(4000);

  // Check if we need to login or bypass gate
  const evalResult = await cdp(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        // Accept cookie banner if present
        const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'));
        const cookieBtn = buttons.find(b => b.textContent && b.textContent.includes('הבנתי'));
        if (cookieBtn) cookieBtn.click();

        // Check if on register/login screen: click staff -> admin
        const staffBtn = buttons.find(b => b.textContent && b.textContent.includes('כניסת צוות'));
        if (staffBtn) {
          staffBtn.click();
          setTimeout(() => {
            const adminBtn = Array.from(document.querySelectorAll('button, div[role="button"]')).find(b => b.textContent && b.textContent.includes('אביאל'));
            if (adminBtn) adminBtn.click();
          }, 300);
          return 'clicked_staff';
        }
        return 'no_staff_btn';
      })()
    `,
  });
  console.log('Eval login result:', evalResult.result?.value);
  await sleep(3000);

  async function takeShot(name) {
    const shot = await cdp(ws, 'Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
    });
    const filePath = `C:/temp/${name}.png`;
    fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved ${filePath}`);
    return filePath;
  }

  // 1. Home / Feed
  await takeShot('mobile-1080x1920-home');

  // 2. Career Scout
  await cdp(ws, 'Runtime.evaluate', {
    expression: `window.location.hash = '#'; window.__router?.push?.('/career') || (window.location.href = '/career');`,
  });
  await sleep(4000);
  await takeShot('mobile-1080x1920-career');

  // 3. Market / Players
  await cdp(ws, 'Runtime.evaluate', {
    expression: `window.location.href = '/market';`,
  });
  await sleep(4000);
  await takeShot('mobile-1080x1920-market');

  // 4. Ultimate
  await cdp(ws, 'Runtime.evaluate', {
    expression: `window.location.href = '/ultimate';`,
  });
  await sleep(4000);
  await takeShot('mobile-1080x1920-ultimate');

  ws.close();
  console.log('Done capturing all mobile 1080x1920 views!');
}

main().catch(console.error);
