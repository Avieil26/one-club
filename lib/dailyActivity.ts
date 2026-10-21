import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { getSupabase } from '@/lib/supabase';

export const DAILY_MEASUREMENT_KEY = 'fc27-daily-measurement-v1';
const recording = new Set<string>();
const recordedDays = new Map<string, string>();
const listeners = new Set<(value: boolean) => void>();
export async function allowDailyMeasurement(allow: boolean) {
 await AsyncStorage.setItem(DAILY_MEASUREMENT_KEY, allow ? 'yes' : 'no');
 listeners.forEach(listener => listener(allow));
}
export function useDailyMeasurementPreference() {
 const [enabled, setEnabled] = useState(false);
 useEffect(() => {
  let alive = true;
  void AsyncStorage.getItem(DAILY_MEASUREMENT_KEY).then(value => { if (alive) setEnabled(value === 'yes'); }).catch(() => undefined);
  listeners.add(setEnabled);
  return () => { alive = false; listeners.delete(setEnabled); };
 }, []);
 return enabled;
}

/** Only a consented account and Israel calendar day are recorded. No page URLs or device IDs. */
export function useDailyActivity(userId: string | undefined, admin: boolean, pathname: string) {
 const enabled = useDailyMeasurementPreference();
 useEffect(() => {
  if (!userId || admin || !enabled || pathname.startsWith('/admin') || pathname.startsWith('/auth')) return;
  let alive = true; let pending = false;
  async function record() {
   if (!alive || pending || AppState.currentState === 'background' || (Platform.OS === 'web' && document.visibilityState !== 'visible')) return;
   const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
   if (recordedDays.get(userId!) === today || recording.has(userId!)) return;
   pending = true; recording.add(userId!);
   try {
    const { error } = await getSupabase().rpc('record_daily_activity');
    if (!error) recordedDays.set(userId!, today);
   } catch { /* Measurement must never interrupt browsing or sign-in. */ }
   finally { pending = false; recording.delete(userId!); }
  }
  void record();
  const timer = setInterval(() => { void record(); }, 60000);
  const subscription = AppState.addEventListener('change', state => { if (state === 'active') void record(); });
  const visible = () => { if (document.visibilityState === 'visible') void record(); };
  if (Platform.OS === 'web') document.addEventListener('visibilitychange', visible);
  return () => { alive = false; clearInterval(timer); subscription.remove(); if (Platform.OS === 'web') document.removeEventListener('visibilitychange', visible); };
 }, [userId, admin, enabled, pathname]);
}
