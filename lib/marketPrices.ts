import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import rows from '@/assets/data/marketPrices.json';
import { RECENT_CARDS } from '@/lib/recentCards';

const recentPrices = Object.fromEntries(RECENT_CARDS.filter(card => card.price.kind === 'market').map(card => [card.id, [card.price.console || 0, card.price.pc || 0] as [number, number]]));
let table: Record<string, [number, number]> = { ...rows as unknown as Record<string, [number, number]>, ...recentPrices };
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
    table = { ...table, ...next };
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
  if (id.startsWith('recent-')) {
    if (!row) return null;
    return { console: row[0] > 0 ? row[0] : undefined, pc: row[1] > 0 ? row[1] : undefined };
  }
  if (row) return { console: row[0], pc: row[1] };
  if (id.endsWith('--totw')) return { console: 0, pc: 0 };
  return null;
}
