import type { CareerMode, CommentPreset, ContactType, DivisionId, FutKind, GroundsIntent, PackRarity, PlatformId, SbcKind } from '@/lib/types';

export const TRUSTED_APPROVALS = 5;

export const PLATFORMS: { id: PlatformId; label: string }[] = [
  { id: 'ps5', label: 'פלייסטיישן 5' },
  { id: 'xbox', label: 'אקסבוקס' },
  { id: 'pc', label: 'מחשב' },
  { id: 'switch2', label: 'סוויץ׳ 2' },
];

export const FORMATIONS = ['4-3-3', '4-2-3-1', '4-4-2', '4-2-2-2', '4-1-2-1-2', '3-5-2', '5-3-2'];

export const RARITIES: { id: PackRarity; label: string }[] = [
  { id: 'regular', label: 'רגיל' },
  { id: 'special', label: 'מיוחד' },
  { id: 'holographic', label: 'הולוגרפי' },
];

export const PRESETS: { id: CommentPreset; label: string }[] = [
  { id: 'respect', label: 'כבוד' },
  { id: 'nice', label: 'יפה' },
  { id: 'smart', label: 'חכם' },
  { id: 'funny', label: 'מצחיק' },
];

export const DIVISIONS: { id: DivisionId; label: string }[] = [
  { id: 'elite', label: 'אליט' },
  { id: '1', label: 'חלוקה 1' },
  { id: '2', label: 'חלוקה 2' },
  { id: '3', label: 'חלוקה 3' },
  { id: '4', label: 'חלוקה 4' },
  { id: '5', label: 'חלוקה 5' },
  { id: '6', label: 'חלוקה 6' },
  { id: '7', label: 'חלוקה 7' },
  { id: '8', label: 'חלוקה 8' },
  { id: '9', label: 'חלוקה 9' },
  { id: '10', label: 'חלוקה 10' },
];

export const POSITIONS = ['שוער', 'בלם', 'מגן', 'קשר הגנתי', 'קשר', 'קשר התקפי', 'כנף', 'חלוץ', 'כל עמדה'];

export const REGIONS = ['צפון', 'שרון', 'מרכז', 'ירושלים', 'דרום', 'אונליין בלבד'];

export const ARCHETYPES = [
  'Finisher · סיומת',
  'Target · חלוץ מטרה',
  'Spark · כנף',
  'Magician · כדרור',
  'Creator · יצירה',
  'Maestro · קשר',
  'Recycler · מחזור',
  'Progressor · בניית משחק',
  'Boss · כוח',
  'Marauder · הגנה',
  'Disruptor · חטיפות',
  'Shot Stopper · שוער',
  'Sweeper Keeper · שוער-ליברו',
];

export function platformLabel(id: PlatformId): string {
  return PLATFORMS.find((item) => item.id === id)?.label ?? id;
}

export function divisionLabel(id: DivisionId): string {
  return DIVISIONS.find((item) => item.id === id)?.label ?? id;
}

export function presetLabel(id: CommentPreset): string {
  return PRESETS.find((item) => item.id === id)?.label ?? id;
}

export function rarityLabel(id: PackRarity): string {
  return RARITIES.find((item) => item.id === id)?.label ?? id;
}

export function modeLabel(mode: CareerMode): string {
  return mode === 'manager' ? 'קריירת מאמן' : 'קריירת שחקן';
}

export function futKindLabel(kind: FutKind): string {
  return kind === 'squad' ? 'הקבוצה שלי' : 'יצא לי';
}

export function intentLabel(intent: GroundsIntent): string {
  return intent === 'need_player' ? 'חסר שחקן' : 'מחפש קבוצה';
}

/** Clubs archetype level — strongly distinct tiers */
export function playerLevelTone(level: number): {
  bg: string;
  text: string;
  label: string;
  gradient: [string, string, string];
} {
  const n = Math.min(50, Math.max(1, Math.round(level) || 1));
  if (n <= 10) {
    return {
      bg: '#6B7280',
      text: '#F9FAFB',
      label: `רמה ${n}`,
      gradient: ['#9CA3AF', '#4B5563', '#1F2937'],
    };
  }
  if (n <= 20) {
    return {
      bg: '#CBD5E1',
      text: '#0F172A',
      label: `רמה ${n}`,
      gradient: ['#F8FAFC', '#94A3B8', '#475569'],
    };
  }
  if (n <= 30) {
    return {
      bg: '#C07A3E',
      text: '#1E1008',
      label: `רמה ${n}`,
      gradient: ['#F5D0A0', '#C07A3E', '#5A3214'],
    };
  }
  if (n <= 40) {
    return {
      bg: '#E3B341',
      text: '#1A1208',
      label: `רמה ${n}`,
      gradient: ['#FFE9A0', '#E3B341', '#8A6418'],
    };
  }
  return {
    bg: '#DC2626',
    text: '#FFF1F2',
    label: `רמה ${n}`,
    gradient: ['#F87171', '#DC2626', '#7F1D1D'],
  };
}

export function sbcKindLabel(kind: SbcKind): string {
  return kind === 'streamlined' ? 'Streamlined' : 'קלאסי';
}

export function contactLabel(type: ContactType): string {
  return type === 'whatsapp' ? 'וואטסאפ' : 'דיסקורד';
}

export function contactUrl(type: ContactType, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (type === 'whatsapp') {
    if (trimmed.startsWith('http')) return trimmed;
    let digits = trimmed.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = `972${digits.slice(1)}`;
    if (!digits.startsWith('972')) digits = `972${digits}`;
    if (digits.length < 11) return null;
    return `https://wa.me/${digits}`;
  }
  if (trimmed.startsWith('http')) return trimmed;
  const code = trimmed.replace(/^\/+/, '');
  if (!code) return null;
  return `https://discord.gg/${code}`;
}

export function displayName(profiles: { id: string; displayName: string }[], id: string): string {
  return profiles.find((profile) => profile.id === id)?.displayName ?? 'שחקן';
}
