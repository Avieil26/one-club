import type { GalleryGrade, GalleryItem, GallerySet, GalleryTag } from './galleryTypes';
/** All scores come from the exact item edition. Never infer a promo score from OVR. */
function attribute(item: GalleryItem, key: string, firstOwners: Set<number>): string[] {
 switch (key) {
  case 'NATION': return [String(item.nationEaId)];
  case 'CLUB': return [String(item.clubEaId)];
  case 'LEAGUEID': return [String(item.leagueEaId)];
  case 'BASE_DEF_ID': return [String(item.playerEaId)];
  case 'RARE': return [String(item.rarityEaId)];
  case 'LEVEL': return [item.overall < 65 ? 'bronze' : item.overall < 75 ? 'silver' : 'gold'];
  case 'POSSIBLE_POSITIONS': return item.positions;
  case 'HYPER_COSMETIC_TYPE': return item.holographic ? ['1'] : [];
  case 'FIRST_OWNED': return firstOwners.has(item.eaId) ? ['1'] : ['0'];
  case 'WEAK_FOOT': return [String(item.weakFoot)];
  case 'SKILL_MOVES': return [String(item.skillMoves)];
  default: return [];
 }
}
export function galleryScore(items: GalleryItem[], tags: GalleryTag[], firstOwnerIds: number[] = []) {
 const firstOwners = new Set(firstOwnerIds);
 const base = items.reduce((sum, p) => sum + p.score, 0);
 const bonuses = tags.map(tag => {
  const rule = tag.rules[0];
  let matching: GalleryItem[] = [];
  let matchedCount: number | undefined;
  if (!rule) return { id: tag.id, name: tag.name, count: 0, percent: 0, bonus: 0, counted: false };
  if (rule.type === 'MAX_COUNT_ALL_SAME' || rule.type === 'COUNT_DIFF') {
   const groups = new Map<string, GalleryItem[]>();
   for (const item of items) for (const value of attribute(item, rule.attribute, firstOwners)) groups.set(value, [...(groups.get(value) ?? []), item]);
   if (rule.type === 'COUNT_DIFF') matching = [...groups.values()].map(g => [...g].sort((a,b) => b.score-a.score)[0]);
   else {
    // Tied largest groups all contribute score; the tier uses the largest group size.
    matchedCount = Math.max(0, ...[...groups.values()].map(g => g.length));
    matching = [...groups.values()].filter(g => g.length === matchedCount).flat();
   }
  } else matching = items.filter(item => attribute(item, rule.attribute, firstOwners).some(value => rule.type === 'MIN_COUNT' ? Number(value) >= (rule.attribute === 'SKILL_MOVES' ? Number(rule.values[0]) + 1 : Number(rule.values[0])) : rule.values.includes(value)));
  const percent = [...tag.tiers].reverse().find(t => (matchedCount ?? matching.length) >= t.minItems)?.bonus ?? 0;
  return { id: tag.id, name: tag.name, count: matchedCount ?? matching.length, percent, bonus: Math.floor(matching.reduce((sum,p)=>sum+p.score,0)*percent/100), counted: false };
 }).sort((a,b)=>b.bonus-a.bonus || a.id-b.id);
 bonuses.forEach((tag,index)=> {tag.counted=index<10 && tag.bonus>0;});
 const bonus=bonuses.filter(t=>t.counted).reduce((sum,t)=>sum+t.bonus,0);
 return {base,bonus,total:base+bonus,tags:bonuses};
}
export function gradeFor(set: GallerySet, score: number, count: number): GalleryGrade | null {
 if(count!==set.requiredCards)return null;
 return [...set.grades].reverse().find(g=>score>=g.threshold)?.name ?? null;
}
export function gradeTokens(set: GallerySet, grade: GalleryGrade | null): number {
 if(!grade)return 0;
 const index=set.grades.findIndex(g=>g.name===grade);
 return set.grades.slice(0,index+1).flatMap(g=>g.rewards).reduce((sum,r)=>sum+(r.type==='event_token_1'?r.value*r.count:0),0);
}
export function validateGalleryPlan(set: GallerySet, items: GalleryItem[], tags: GalleryTag[], target: GalleryGrade, firstOwnerIds: number[] = []) {
 const allowed=new Set(set.itemIds),ids=new Set(items.map(p=>p.eaId));
 const eligible=items.length===set.requiredCards&&ids.size===items.length&&items.every(p=>allowed.has(p.eaId)&&Number.isSafeInteger(p.score)&&p.score>=0);
 const result=galleryScore(items,tags,firstOwnerIds);
 const threshold=set.grades.find(g=>g.name===target)?.threshold;
 return { ...result, valid:eligible && threshold!==undefined && result.total>=threshold, grade:eligible?gradeFor(set,result.total,items.length):null };
}
