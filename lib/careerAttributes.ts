import careerAttrs from '@/assets/data/careerAttributes.json';
import { statTone } from '@/lib/playerMeta';

export interface DetailedAttrGroup {
  label: string;
  hebrewLabel: string;
  total: number;
  stats: Array<{
    key: string;
    label: string;
    hebrewLabel: string;
    value: number;
    diff?: number; // delta when showing potential
  }>;
}

export interface CareerAttributesBundle {
  eaId: number;
  rating: number;
  potential: number;
  growth: number;
  isGk: boolean;
  currentFace: { pac: number; sho: number; pas: number; dri: number; def: number; phy: number };
  potentialFace: { pac: number; sho: number; pas: number; dri: number; def: number; phy: number };
  currentStats: Record<string, number>;
  potentialStats: Record<string, number>;
}

const data = careerAttrs as unknown as Record<string, CareerAttributesBundle>;

export function getCareerAttributes(playerId: string): CareerAttributesBundle | null {
  return data[playerId] ?? null;
}

const OUTFIELD_STRUCTURE = [
  {
    label: 'Pace',
    hebrewLabel: 'מהירות (PAC)',
    faceKey: 'pac' as const,
    items: [
      { key: 'acceleration', label: 'Acceleration', hebrewLabel: 'תאוצה / האצה' },
      { key: 'sprintSpeed', label: 'Sprint Speed', hebrewLabel: 'מהירות ספרינט' },
    ],
  },
  {
    label: 'Shooting',
    hebrewLabel: 'סיומת / בעיטה (SHO)',
    faceKey: 'sho' as const,
    items: [
      { key: 'positioning', label: 'Att. Position', hebrewLabel: 'מיקום התקפי' },
      { key: 'finishing', label: 'Finishing', hebrewLabel: 'סיומת מול שער' },
      { key: 'shotPower', label: 'Shot Power', hebrewLabel: 'עוצמת בעיטה' },
      { key: 'longShots', label: 'Long Shots', hebrewLabel: 'בעיטות מרחוק' },
      { key: 'volleys', label: 'Volleys', hebrewLabel: 'בעיטת יעף (וולה)' },
      { key: 'penalties', label: 'Penalties', hebrewLabel: 'פנדלים' },
    ],
  },
  {
    label: 'Passing',
    hebrewLabel: 'מסירה (PAS)',
    faceKey: 'pas' as const,
    items: [
      { key: 'vision', label: 'Vision', hebrewLabel: 'ראיית משחק' },
      { key: 'crossing', label: 'Crossing', hebrewLabel: 'הגבהות וכדורי רוחב' },
      { key: 'freeKickAccuracy', label: 'FK Acc.', hebrewLabel: 'דיוק בעיטות חופשיות' },
      { key: 'shortPassing', label: 'Short Pass', hebrewLabel: 'מסירה קצרה' },
      { key: 'longPassing', label: 'Long Pass', hebrewLabel: 'מסירה ארוכה' },
      { key: 'curve', label: 'Curve', hebrewLabel: 'סיבוב כדור' },
    ],
  },
  {
    label: 'Dribbling',
    hebrewLabel: 'כדרור (DRI)',
    faceKey: 'dri' as const,
    items: [
      { key: 'agility', label: 'Agility', hebrewLabel: 'זריזות וגמישות' },
      { key: 'balance', label: 'Balance', hebrewLabel: 'שיווי משקל' },
      { key: 'reactions', label: 'Reactions', hebrewLabel: 'זמן תגובה' },
      { key: 'ballControl', label: 'Ball Control', hebrewLabel: 'שליטה בכדור' },
      { key: 'dribbling', label: 'Dribbling', hebrewLabel: 'דריבל / כדרור' },
      { key: 'composure', label: 'Composure', hebrewLabel: 'קור רוח' },
    ],
  },
  {
    label: 'Defending',
    hebrewLabel: 'הגנה (DEF)',
    faceKey: 'def' as const,
    items: [
      { key: 'interceptions', label: 'Interceptions', hebrewLabel: 'חטיפות ויירוט' },
      { key: 'headingAccuracy', label: 'Heading Acc.', hebrewLabel: 'דיוק נגיחות' },
      { key: 'defensiveAwareness', label: 'Def. Aware', hebrewLabel: 'מודעות הגנתית' },
      { key: 'standingTackle', label: 'Stand Tackle', hebrewLabel: 'תיקול עמידה' },
      { key: 'slidingTackle', label: 'Slide Tackle', hebrewLabel: 'תיקול גלישה' },
    ],
  },
  {
    label: 'Physical',
    hebrewLabel: 'פיזיות (PHY)',
    faceKey: 'phy' as const,
    items: [
      { key: 'jumping', label: 'Jumping', hebrewLabel: 'ניתור לגובה' },
      { key: 'stamina', label: 'Stamina', hebrewLabel: 'כושר וסיבולת' },
      { key: 'strength', label: 'Strength', hebrewLabel: 'כוח פיזי' },
      { key: 'aggression', label: 'Aggression', hebrewLabel: 'אגרסיביות' },
    ],
  },
];

