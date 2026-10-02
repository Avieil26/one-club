import shine from '@/assets/data/totwShine.json';

const finishes = shine as Record<string, 'pristine' | 'holographic'>;

/** Pristine prints the name as a signature. Holographic is the foil version. */
export function totwFinish(id: string): 'pristine' | 'holographic' | null {
  return finishes[id] ?? null;
}
