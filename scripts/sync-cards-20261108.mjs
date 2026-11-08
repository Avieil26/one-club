import fs from 'node:fs/promises';

const ATTR_NAMES = [
  ['Acceleration','acceleration'],['SprintSpeed','sprintSpeed'],['Positioning','positioning'],['Finishing','finishing'],
  ['ShotPower','shotPower'],['LongShots','longShots'],['Volleys','volleys'],['Penalties','penalties'],['Vision','vision'],
  ['Crossing','crossing'],['FkAccuracy','freeKickAccuracy'],['ShortPassing','shortPassing'],['LongPassing','longPassing'],
  ['Curve','curve'],['Agility','agility'],['Balance','balance'],['Reactions','reactions'],['BallControl','ballControl'],
  ['Dribbling','dribbling'],['Composure','composure'],['Interceptions','interceptions'],['HeadingAccuracy','headingAccuracy'],
  ['DefensiveAwareness','defensiveAwareness'],['StandingTackle','standingTackle'],['SlidingTackle','slidingTackle'],
  ['Jumping','jumping'],['Stamina','stamina'],['Strength','strength'],['Aggression','aggression'],['GkDiving','gkDiving'],
  ['GkHandling','gkHandling'],['GkKicking','gkKicking'],['GkReflexes','gkReflexes'],['GkPositioning','gkPositioning']
];

const TOTW8 = [
 ['Trinity Rodman',88],['Fermin',86],['Kerolin',86],['Unai Simon',86],['Morgan Rogers',85],['Yannick Carrasco',84],
 ['Jan Paul van Hecke',83],['Ermedin Demirovic',82],['Victoria Pelova',82],['Wout Weghorst',82],['Yasin Ayari',81],
 ['Diego Moreira',81],['Borja Sainz',80],['Antonio Nusa',80],['Samuel Mbangula',80],['Lautaro Di Lollo',80],
 ['Mads Pedersen',80],['Bartosz Nowak',80],['Liel Abada',80],['Aaron Collins',80],['Selen Altunkulak',80],
 ['Samuel Ballet',80],['Gessime Yassine',80]
];

const RTTK1 = [
 ['Pedri',91],['Ousmane Dembele',91],['Jude Bellingham',91],['Aitana Bonmati',90],['Luis Diaz',90],['Tabitha Chawinga',89],
 ['Yui Hasegawa',89],['Alessandro Bastoni',88],['Ryan Gravenberch',88],['Sakina Karchaoui',88],['Marcos Llorente',88],
 ['Rafael Leao',87],['Alyssa Thompson',87],['Francisco Conceicao',87],['Jeremy Doku',87],['Romelu Lukaku',87],
 ['Andreia Jacinto',86],['Senne Lammens',86],['Maxim De Cuyper',86],['Fikayo Tomori',86],['Matthias Ginter',86],
 ['Diogo Travassos',85],['Younes Taha',85],['Lamine Camara',85],['Matias Soule',85],['Zaid Romero',85],['Gabri Veiga',85]
];

const REWARDS = [
 {q:'Lois Openda',family:'RTTK',rarity:'RTTK',mode:'sbc',target:96000},
 {q:'Martin Ojeda',family:'Ultimate Scream',rarity:'Ultimate Scream',mode:'sbc',target:24000},
 {q:'Ethan Ampadu',family:'Ultimate Scream',rarity:'Ultimate Scream',mode:'sbc',target:22000},
 {q:'Franziska Kett',family:'Showdown',rarity:'Showdown',mode:'sbc',target:12000},
 {q:'Naomie Feller',family:'Showdown',rarity:'Showdown',mode:'sbc',target:12000},
 {q:'Olivia Smith',family:'Showdown',rarity:'Showdown',mode:'sbc',target:16000},
 {q:'Sydney Schertenleib',family:'Showdown',rarity:'Showdown',mode:'sbc',target:16000},
 {q:'Tiago Djalo',family:'RTTK',rarity:'RTTK',mode:'objective',target:null}
];

const players=JSON.parse(await fs.readFile('assets/data/players.json','utf8'));
const byEa=new Map(players.filter(function(p){return p.eaId;}).map(function(p){return [Number(p.eaId),p];}));
const headers={'user-agent':'Mozilla/5.0','accept':'application/json','referer':'https://www.fut.gg/'};

