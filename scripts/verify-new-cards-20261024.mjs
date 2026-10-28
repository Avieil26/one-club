import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { loadPlayerCatalogue, loadRepositoryModule } from './load-player-catalogue.mjs';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const cards = JSON.parse(fs.readFileSync('assets/data/recentCards20261024.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('docs/recent-card-art-audit.json', 'utf8'));
const all = loadPlayerCatalogue();
assert.equal(all.length, 20223);
assert.equal(all.filter(c => c.edition === 'recent').length, 76);
assert.equal(new Set(all.map(c => c.id)).size, all.length);
const prior = all.filter(c => c.edition !== 'recent');
assert.equal(prior.length, 20147);
assert.equal(hash(JSON.stringify(prior)), '67e3a91626725de737c61a053b7c389403601cb4b4a711453b23d3bc3f07fe5f');
assert.equal(hash(JSON.stringify(cards)), hash(JSON.stringify(all.filter(c => cards.some(original => original.id === c.id)))));
const { META_ATTRS } = loadRepositoryModule('lib/playerMeta.ts');
const { recentCardMeta, recentCardFor } = loadRepositoryModule('lib/recentCards.ts');
const { RECENT_CARD_ART } = loadRepositoryModule('lib/recentCardArt.ts');
const { EMPTY_FILTERS, playerMatches } = loadRepositoryModule('lib/playerFilter.ts');
assert.equal(all.filter(c => playerMatches(c, {...EMPTY_FILTERS, kind: 'recent'})).length, 76);
assert.equal(Object.keys(RECENT_CARD_ART).length, 76);
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let b = 0; b < 8; b++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
for (const card of cards) {
  assert.equal(card.id, `recent-${card.itemId}`);
  assert.deepEqual(recentCardFor(card.id), card);
  assert.equal(Object.keys(card.attributes).length, 34);
  for (const key of META_ATTRS) assert.equal(typeof recentCardMeta(card).stats[key], 'number', `${card.id} ${key}`);
  for (const value of Object.values(card.attributes)) assert(value >= 0 && value <= 99);
  assert.equal(playerMatches(card, {...EMPTY_FILTERS, kind: 'gold'}), false);
  assert(card.sourceUrl.includes(String(card.itemId)));
  assert(card.artUrl.includes(`27-${card.itemId}.`));
  for (const amount of [card.price.console, card.price.pc]) assert(amount === null || amount > 0, 'Missing price must stay null, not free');
  const data = fs.readFileSync(RECENT_CARD_ART[card.id]);
  const expected = audit.find(a => a.itemId === card.itemId);
  assert.equal(hash(data), expected.sha256);
  assert.equal(data.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
  const chunks = []; let offset = 8, header, ended = false;
  while (offset < data.length) {
    const length = data.readUInt32BE(offset), end = offset + 12 + length;
    assert(end <= data.length, 'Truncated PNG chunk');
    const type = data.toString('ascii', offset + 4, offset + 8);
    assert.equal(crc32(data.subarray(offset+4, end-4)), data.readUInt32BE(end-4), 'PNG CRC');
    if (type === 'IHDR') header = data.subarray(offset+8, end-4);
    if (type === 'IDAT') chunks.push(data.subarray(offset+8, end-4));
    offset = end;
    if (type === 'IEND') { assert.equal(length, 0); ended = true; break; }
  }
  assert(ended && offset === data.length, 'Missing PNG footer');
  const w = header.readUInt32BE(0), h = header.readUInt32BE(4);
  assert.equal(w, expected.width); assert.equal(h, expected.height);
  assert.equal(header[8], 8); assert.equal(header[12], 0);
  const channels = {0:1,2:3,3:1,4:2,6:4}[header[9]];
  assert(channels);
  const pixels = inflateSync(Buffer.concat(chunks)), stride = w * channels + 1;
  assert.equal(pixels.length, stride * h, 'Incomplete PNG pixels');
  for (let y = 0; y < h; y++) assert(pixels[y*stride] <= 4, 'Invalid PNG filter');
}
// Exercise the real endpoint with independent platform sequences and SBC statuses.
const source = fs.readFileSync('api/market-prices.js', 'utf8').replace(/^import .+;\r?\n/gm, '').replace('export const config', 'const config').replace('export default async function handler', 'async function handler');
const fixture = {id0:50562888,d:[50333827,16777216]};
const consoleData = {...fixture,p:[31320,6400000,0],s:[1,0,0]};
const pcData = {id0:100896715,d:[16777216],p:[14000000,0],s:[0,0]};
const mockFetch = async url => ({ok:true,json:async()=>url.endsWith('manifest.json')?{_version:1,'player-prices-index':1,'player-prices-ps5':1,'player-prices-pc':1}:url.includes('index')?fixture:url.includes('ps5')?consoleData:pcData});
const handler = new Function('recentCards','totw7Cards','eaByCard','totw4EaByCard','fetch',`${source}; return handler`)(cards, [], {}, {}, mockFetch);
const response = await handler(); assert.equal(response.status, 200);
const prices = await response.json();
assert.deepEqual(prices['recent-100896715'], [6400000,14000000]);
assert.deepEqual(prices['recent-117673931'], [0,0]);
for (const card of cards.filter(c=>c.price.kind !== 'market')) assert.equal(prices[card.id], undefined);
console.log('PASS: 20,223 unique cards; prior 20,147 unchanged; 51 original exact editions, 34 attributes, CRC/inflated original artwork, missing prices and independent-platform market API fixture.');

// Edition navigation is grouped by stable person identity, never by display name.
const { playerEditionsFor } = loadRepositoryModule('lib/playerEditions.ts');
for (const card of cards) {
  const identity = card.baseId ?? card.id;
  const expected = all.filter(c => (c.baseId ?? c.id) === identity);
  assert.deepEqual(playerEditionsFor(card).map(c=>c.id), expected.map(c=>c.id));
  assert(expected.some(c=>c.id === card.id));
  for (const sibling of expected) assert.deepEqual(playerEditionsFor(sibling), expected, 'Navigation must work back from original editions');
}
assert.deepEqual(playerEditionsFor(all.find(c=>c.id==='recent-100896715')).map(c=>c.id), ['raphinha','raphinha--totw','recent-117673931','recent-100896715']);
assert(playerEditionsFor(all.find(c=>c.id==='recent-100664497')).some(c=>c.id==='hero-zola'));
console.log('PASS: every new edition has all exact same-person catalogue versions, including original and legacy special cards; Raphinha and hero identity navigation verified.');
