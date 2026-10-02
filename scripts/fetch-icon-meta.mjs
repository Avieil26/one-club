/**
 * Pull FC 26 base Icon sheets (foot, skill moves, weak foot, sub-stats, height)
 * from WeFUT and keep only the card whose face matches our icon.
 */
import fs from 'node:fs';

const ATTRS = [
  'acceleration', 'sprintSpeed', 'positioning', 'finishing', 'shotPower', 'longShots', 'volleys', 'penalties',
  'vision', 'crossing', 'freeKickAccuracy', 'shortPassing', 'longPassing', 'curve',
  'agility', 'balance', 'reactions', 'ballControl', 'dribbling', 'composure',
  'interceptions', 'headingAccuracy', 'defensiveAwareness', 'standingTackle', 'slidingTackle',
  'jumping', 'stamina', 'strength', 'aggression',
  'gkDiving', 'gkHandling', 'gkKicking', 'gkReflexes', 'gkPositioning',
];

const WEFUT = {
  acceleration: 'acceleration',
  sprint_speed: 'sprintSpeed',
  att_positioning: 'positioning',
  positioning: 'positioning',
  finishing: 'finishing',
  shot_power: 'shotPower',
  long_shots: 'longShots',
  volleys: 'volleys',
  penalties: 'penalties',
  vision: 'vision',
  crossing: 'crossing',
  fk_accuracy: 'freeKickAccuracy',
  short_passing: 'shortPassing',
  short_pass: 'shortPassing',
  long_passing: 'longPassing',
  long_pass: 'longPassing',
  fk_accuracy: 'freeKickAccuracy',
  free_kick_accuracy: 'freeKickAccuracy',
  curve: 'curve',
  agility: 'agility',
  balance: 'balance',
  reactions: 'reactions',
  ball_control: 'ballControl',
  dribbling: 'dribbling',
  composure: 'composure',
  interceptions: 'interceptions',
  heading_accuracy: 'headingAccuracy',
  def_awareness: 'defensiveAwareness',
  standing_tackle: 'standingTackle',
  sliding_tackle: 'slidingTackle',
  jumping: 'jumping',
  stamina: 'stamina',
  strength: 'strength',
  aggression: 'aggression',
  gk_diving: 'gkDiving',
  gk_handling: 'gkHandling',
  gk_kicking: 'gkKicking',
  gk_reflexes: 'gkReflexes',
  gk_positioning: 'gkPositioning',
  diving: 'gkDiving',
  handling: 'gkHandling',
  kicking: 'gkKicking',
  reflexes: 'gkReflexes',
};

