import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

// The publishable key is safe for client apps. Keep env overrides for local/EAS
// configuration, but fall back to the production Supabase project so a standalone
// APK cannot silently switch to the local/demo backend when build env is missing.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://hxjgphhcspzjnkkzdmpk.supabase.co';
const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_MAR4aEVulBg1EnssPRZvhw_BzMF295U';

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('שרת Supabase לא הוגדר');
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

export async function uploadProofs(userId: string, uris: string[], folder: string): Promise<string[]> {
  const supabase = getSupabase();
  const uploaded: string[] = [];
  for (const uri of uris) {
    if (!uri || uri === 'placeholder') continue;
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      uploaded.push(uri);
      continue;
    }
    const bytes = await uriToBytes(uri);
    const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await supabase.storage.from('proofs').upload(path, body, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) throw new Error('העלאת הצילום נכשלה');
    uploaded.push(supabase.storage.from('proofs').getPublicUrl(path).data.publicUrl);
  }
  return uploaded;
}

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const supabase = getSupabase();
  const bytes = await uriToBytes(uri);
  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const png = uri.startsWith('data:image/png');
  const path = `${userId}/avatar/${Date.now()}.${png ? 'png' : 'jpg'}`;
  const { error } = await supabase.storage.from('proofs').upload(path, body, {
    contentType: png ? 'image/png' : 'image/jpeg',
    upsert: false,
  });
  if (error) throw new Error('העלאת התמונה נכשלה');
  return supabase.storage.from('proofs').getPublicUrl(path).data.publicUrl;
}

async function uriToBytes(uri: string): Promise<Uint8Array> {
  if (uri.startsWith('data:')) {
    const payload = uri.split(',')[1] ?? '';
    return decodeBase64(payload);
  }
  const response = await fetch(uri);
  return new Uint8Array(await response.arrayBuffer());
}

function decodeBase64(value: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = value.replace(/[^A-Za-z0-9+/]/g, '');
  const bytes: number[] = [];
  for (let index = 0; index < clean.length; index += 4) {
    const a = chars.indexOf(clean[index] ?? 'A');
    const b = chars.indexOf(clean[index + 1] ?? 'A');
    const c = clean[index + 2] ? chars.indexOf(clean[index + 2]) : -1;
    const d = clean[index + 3] ? chars.indexOf(clean[index + 3]) : -1;
    bytes.push((a << 2) | (b >> 4));
    if (c >= 0) bytes.push(((b & 15) << 4) | (c >> 2));
    if (d >= 0) bytes.push(((c & 3) << 6) | d);
  }
  return new Uint8Array(bytes);
}
