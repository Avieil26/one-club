#!/usr/bin/env node
/**
 * Strict review manifest for new promo card variants.
 * Does not add cards to the app's bundled player database: that requires
 * a tested art renderer and a successful client release.
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const source = process.argv[2];
if (!source) throw new Error('Pending feed path required');
const pending = JSON.parse(await readFile(resolve(source),'utf8'));
if (pending.status !== 'pending-review' || !Array.isArray(pending.cards)) throw new Error('Expected validated pending feed');
const str = x => typeof x === 'string' && x.trim().length > 0;
const stat = x => Number.isInteger(x) && x >= 0 && x <= 99;
const records = [];
const seen = new Set();
for (const card of pending.cards) {
  // Use an immutable unique external variant id rather than the player's regular id.
  const variantId = card.id;
  if (!str(variantId) || seen.has(variantId)) throw new Error('Invalid/duplicate card id');
  seen.add(variantId);
  if (!str(card.baseId) || !str(card.name) || !str(card.program) || !str(card.position) ||
      !str(card.nation) || !str(card.club) || !str(card.league) || !str(card.artSourceUrl)) {
    throw new Error('Incomplete player/visual provenance for ' + variantId);
  }
  if (!/^https:\/\//.test(card.artSourceUrl)) throw new Error('Artwork must use HTTPS: ' + variantId);
  if (!stat(card.rating) || !card.face || !['pac','sho','pas','dri','def','phy'].every(k=>stat(card.face[k]))) {
    throw new Error('Missing or invalid face stats for ' + variantId);
  }
  if (card.face.ovr !== undefined && card.face.ovr !== card.rating) throw new Error('Rating mismatch: ' + variantId);
  // Price is optional: no price is safer than a fabricated one.
  if (card.prices && (!Array.isArray(card.prices) || card.prices.length !== 2 ||
      card.prices.some(p => !Number.isInteger(p) || p < 0))) {
    throw new Error('Invalid market price format for ' + variantId);
  }
  records.push({
    externalId: variantId,
    baseId: card.baseId,
    program: card.program,
    player: {
      id: 'feed-' + variantId,
      baseId: card.baseId,
      name: card.name,
      en: card.en ?? card.name,
      rating: card.rating,
      position: card.position,
      nation: card.nation,
      league: card.league,
      club: card.club,
      face: {ovr:card.rating,...Object.fromEntries(['pac','sho','pas','dri','def','phy'].map(k=>[k,card.face[k]]))}
    },
    artSourceUrl: card.artSourceUrl,
    artApprovalRequired: true,
    ...(card.prices ? { prices: card.prices } : {}),
    status: 'awaiting-visual-and-license-review'
  });
}
await mkdir('artifacts/content-sync',{recursive:true});
await writeFile('artifacts/content-sync/card-candidates.json',JSON.stringify(records,null,2)+'\n');
console.log('Prepared ' + records.length + ' card candidates, all pending artwork and release approval');
