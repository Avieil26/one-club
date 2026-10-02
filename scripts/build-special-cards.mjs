import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const POS = {
  kohler: 'CB', ginola: 'LM', hazard: 'LM', voller: 'ST', sasic: 'ST', abedipele: 'CAM', vialli: 'ST',
  mascherano: 'CB', rafamarquez: 'CDM', futre: 'LW', okocha: 'CAM', forlan: 'ST', laudehr: 'CM', kessler: 'CM',
  kompany: 'CB', milito: 'ST', lizarazu: 'LB', litmanen: 'CAM', tevez: 'ST', zamorano: 'ST', cescfabregas: 'CM',
  sneijder: 'CAM', dinatale: 'ST', ricardocarvalho: 'CB', francescoli: 'CAM', laurageorges: 'CB', hamsik: 'CM',
  harrykewell: 'LM', nakata: 'CAM', marchisio: 'CM', ruicosta: 'CAM', mcmanaman: 'RM', berbatov: 'ST', zola: 'CAM',
  suker: 'ST', kluivert: 'ST', necib: 'CAM', salgado: 'RB', zeroberto: 'CM', stam: 'CB', morientes: 'ST',
  mariogomez: 'ST', barzagli: 'CB', gilbertosilva: 'CDM', makaay: 'ST', joecole: 'RW', cordoba: 'CB', derossi: 'CM',
  jorgecampos: 'GK', aimar: 'CAM', ramires: 'CDM', riise: 'LB', rosicky: 'CAM', ljungberg: 'RM', matuidi: 'CDM',
  kanu: 'ST', solskjaer: 'ST', henriklarsson: 'ST', veron: 'CM', luishernandez: 'ST', farawilliams: 'CM', hoeness: 'RM',
  cambiasso: 'CDM', kuyt: 'RM', capdevila: 'LB', bierhoff: 'ST', carragher: 'CB', bompastor: 'LB', mandzukic: 'ST',
  pizarro: 'ST', aljaber: 'ST', parkjisung: 'LM', dudek: 'GK', giuly: 'RM', guti: 'CAM', donovan: 'CAM',
  ledleyking: 'CB', robbiekeane: 'ST', timhoward: 'GK', timcahill: 'CAM', beasley: 'LM', alowairan: 'RW',
  alexscott: 'RB', crouch: 'ST', quaresma: 'RW', jillscott: 'CM', dempsey: 'CAM',
};

function decode(value) {
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&');
}

const parsed = JSON.parse(readFileSync(join(tmpdir(), 'heroes.json'), 'utf8'));
const heroes = parsed.map((row) => {
  const position = POS[row.slug];
  if (!position) throw new Error(`missing position ${row.slug}`);
  const card = {
    id: `hero-${row.slug}`,
    en: decode(row.name),
    name: decode(row.name),
    rating: row.rating,
    position,
    nation: row.nation,
    league: row.league,
    club: 'Heroes',
  };
  if (row.slug === 'cescfabregas') {
    card.face = { ovr: 88, pac: 77, sho: 78, pas: 92, dri: 85, def: 68, phy: 72 };
    card.name = 'פברגאס';
  }
  return card;
});

const face = (ovr, pac, sho, pas, dri, def, phy) => ({ ovr, pac, sho, pas, dri, def, phy });
const totw = [
  ['olise', 'RM', face(91, 84, 84, 90, 92, 48, 71)],
  ['raphinha', 'ST', face(89, 92, 87, 87, 88, 56, 78)],
  ['wilson', 'ST', face(89, 92, 88, 81, 89, 46, 80)],
  ['marquinhos', 'CB', face(88, 76, 57, 76, 75, 90, 80)],
  ['salah', 'RM', face(88, 86, 84, 84, 88, 46, 74)],
  ['semenyo', 'LM', face(86, 84, 86, 81, 85, 47, 82)],
  ['ea-219683-corentin-tolisso', 'CM', face(84, 74, 81, 82, 80, 81, 84)],
  ['ea-264388-moleiro', 'CAM', face(84, 88, 80, 80, 86, 53, 72)],
  ['ea-223710-vedat-muriqi', 'ST', face(83, 75, 85, 70, 75, 35, 85)],
  ['ea-243630-jonathan-david', 'ST', face(82, 82, 83, 74, 81, 40, 75)],
  ['ea-261865-miguel-gutierrez', 'LB', face(82, 83, 74, 82, 80, 80, 74)],
  ['ea-190765-pascal-gro', 'CDM', face(81, 70, 76, 86, 81, 73, 75)],
  ['ea-273177-olivia-holdt', 'LM', face(81, 78, 76, 77, 81, 59, 77)],
  ['ea-70726-anis-hadj-moussa', 'RW', face(80, 82, 78, 74, 88, 34, 65)],
  ['ea-80230-bella-andersson', 'CB', face(80, 72, 30, 62, 66, 80, 84)],
  ['ea-188350-marco-reus', 'CAM', face(80, 72, 83, 83, 82, 55, 65)],
  ['ea-235134-pablo-rosario', 'CDM', face(80, 73, 66, 72, 77, 80, 84)],
  ['ea-237440-hannes-delcroix', 'CB', face(80, 77, 46, 72, 71, 80, 82)],
  ['ea-238071-dujon-sterling', 'RB', face(80, 80, 58, 74, 77, 79, 83)],
  ['ea-261861-jack-moylan', 'CAM', face(80, 84, 80, 79, 81, 57, 75)],
  ['ea-273567-chiara-hahn', 'CDM', face(80, 82, 75, 76, 81, 75, 71)],
  ['ea-276725-lorenzo-palmisani', 'GK', face(82, 82, 81, 80, 84, 40, 83)],
].map(([baseId, position, stats]) => ({ baseId, position, rating: stats.ovr, face: stats }));

totw.push({
  id: 'totw-salomon-rodriguez',
  en: 'Salomón Rodríguez',
  name: 'Salomón Rodríguez',
  nation: 'Uruguay',
  league: 'TOTW',
  club: 'TOTW',
  position: 'ST',
  rating: 80,
  face: face(80, 78, 82, 70, 75, 43, 80),
});

writeFileSync('assets/data/heroes.json', JSON.stringify(heroes));
writeFileSync('assets/data/totw.json', JSON.stringify(totw));
console.log('heroes', heroes.length, 'totw', totw.length);
