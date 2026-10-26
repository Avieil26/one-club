import { Platform } from 'react-native';
import type { GalleryCatalogue, GalleryItem, GallerySet } from './galleryTypes';
export type GallerySummary = GallerySet & { planCount: number; preview: GalleryItem[]; availableGrade: string | null };
export type GalleryIndex = { checkedAt: string; definitionsCapturedAt: string; sets: GallerySummary[] };
export type GalleryDetail = Omit<GalleryCatalogue, 'sets'> & { set: GallerySet; poolTruncated: boolean };
const cache = new Map<string, Promise<unknown>>();
/** Gallery data is loaded only when its screen is opened; never part of the startup snapshot. */
async function read<T>(file: string): Promise<T> {
 if (!cache.has(file)) {
  const base = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : 'https://fc27-israel.vercel.app';
  cache.set(file, (async () => {
   const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 15000);
   try { const res = await fetch(`${base}/gallery-data/${file}.json`, { signal: controller.signal }); if (!res.ok) throw Error('Gallery unavailable'); const data = await res.json(); if (!data.checkedAt) throw Error('Invalid gallery catalogue'); return data; }
   finally { clearTimeout(timer); }
  })().catch(error => { cache.delete(file); throw error; }));
 }
 return cache.get(file)! as Promise<T>;
}
export const loadGalleryIndex = () => read<GalleryIndex>('catalogue');
export const loadGallerySet = (id: number): Promise<GalleryDetail> => Number.isSafeInteger(id) && id >= 1 ? loadGalleryIndex().then(index => index.sets.some(set => set.id === id) ? read<GalleryDetail>(String(id)) : Promise.reject(new Error('Unknown set'))) : Promise.reject(new Error('Unknown set')); 
