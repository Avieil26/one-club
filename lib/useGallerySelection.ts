import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import type { GallerySelection } from './galleryTypes';
const empty = (): GallerySelection => ({ ids: [], firstOwnerIds: [], collectedIds: [], graded: null });
export function useGallerySelection(setId: number, userId?: string) {
 const key = `fc27-gallery-v1:${userId || 'guest'}:${setId}`;
 const [state, setState] = useState<{ key: string; selection: GallerySelection; ready: boolean }>({ key, selection: empty(), ready: false });
 useEffect(() => {
  let active = true;
  void AsyncStorage.getItem(key).then(raw => {
   let selection = empty();
   try { const parsed = raw ? JSON.parse(raw) : null; if (parsed && ['ids', 'firstOwnerIds', 'collectedIds'].every(k => Array.isArray(parsed[k]) && parsed[k].every((n: unknown) => Number.isSafeInteger(n)))) selection = parsed; } catch { /* Start empty when a saved local plan is invalid. */ }
   if (active) setState({ key, selection, ready: true });
  }).catch(() => { if (active) setState({ key, selection: empty(), ready: true }); });
  return () => { active = false; };
 }, [key]);
 const ready = state.key === key && state.ready;
 const selection = ready ? state.selection : empty();
 return { selection, ready, change: (next: GallerySelection) => setState({ key, selection: next, ready: true }), save: () => AsyncStorage.setItem(key, JSON.stringify(selection)) };
}