function norm(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function get(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

function loadIcons() {
  const src = fs.readFileSync(new URL('../lib/iconPlayers.ts', import.meta.url), 'utf8');
  const faceBlock = src.slice(src.indexOf('ICON_FACE'), src.indexOf('ICON_PHOTOS'));
  const photoBlock = src.slice(src.indexOf('ICON_PHOTOS'));
  const icons = [];
  for (const match of faceBlock.matchAll(/'(icon-[^']+)':\s*f\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/g)) {
    icons.push({
      id: match[1],
      face: match.slice(2, 9).map(Number),
    });
  }
  const ens = Object.fromEntries([...photoBlock.matchAll(/'(icon-[^']+)':\s*\{\s*en:\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));
  return icons.map((icon) => ({ ...icon, en: ens[icon.id] || icon.id.replace('icon-', '') }));
}

function parseCards(html) {
  const cards = [];
  const chunks = html.split(/<a href="https:\/\/wefut.com\/player\/26\//).slice(1);
  for (const chunk of chunks) {
    const slug = chunk.match(/^(\d+)\/([^"]+)"/);
    const rating = chunk.match(/class="rating"[^>]*>(\d+)/);
    const name = chunk.match(/class="marquee">([^<]+)/);
    const pace = chunk.match(/class="pace">(\d+)/);
    const shooting = chunk.match(/class="shooting">(\d+)/);
    const passing = chunk.match(/class="passing">(\d+)/);
    const dribbling = chunk.match(/class="dribbling">(\d+)/);
    const defending = chunk.match(/class="defending">(\d+)/);
    const heading = chunk.match(/class="heading">(\d+)/);
    if (!slug || !rating || !pace) continue;
    cards.push({
      url: `https://wefut.com/player/26/${slug[1]}/${slug[2]}`,
      slug: slug[2],
      name: name?.[1] || slug[2],
      face: [Number(rating[1]), Number(pace[1]), Number(shooting[1]), Number(passing[1]), Number(dribbling[1]), Number(defending[1]), Number(heading[1])],
    });
  }
  return cards;
}

function faceDiff(a, b) {
  return a.reduce((sum, value, index) => sum + Math.abs(value - b[index]), 0);
}

function parsePlayer(html) {
  const stats = {};
  for (const match of html.matchAll(/data-attribute="([^"]+)" data-value="(\d+)"/g)) {
    const key = WEFUT[match[1]];
    if (key) stats[key] = Number(match[2]);
  }
  const foot = html.match(/Preferred foot<\/td><td>(Left|Right)/)?.[1];
  const weak = html.match(/Weak foot<\/td><td>((?:<i class="fa fa-star player-star"><\/i>\s*)+)/);
  const skill = html.match(/Skillmoves<\/td><td>((?:<i class="fa fa-star player-star"><\/i>\s*)+)/);
  const stars = (block) => (block ? (block.match(/fa-star/g) || []).length : 0);
  const height = html.match(/Height<\/td><td>(\d+)\s*cm/);
  const attrs = ATTRS.map((key) => stats[key] ?? 0);
  return {
    foot: foot === 'Left' ? 'L' : foot === 'Right' ? 'R' : null,
    sm: stars(skill?.[1]),
    wf: stars(weak?.[1]),
    height: height ? Number(height[1]) : null,
    attrs,
    unknown: [...html.matchAll(/data-attribute="([^"]+)"/g)].map((m) => m[1]).filter((key) => !WEFUT[key]),
  };
}

async function main() {
  const icons = loadIcons();
  const cards = [];
  for (let offset = 0; offset < 400; offset += 40) {
    const html = await get(`https://wefut.com/player/type/26/12/all/${offset}`);
    const page = parseCards(html);
    if (!page.length) break;
    cards.push(...page);
    if (!html.includes(`/player/type/26/12/all/${offset + 40}`)) break;
    await sleep(120);
  }
  console.log(`base icons listed: ${cards.length}`);

  const out = {};
  const heights = {};
  const report = [];
  for (const icon of icons) {
    const target = norm(icon.en);
    const ranked = cards
      .map((card) => {
        const cardName = norm(`${card.name} ${card.slug}`);
        const nameHit = cardName === target || cardName.includes(target) || target.includes(cardName) ? 1 : 0;
        return { card, nameHit, diff: faceDiff(icon.face, card.face) };
      })
      .filter((row) => row.nameHit)
      .sort((a, b) => a.diff - b.diff);
    const best = ranked[0];
    if (!best) {
      report.push({ id: icon.id, en: icon.en, error: 'no card' });
      continue;
    }
    await sleep(140);
    const parsed = parsePlayer(await get(best.card.url));
    if (!parsed.foot || !parsed.sm || !parsed.wf || parsed.attrs.filter((n) => n > 0).length < 6) {
      report.push({ id: icon.id, en: icon.en, error: 'incomplete', url: best.card.url, parsed });
      continue;
    }
    out[icon.id] = { foot: parsed.foot, sm: parsed.sm, wf: parsed.wf, attrs: parsed.attrs };
    if (parsed.height) heights[icon.id] = parsed.height;
    report.push({
      id: icon.id,
      en: icon.en,
      url: best.card.url,
      faceDiff: best.diff,
      our: icon.face,
      theirs: best.card.face,
      foot: parsed.foot,
      sm: parsed.sm,
      wf: parsed.wf,
      height: parsed.height,
      filled: parsed.attrs.filter((n) => n > 0).length,
      unknown: [...new Set(parsed.unknown)],
    });
    console.log(`${icon.id} diff=${best.diff} sm=${parsed.sm} wf=${parsed.wf} foot=${parsed.foot}`);
  }

  const missing = icons.filter((icon) => !out[icon.id]);
  if (missing.length) {
    const league = [];
    for (let offset = 0; offset <= 480; offset += 30) {
      const html = await get(`https://wefut.com/league/2118/26/any/${offset}`);
      league.push(...parseCards(html));
      await sleep(80);
    }
    for (const icon of missing) {
      const target = norm(icon.en);
      const ranked = league
        .map((card) => ({ card, diff: faceDiff(icon.face, card.face), name: norm(`${card.name} ${card.slug}`) }))
        .filter((row) => row.name.includes(target) || target.split(' ').every((part) => part.length > 3 && row.name.includes(part)))
        .sort((a, b) => a.diff - b.diff);
      const best = ranked[0];
      if (!best) {
        report.push({ id: icon.id, en: icon.en, error: 'no card' });
        continue;
      }
      await sleep(140);
      const parsed = parsePlayer(await get(best.card.url));
      if (!parsed.foot || !parsed.sm || !parsed.wf) continue;
      out[icon.id] = { foot: parsed.foot, sm: parsed.sm, wf: parsed.wf, attrs: parsed.attrs };
      if (parsed.height) heights[icon.id] = parsed.height;
      report.push({ id: icon.id, en: icon.en, url: best.card.url, faceDiff: best.diff, our: icon.face, theirs: best.card.face, foot: parsed.foot, sm: parsed.sm, wf: parsed.wf, height: parsed.height, filled: parsed.attrs.filter((n) => n > 0).length, unknown: [...new Set(parsed.unknown)] });
      console.log(`fallback ${icon.id} diff=${best.diff}`);
    }
  }

  fs.writeFileSync(new URL('../assets/data/iconCardMeta.json', import.meta.url), JSON.stringify(out));
  fs.writeFileSync(new URL('../assets/data/iconHeights.json', import.meta.url), JSON.stringify(heights));
  fs.writeFileSync(new URL('./_icon-meta-report.json', import.meta.url), JSON.stringify(report, null, 2));
  const playersPath = new URL('../lib/iconPlayers.ts', import.meta.url);
  let src = fs.readFileSync(playersPath, 'utf8');
  for (const row of report) {
    if (!row.theirs || !row.our || !row.faceDiff) continue;
    const from = `'${row.id}': f(${row.our.join(', ')})`;
    const to = `'${row.id}': f(${row.theirs.join(', ')})`;
    if (src.includes(from)) src = src.replace(from, to);
    src = src.replace(new RegExp(`(id: '${row.id}'[^\\n]*rating: )\\d+`), `$1${row.theirs[0]}`);
  }
  fs.writeFileSync(playersPath, src);

  const bad = report.filter((row) => row.error || row.faceDiff > 0);
  console.log(`saved ${Object.keys(out).length}/${icons.length} mismatches=${bad.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
