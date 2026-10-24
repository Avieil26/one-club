import type { SquadRules } from '@/lib/types';

const keys = new Set(['playerCount','maxRating','maxPlayerRating','minLeagues','maxSameNation','exactLeagues','exactNations','chemistry','minRating','minNations','maxSameLeague','maxLeagues','minClubs','maxClubs','minSameClub','maxSameClub','minSameLeague','sameNationAtLeast','nationsAtLeast','nationAtLeast','leagueAtLeast','clubsAtLeast','minGold','minSilver','minBronze','minQuality','exactQuality']);
/** A newly introduced requirement must be implemented before any squad can pass. */
export function knownClassicRules(rules: SquadRules): boolean {
  return Object.keys(rules).every((key) => keys.has(key));
}
const clubs: Record<string, string> = { PSG: 'פריז סן ז׳רמן', OL: 'Olympique Lyonnais', 'SSC Napoli': 'נאפולי', 'AS Roma': 'רומא', Chelsea: 'צ׳לסי', Spurs: 'טוטנהאם', 'FC Barcelona': 'ברצלונה', 'Real Madrid': 'ריאל מדריד' };
export function parseClassicRequirements(requirements: string[], playerCount = 11): SquadRules | null {
  const rules: SquadRules = { playerCount, chemistry: 0 };
  for (const text of requirements) {
    let m: RegExpMatchArray | null;
    if ((m = text.match(/^Club: Min\. (\d+) players? from (.+) or (.+)$/))) {
      if (!clubs[m[2]] || !clubs[m[3]]) return null;
      rules.clubsAtLeast = { clubs: [clubs[m[2]], clubs[m[3]]], count: Number(m[1]) };
    } else if ((m = text.match(/^Same nation: Min\. (\d+) players$/))) rules.sameNationAtLeast = Number(m[1]);
    else if ((m = text.match(/^Same league: Max\. (\d+) players$/))) rules.maxSameLeague = Number(m[1]);
    else if ((m = text.match(/^Same league: Min\. (\d+) players$/))) rules.minSameLeague = Number(m[1]);
    else if ((m = text.match(/^Same club: (Min|Max)\. (\d+) players$/))) rules[m[1] === 'Min' ? 'minSameClub' : 'maxSameClub'] = Number(m[2]);
    else if ((m = text.match(/^Leagues: (Min|Max)\. (\d+)$/))) rules[m[1] === 'Min' ? 'minLeagues' : 'maxLeagues'] = Number(m[2]);
    else if ((m = text.match(/^Clubs: Min\. (\d+)$/))) rules.minClubs = Number(m[1]);
    else if ((m = text.match(/^Quality: Min\. (\d+) (Gold|Silver) players$/))) rules[m[2] === 'Gold' ? 'minGold' : 'minSilver'] = Number(m[1]);
    else if ((m = text.match(/^Quality: Min\. (Gold|Silver|Bronze)$/))) rules.minQuality = m[1].toLowerCase() as SquadRules['minQuality'];
    else if ((m = text.match(/^Chemistry: Min\. (\d+)$/))) rules.chemistry = Number(m[1]);
    else if ((m = text.match(/^Team rating: Min\. (\d+)$/))) rules.minRating = Number(m[1]);
    else if ((m = text.match(/^Players: (\d+)$/))) rules.playerCount = Number(m[1]);
    else return null;
  }
  return rules;
}
function normalized(rules: SquadRules): string {
  return JSON.stringify(Object.entries(rules).sort(([a], [b]) => a.localeCompare(b)));
}
export function sourceClassicRulesMatch(requirements: string[], rules: SquadRules): boolean {
  const parsed = parseClassicRequirements(requirements);
  return parsed !== null && normalized(parsed) === normalized(rules);
}