async function search(q){
 const r=await fetch('https://www.fut.gg/api/fut/players/v2/search/?name='+encodeURIComponent(q)+'&game=27',{headers});
 if(!r.ok) throw new Error('search '+r.status+' '+q);
 return (await r.json()).data||[];
}
function faceOf(h){
 const f=h.faceStatsV2||{},g=h.position==='GK';
 return {ovr:h.overall,pac:g?f.gkFaceDiving:f.facePace,sho:g?f.gkFaceHandling:f.faceShooting,pas:g?f.gkFaceKicking:f.facePassing,dri:g?f.gkFaceReflexes:f.faceDribbling,def:g?f.gkFaceSpeed:f.faceDefending,phy:g?f.gkFacePositioning:f.facePhysicality};
}
function attrsOf(html){
 const at=html.indexOf('attributeAcceleration:');
 if(at<0) throw new Error('attribute block absent');
 const block=html.slice(at,at+3200),raw={};
 for(const m of block.matchAll(/attribute([A-Za-z]+):(\d+)/g)) if(raw[m[1]]==null) raw[m[1]]=Number(m[2]);
 const out={}; for(const pair of ATTR_NAMES) out[pair[1]]=raw[pair[0]]||0;
 if(Object.values(out).filter(function(v){return v>0;}).length<20) throw new Error('incomplete attributes');
 return out;
}
function playstylesOf(html,plusCount){
 const at=html.indexOf('flex flex-row gap-2 justify-center flex-wrap max-w-full');
 if(at<0) return [];
 const titles=[...html.slice(at,at+120000).matchAll(/<div title="([^"]+)">/g)].map(function(m){return m[1];}).filter(function(x){return x.length<28;});
 const seen=[]; for(const n of titles) if(!seen.includes(n)) seen.push(n);
 return seen.slice(0,plusCount+12).map(function(name,i){return {name,plus:i<plusCount};});
}
async function itemPage(hit,id){
 const url=id===hit.eaId?'https://www.fut.gg'+hit.url:'https://www.fut.gg/players/'+hit.basePlayerSlug+'/27-'+id+'/';
 const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0','accept':'text/html'}});
 if(!r.ok) throw new Error('item '+r.status+' '+url);
 return {url,html:await r.text()};
}
function identity(hit){
 const base=byEa.get(Number(hit.basePlayerEaId));
 return {baseId:base?base.id:'ea-'+hit.basePlayerEaId+'-'+String(hit.basePlayerSlug||hit.cardName).replace(/^\d+-/,''),
  name:base?base.name:hit.commonName,en:hit.commonName,nation:base?base.nation:(hit.nation&&hit.nation.name||'Unknown'),
  league:base?base.league:(hit.league&&hit.league.name||'Unknown'),club:base?base.club:(hit.club&&hit.club.name||hit.uniqueClub&&hit.uniqueClub.name||'Unknown')};
}
function cardFrom(hit,html,family,releasedAt){
 const x=identity(hit);
 return {id:'recent-'+hit.eaId,baseId:x.baseId,itemId:hit.eaId,baseItemId:hit.basePlayerEaId,name:x.name,en:x.en,rating:hit.overall,
  position:hit.position,positions:(hit.alternativePositions||[]).filter(Boolean),nation:x.nation,league:x.league,club:x.club,edition:'recent',
  face:faceOf(hit),foot:hit.foot==='Left'?'L':'R',weakFoot:hit.weakFoot,skillMoves:hit.skillMoves,heightCm:hit.height,age:hit.age,
  accelerate:hit.accelerateType||undefined,playstyles:playstylesOf(html,(hit.playStylePlusEaIds||[]).length),attributes:attrsOf(html),
  backgroundId:hit.rarityId||hit.rarityEaId||0,family,holographicType:null,isHero:!!hit.isHero,isIcon:!!hit.isIcon,releasedAt,
  createdAt:hit.createdAt||releasedAt+'T18:00:00.000Z',gradingScore:hit.gradingScore||null,sourceUrl:'https://www.fut.gg'+hit.url,
  referenceUrl:null,artUrl:hit.cardImageUrl};
}
function pick(hits,pred,label){
 const a=hits.filter(pred);
 if(a.length!==1) throw new Error(label+' expected 1 hit, got '+a.length+' '+a.map(function(x){return x.eaId+'/'+x.rarityName+'/'+x.overall;}).join(','));
 return a[0];
}
function variantArt(html,id){
 const at=html.indexOf('eaId:'+id),block=at>=0?html.slice(Math.max(0,at-1000),at+8000):html;
 const m=block.match(/cardImageUrl:"([^"]+)"/);
 return m?m[1].replace(/\\u0026/g,'&'):'https://assets.fodder.gg/renders/'+id+'.webp';
}

