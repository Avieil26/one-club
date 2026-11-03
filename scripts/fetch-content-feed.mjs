#!/usr/bin/env node
// Download a trusted, pre-authorized structured content feed to the staging directory.
// Never scrapes Futbin, never changes production data.
import { mkdir, writeFile } from 'node:fs/promises';
const urlString = process.env.FC_CONTENT_FEED_URL;
if (!urlString) throw new Error('Missing FC_CONTENT_FEED_URL secret; refusing to stage unverified data');
const url = new URL(urlString);
if (url.protocol !== 'https:' || url.username || url.password) throw new Error('HTTPS feed URL required');
const headers = { accept: 'application/json' };
if (process.env.FC_CONTENT_FEED_TOKEN) headers.authorization = 'Bearer ' + process.env.FC_CONTENT_FEED_TOKEN;
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 25000);
try {
  const response = await fetch(url, { headers, signal: controller.signal, redirect: 'error' });
  if (!response.ok) throw new Error('Feed HTTP status ' + response.status);
  const size = Number(response.headers.get('content-length') || 0);
  if (size > 5_000_000) throw new Error('Feed too large');
  const body = await response.text();
  if (Buffer.byteLength(body) > 5_000_000) throw new Error('Feed too large');
  const json = JSON.parse(body);
  if (json.source !== 'authorized' || json.sourceUrl !== url.origin) {
    throw new Error('Feed provenance mismatch');
  }
  await mkdir('artifacts/content-sync', { recursive: true });
  await writeFile('artifacts/content-sync/feed.json', JSON.stringify(json) + '\n', { mode: 0o600 });
  console.log('Downloaded authorized feed for review; no deployment performed');
} finally {
  clearTimeout(timer);
}
