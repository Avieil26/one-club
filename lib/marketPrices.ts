import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import rows from '@/assets/data/marketPrices.json';

let table = rows as unknown as Record<string, [number, number]>;
let started = false;
const listeners = new Set<() => void>();

function pricesUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api/market-prices`;
  }
  return 'https://fc27-israel.vercel.app/api/market-prices';
}

async function loadRemotePrices() {
  try {
    const res = await fetch(pricesUrl());
    if (!res.ok) return;
    const next = (await res.json()) as Record<string, [number, number]>;
    if (!next || typeof next !== 'object' || Object.keys(next).length < 1000) return;
    const seeded = rows as unknown as Record<string, [number, number]>;
    table = next;
    for (const [id, value] of Object.entries(seeded)) {
      if (value[0] === 0 && value[1] === 0 && !Object.prototype.hasOwnProperty.call(table, id)) table[id] = value;
    }
    listeners.forEach((listener) => listener());
  } catch {
    /* Keep the saved snapshot when the daily list is unavailable. */
  }
}

/** Re-render when the daily price list replaces the saved snapshot. */
export function useMarketPrices() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const listener = () => setTick((value) => value + 1);
    listeners.add(listener);
    if (!started) {
      started = true;
      void loadRemotePrices();
    }
    return () => {
      listeners.delete(listener);
    };
  }, []);
}

export type MarketPrice = { console?: number; pc?: number };

/** Real market price for a card that can be bought. TOTW cards with no live listing are explicitly shown as 0. */
export function marketQuote(id: string): MarketPrice | null {
  const row = table[id];
  if (row) return { console: row[0], pc: row[1] };
  if (id.endsWith('--totw')) return { console: 0, pc: 0 };
  return null;
}