const cards=[];
for(const spec of TOTW8){
 const hit=pick(await search(spec[0]),function(x){return x.overall===spec[1]&&x.rarityName==='Team of the week'&&x.holographicType==null;},'TOTW8 '+spec[0]);
 const pg=await itemPage(hit,hit.eaId); cards.push(cardFrom(hit,pg.html,'Team of the Week 8','2026-11-04'));
}
for(const spec of RTTK1){
 const hit=pick(await search(spec[0]),function(x){return x.overall===spec[1]&&/RTTK/.test(x.rarityName||'')&&!x.isSbc&&!x.isObjective&&x.holographicType==null;},'RTTK '+spec[0]);
 const pg=await itemPage(hit,hit.eaId),card=cardFrom(hit,pg.html,'RTTK 1','2026-11-06'); cards.push(card);
 const at=pg.html.indexOf('itemVariants:'),block=at>=0?pg.html.slice(at,at+1200):'';
 const variants=[...block.matchAll(/eaId:(\d+),holographicType:([^}]+)/g)].map(function(m){return {id:Number(m[1]),type:m[2].includes('pristine')?'pristine':m[2].includes('holographic')?'holographic':null};}).filter(function(v){return v.type;});
 const variant=variants.find(function(v){return v.id!==hit.eaId;}); if(!variant) throw new Error('missing RTTK variant '+spec[0]);
 const vp=await itemPage(hit,variant.id); if(vp.html.indexOf('standardItemEaId:'+hit.eaId)<0) throw new Error('bad RTTK variant '+spec[0]);
 cards.push({...card,id:'recent-'+variant.id,itemId:variant.id,holographicType:variant.type,sourceUrl:vp.url,artUrl:variantArt(vp.html,variant.id)});
}
for(const spec of REWARDS){
 const hit=pick(await search(spec.q),function(x){return String(x.rarityName||'').includes(spec.rarity)&&x.holographicType==null&&(spec.mode==='sbc'?x.isSbc:x.isObjective);},'reward '+spec.q);
 const pg=await itemPage(hit,hit.eaId),release=(hit.createdAt||'2026-11-07').slice(0,10),card=cardFrom(hit,pg.html,spec.family,release);
 card.price={kind:spec.mode==='sbc'?'sbc':'unavailable',console:spec.target,pc:spec.target,checkedAt:new Date().toISOString()}; cards.push(card);
}

const manifest=await (await fetch('https://r2.fut.gg/27/manifest.json',{headers})).json(),ver=manifest._version;
function pfile(n){return 'https://r2.fut.gg/27/'+n+'.v'+ver+'.'+manifest[n]+'.json';}
const [idx,ps,pc]=await Promise.all(['player-prices-index','player-prices-ps5','player-prices-pc'].map(async function(n){return (await fetch(pfile(n),{headers})).json();}));
const wanted=new Set(cards.filter(function(c){return !c.price;}).map(function(c){return c.itemId;})),prices=new Map(); let cur=idx.id0;
function save(i,id){if(wanted.has(id)&&ps.s[i]===0)prices.set(id,[ps.p[i]||0,pc.p[i]||0]);}
save(0,cur); for(let i=0;i<idx.d.length;i++){cur+=idx.d[i];save(i+1,cur);}
const checkedAt=new Date().toISOString();
for(const c of cards)if(!c.price){const q=prices.get(c.itemId)||[0,0];c.price={kind:'market',console:q[0]||null,pc:q[1]||null,checkedAt};}
if(cards.length!==85||new Set(cards.map(function(c){return c.id;})).size!==85)throw new Error('Expected 85 unique cards');
await fs.writeFile('assets/data/recentCards20261108.json',JSON.stringify(cards,null,2)+'\n');
console.log(JSON.stringify({cards:cards.length,totw8:cards.filter(function(c){return c.family==='Team of the Week 8';}).length,rttk:cards.filter(function(c){return c.family==='RTTK 1';}).length,rewardCards:cards.filter(function(c){return !['Team of the Week 8','RTTK 1'].includes(c.family);}).length,expectedCatalogue:20343}));
