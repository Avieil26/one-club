import heightFile from '@/assets/data/playerHeight.json';
import iconHeights from '@/assets/data/iconHeights.json';
import heroHeights from '@/assets/data/heroHeights.json';

const heights = heightFile.players as Record<string, number>;

/** FUTBIN-style feet and inches: round total inches, then split. */
export function cmToFeet(cm: number): string {
  const total = Math.round(cm / 2.54);
  const feet = Math.floor(total / 12);
  const inches = total % 12;
  return `${feet}'${inches}"`;
}

export function playerHeight(id: string): { cm: number; feet: string } | null {
  const cm = (heroHeights as Record<string, number>)[id] ?? (iconHeights as Record<string, number>)[id] ?? heights[id];
  if (!cm) return null;
  return { cm, feet: cmToFeet(cm) };
}
