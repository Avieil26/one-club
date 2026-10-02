import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
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

  // If path doesn't have an extension, try file, file.html, or fallback to index.html (SPA routing)
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
  localStorage.setItem('futz-terms-accepted-maya', '2026-09-28-v1');
  localStorage.setItem('futz-terms-accepted-noam', '2026-09-28-v1');
  localStorage.setItem('futz-cookie-notice', 'essential-2026-09-27');
  const dbKey = 'fc27-community-db-v1';
  let raw = localStorage.getItem(dbKey);
  if (raw) {
    try {
      let parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        parsed.sessionUserId = 'admin';
        localStorage.setItem(dbKey, JSON.stringify(parsed));
      }
    } catch (e) {}
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

server.listen(5055, '127.0.0.1', () => {
  console.log('Local dist server listening on http://127.0.0.1:5055');
});
