import assert from 'node:assert/strict';
import { loadPlayerCatalogue, loadRepositoryModule } from './load-player-catalogue.mjs';
const players=loadPlayerCatalogue().filter(p=>!p.edition&&!p.icon);
const {formationById,evaluateSquad}=loadRepositoryModule('lib/chemistry.ts');
const {catalogChallenge}=loadRepositoryModule('lib/sbcCatalog.ts');
const formation=formationById('433');
console.log('FORMATION_SLOTS='+JSON.stringify(formation.lines.flat()));
const challenge=catalogChallenge('sbc-fs-challenge-3');
let found=null;
for(const league of [...new Set(players.map(p=>p.league))]){
 const pool=players.filter(p=>p.league===league&&p.rating>=65&&p.rating<=74);
 if(pool.length<11)continue;
 const slots=formation.lines.flat().map(s=>({...s,candidates:pool.filter(p=>(p.positions??[p.position]).includes(s.position)||p.position===s.position)})).sort((a,b)=>a.candidates.length-b.candidates.length);
 const chosen={};const used=new Set();const clubs=new Map();let visits=0;
 function walk(n){if(++visits>50000)return false;if(n===slots.length){const report=evaluateSquad(formation,chosen,challenge.rules);if(report.checks.every(c=>c.ok)){found={formation:'433',squad:Object.fromEntries(Object.entries(chosen).map(([k,p])=>[k,p.id])),chemistry:report.chemistry};return true;}return false;}
 const slot=slots[n];for(const p of slot.candidates){if(used.has(p.id)||(clubs.get(p.club)||0)>=3)continue;chosen[slot.id]=p;used.add(p.id);clubs.set(p.club,(clubs.get(p.club)||0)+1);if(walk(n+1))return true;delete chosen[slot.id];used.delete(p.id);clubs.set(p.club,clubs.get(p.club)-1);}return false;}
 if(walk(0))break;
}
assert(found,'No validated Future Stars 3 squad found');console.log('READY_SQUAD='+JSON.stringify(found));