const GK_STRUCTURE = [
  {
    label: 'Diving',
    hebrewLabel: 'זינוק שוער',
    faceKey: 'pac' as const,
    items: [{ key: 'gkDiving', label: 'Diving', hebrewLabel: 'זינוק לפינות' }],
  },
  {
    label: 'Handling',
    hebrewLabel: 'תפיסה ועצירה',
    faceKey: 'sho' as const,
    items: [{ key: 'gkHandling', label: 'Handling', hebrewLabel: 'תפיסת כדור בטוחה' }],
  },
  {
    label: 'Kicking',
    hebrewLabel: 'בעיטת שוער',
    faceKey: 'pas' as const,
    items: [{ key: 'gkKicking', label: 'Kicking', hebrewLabel: 'דיוק בעיטות שוער' }],
  },
  {
    label: 'Reflexes',
    hebrewLabel: 'רפלקסים',
    faceKey: 'dri' as const,
    items: [{ key: 'gkReflexes', label: 'Reflexes', hebrewLabel: 'רפלקסים ותגובות קו' }],
  },
  {
    label: 'Speed',
    hebrewLabel: 'מהירות יציאה',
    faceKey: 'def' as const,
    items: [
      { key: 'acceleration', label: 'Acceleration', hebrewLabel: 'תאוצת יציאה מהשער' },
      { key: 'sprintSpeed', label: 'Sprint Speed', hebrewLabel: 'מהירות ריצה' },
    ],
  },
  {
    label: 'Positioning',
    hebrewLabel: 'מיקום ברחבה',
    faceKey: 'phy' as const,
    items: [{ key: 'gkPositioning', label: 'Positioning', hebrewLabel: 'מיקום בין הקורות' }],
  },
];

export function getDetailedGroups(
  bundle: CareerAttributesBundle,
  showPotential: boolean
): DetailedAttrGroup[] {
  const structure = bundle.isGk ? GK_STRUCTURE : OUTFIELD_STRUCTURE;
  const statsMap = showPotential ? bundle.potentialStats : bundle.currentStats;
  const baseStatsMap = bundle.currentStats;
  const faceMap = showPotential ? bundle.potentialFace : bundle.currentFace;

  return structure.map((group) => {
    const total = faceMap[group.faceKey] || 70;
    const stats = group.items
      .map((item) => {
        const val = statsMap[item.key] ?? 60;
        const baseVal = baseStatsMap[item.key] ?? val;
        const diff = showPotential ? Math.max(0, val - baseVal) : 0;
        return {
          key: item.key,
          label: item.label,
          hebrewLabel: item.hebrewLabel,
          value: val,
          diff,
        };
      })
      .filter((s) => s.value > 0);

    return {
      label: group.label,
      hebrewLabel: group.hebrewLabel,
      total,
      stats,
    };
  });
}
