import fs from 'node:fs';
import { loadPlayerCatalogue, loadRepositoryModule } from './load-player-catalogue.mjs';
const { formationById, evaluateSquad, squadRating } = loadRepositoryModule('lib/chemistry.ts');
const data = JSON.parse(fs.readFileSync('assets/data/sbc-classic-verified-20261021.json'));
const players = loadPlayerCatalogue().filter((p) => !p.icon && !p.edition && p.rating <= 86);
let seed = 271021; const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
const pick = (a) => a[Math.floor(random() * a.length)];
const counts = (ps, key) => { const m = new Map(); for (const p of ps) m.set(p[key], (m.get(p[key]) ?? 0) + 1); return [...m.values()]; };
for (const [id, challenge] of Object.entries(data)) for (const segment of challenge.segments) {
  const rules = segment.rules, formation = formationById('433'), slots = formation.lines.flat().slice(0, rules.playerCount ?? 11);
  let pool = players.filter((p) => (!rules.exactQuality || (p.rating >= 75 ? 'gold' : p.rating >= 65 ? 'silver' : 'bronze') === rules.exactQuality) && (!rules.minQuality || p.rating >= (rules.minQuality === 'gold' ? 75 : 65)) && (!rules.maxPlayerRating || p.rating <= rules.maxPlayerRating));
  // Use canonical catalogue club labels, retaining each source's OR requirement.
  if (rules.clubsAtLeast) rules.clubsAtLeast.clubs = rules.clubsAtLeast.clubs.filter((club) => pool.some((p) => p.club === club));
  if (!rules.chemistry && !rules.minRating) {
    pool.sort((a, b) => a.rating - b.rating);
    const chosen = pool.slice(0, slots.length);
    segment.squad = Object.fromEntries(chosen.map((p, i) => [slots[i].id, p.id]));
    const placed = Object.fromEntries(chosen.map((p, i) => [slots[i].id, p]));
    if (!evaluateSquad(formation, placed, rules).ready) throw Error('Basic squad failed '+id);
    fs.writeFileSync('assets/data/sbc-classic-verified-20261021.json',JSON.stringify(data,null,2)+'\n');
    console.log('PASS LOW RATINGS',id,segment.name);continue;
  }
  if (segment.squad) {
    const placed = Object.fromEntries(Object.entries(segment.squad).map(([slot, id]) => [slot, players.find((p) => p.id === id)]));
    if (evaluateSquad(formation, placed, rules).ready) { console.log('RECHECK', id, segment.name); continue; }
  }
  const candidates = slots.map((s) => pool.filter((p) => !rules.chemistry || (p.positions ?? [p.position]).includes(s.position)));
  if (candidates.some((c) => !c.length)) throw Error('No candidates '+id);
  function penalty(ps) {
    const placed = Object.fromEntries(ps.map((p, i) => [slots[i].id, p]));
    const report = evaluateSquad(formation, placed, rules);
    if (report.ready) return { score: 0, placed };
    let score = 20 * (ps.length - new Set(ps.map((p) => p.id)).size);
    const deficit = (v, min) => min ? Math.max(0, min - v) : 0, excess = (v, max) => max ? Math.max(0, v - max) : 0;
    const lc = counts(ps,'league'), nc = counts(ps,'nation'), cc = counts(ps,'club');
    score += 2 * deficit(report.chemistry, rules.chemistry);
    score += 4 * deficit(squadRating(ps.map((p) => p.rating)), rules.minRating);
    score += 4 * excess(squadRating(ps.map((p) => p.rating)), rules.maxRating);
    score += 7 * (deficit(lc.length,rules.minLeagues)+excess(lc.length,rules.maxLeagues)+excess(cc.length,rules.maxClubs));
    if (rules.exactLeagues) score += 9 * Math.abs(lc.length-rules.exactLeagues);
    if (rules.exactNations) score += 9 * Math.abs(nc.length-rules.exactNations);
    score += 7 * (excess(Math.max(...lc),rules.maxSameLeague)+excess(Math.max(...nc),rules.maxSameNation)+excess(Math.max(...cc),rules.maxSameClub)+deficit(Math.max(...cc),rules.minSameClub)+deficit(Math.max(...lc),rules.minSameLeague));
    score += 8 * deficit(ps.filter((p) => p.rating >=65 && p.rating<=74).length,rules.minSilver);
    score += 8 * deficit(ps.filter((p) => p.rating>=75).length,rules.minGold);
    if (rules.clubsAtLeast) score += 12 * deficit(ps.filter((p) => rules.clubsAtLeast.clubs.includes(p.club)).length,rules.clubsAtLeast.count);
    return { score: Math.max(score, report.checks.filter((c) => !c.ok).length), placed };
  }
  let best = Infinity, found = null;
  for (let restart=0;restart<10&&!found;restart++) {
    let current=candidates.map(pick), result=penalty(current);
    for(let step=0;step<45000;step++) {
      const slot=Math.floor(random()*slots.length), options=candidates[slot];
      const peers=current.filter((_,i)=>i!==slot), peer=pick(peers.length?peers:current);
      let next;
      const mode=random();
      if(mode<0.15&&rules.clubsAtLeast)next=pick(options.filter(p=>rules.clubsAtLeast.clubs.includes(p.club)));
      else if(mode<0.42)next=pick(options.filter(p=>p.club===peer.club));
      else if(mode<0.65)next=pick(options.filter(p=>p.league===peer.league));
      else if(mode<0.85)next=pick(options.filter(p=>p.nation===peer.nation));
      next??=pick(options);
      const trial=[...current];trial[slot]=next;const checked=penalty(trial);
      if(checked.score<best)best=checked.score;
      if(!checked.score){found=checked.placed;break;}
      const temperature=0.3+2.5*(1-(step%9000)/9000);
      if(checked.score<=result.score||random()<Math.exp((result.score-checked.score)/temperature)){current=trial;result=checked;}
    }
  }
  if(found){segment.squad=Object.fromEntries(Object.entries(found).map(([slot,p])=>[slot,p.id]));console.log('PASS',id,segment.name);}else{delete segment.squad;console.log('PENDING',id,segment.name,best);}
  fs.writeFileSync('assets/data/sbc-classic-verified-20261021.json',JSON.stringify(data,null,2)+'\n');
}
