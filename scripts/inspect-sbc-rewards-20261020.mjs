import fs from 'node:fs';
const audit=JSON.parse(fs.readFileSync('assets/data/sbc-audit-20261020.json','utf8'));
const sources=[...new Map(audit.challenges.map(c=>[c.expirySourceUrl,c])).values()];
for(let i=0;i<sources.length;i+=4)await Promise.all(sources.slice(i,i+4).map(async c=>{
try{
const res=await fetch(c.expirySourceUrl,{signal:AbortSignal.timeout(25000)});if(!res.ok)throw Error(String(res.status));
const html=await res.text();
const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]).filter(t=>/game-assets.fut.gg/.test(t)).map(t=>({src:t.match(/src="([^"]+)"/)?.[1],alt:t.match(/alt="([^"]*)"/)?.[1]})).filter(i=>/2027\/(?:rarities|player-item|pack|sbc)/.test(i.src||''));
const links=[...html.matchAll(/href="([^"]*\/players\/[^"]+)"/g)].map(m=>m[1]);
const plain=html.replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
console.log('REWARD_FACT='+JSON.stringify({id:c.id,images:[...new Map(images.map(i=>[i.src,i])).values()],players:[...new Set(links)],solve:plain.slice(plain.indexOf('Total cards'),plain.indexOf('Total cards')+1200)}));
}catch(e){console.log('SOURCE_ERROR='+JSON.stringify({id:c.id,error:String(e)}));}
}));
