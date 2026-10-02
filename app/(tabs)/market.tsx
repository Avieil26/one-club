import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { SceneAtmosphere } from '@/components/MarketAtmosphere';
import { PlayerFilter } from '@/components/PlayerFilter';
import { PortraitCard, PORTRAIT_RATIO } from '@/components/PortraitCard';
import { SiteNav } from '@/components/SiteNav';
import { useColumns } from '@/components/TileGrid';
import { Button, colors, Muted, Title } from '@/components/ui';
import { PLAYERS, type FcPlayer } from '@/lib/fcPlayers';
import { playerMedia } from '@/lib/playerMedia';
import { EMPTY_FILTERS, filtersActive, playerMatches, type PlayerFilters } from '@/lib/playerFilter';

const PAGE_SIZE = 36;

type SearchEntry = {
  player: FcPlayer;
  searchStr: string;
};

const SEARCH_CATALOG: SearchEntry[] = PLAYERS.map((p) => {
  const media = playerMedia(p.baseId ?? p.id);
  const parts = [
    p.name,
    p.club,
    p.league,
    p.nation,
    p.regularClub ?? '',
    p.regularLeague ?? '',
    p.en ?? '',
    media.en,
  ];
  return {
    player: p,
    searchStr: parts.join(' ').toLowerCase(),
  };
});

function Pager({
  page,
  totalPages,
  onPrev,
  onNext,
  onJump,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (page: number) => void;
}) {
  const windowPages = useMemo(() => {
    if (totalPages <= 1) return [] as number[];
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const from = Math.max(1, end - 4);
    for (let n = from; n <= end; n += 1) pages.push(n);
    return pages;
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <View style={{ gap: 10, marginVertical: 8 }}>
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <Button label="הקודם" variant="ghost" disabled={page <= 1} onPress={onPrev} />
        <Text style={{ color: colors.text, fontWeight: '800', minWidth: 88, textAlign: 'center' }}>
          {page} / {totalPages}
        </Text>
        <Button label="הבא" variant="ghost" disabled={page >= totalPages} onPress={onNext} />
      </View>
      <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
        {windowPages[0] > 1 ? (
          <PageChip label="1" active={false} onPress={() => onJump(1)} />
        ) : null}
        {windowPages[0] > 2 ? <Text style={{ color: colors.muted, paddingHorizontal: 4 }}>…</Text> : null}
        {windowPages.map((n) => (
          <PageChip key={n} label={String(n)} active={n === page} onPress={() => onJump(n)} />
        ))}
        {windowPages[windowPages.length - 1] < totalPages - 1 ? (
          <Text style={{ color: colors.muted, paddingHorizontal: 4 }}>…</Text>
        ) : null}
        {windowPages[windowPages.length - 1] < totalPages ? (
          <PageChip label={String(totalPages)} active={false} onPress={() => onJump(totalPages)} />
        ) : null}
      </View>
    </View>
  );
}

function PageChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        minWidth: 36,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: active ? colors.gold : colors.card,
        borderWidth: 1,
        borderColor: active ? colors.gold : colors.line,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: active ? colors.goldInk : colors.text, fontWeight: '800' }}>{label}</Text>
    </Pressable>
  );
}

export default function MarketScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<PlayerFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const router = useRouter();
  const listRef = useRef<FlatList>(null);
  const columns = useColumns(5, 2);
  const { width } = useWindowDimensions();
  const maxWidth = 1120;
  const contentWidth = Math.min(width, maxWidth) - 32;
  const gap = 12;
  const cardWidth = Math.floor((contentWidth - gap * (columns - 1)) / columns);

  useEffect(() => {
    if (query !== debouncedQuery) {
      setIsSearching(true);
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, debouncedQuery]);

  const players = useMemo(() => {
    const text = debouncedQuery.trim().toLowerCase();
    const activeFilt = filtersActive(filters);
    if (!text && !activeFilt) {
      return PLAYERS;
    }
    return SEARCH_CATALOG.filter(({ player, searchStr }) => {
      if (activeFilt && !playerMatches(player, filters)) return false;
      if (text && !searchStr.includes(text)) return false;
      return true;
    }).map((entry) => entry.player);
  }, [debouncedQuery, filters]);

  const totalPages = Math.max(1, Math.ceil(players.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filters]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagePlayers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return players.slice(start, start + PAGE_SIZE);
  }, [players, safePage]);

  const rows = useMemo(() => {
    const next: FcPlayer[][] = [];
    for (let index = 0; index < pagePlayers.length; index += columns) {
      next.push(pagePlayers.slice(index, index + columns));
    }
    return next;
  }, [pagePlayers, columns]);

  const rowHeight = Math.round(cardWidth * PORTRAIT_RATIO) + gap;
  const from = players.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, players.length);

  function goTo(nextPage: number) {
    const clamped = Math.max(1, Math.min(totalPages, nextPage));
    setPage(clamped);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }

  const pager = (
    <Pager
      page={safePage}
      totalPages={totalPages}
      onPrev={() => goTo(safePage - 1)}
      onNext={() => goTo(safePage + 1)}
      onJump={goTo}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#050A08' }}>
      <SceneAtmosphere scene="market" />
      <SiteNav />
      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(_, index) => `row-${safePage}-${index}`}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={3}
        removeClippedSubviews={Platform.OS !== 'web'}
        getItemLayout={(_, index) => ({ length: rowHeight, offset: rowHeight * index, index })}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 28,
          gap,
          width: '100%',
          maxWidth,
          alignSelf: 'center',
        }}
        ListHeaderComponent={
          <View
            style={{
              gap: 12,
              marginBottom: 8,
              backgroundColor: 'rgba(6, 12, 10, 0.72)',
              borderRadius: 18,
              borderWidth: 1,
              borderColor: 'rgba(227, 179, 65, 0.18)',
              padding: 14,
            }}
          >
            <Title>שחקנים</Title>
            <Muted>
              {PLAYERS.length.toLocaleString('he-IL')} קלפים במאגר · {PAGE_SIZE} בעמוד · לחיצה פותחת פרטים מלאים.
            </Muted>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  backgroundColor: 'rgba(16, 28, 24, 0.92)',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: isSearching ? colors.gold : 'rgba(255,255,255,0.14)',
                  paddingHorizontal: 12,
                }}
              >
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="חיפוש לפי שם, עמדה, קבוצה או ליגה..."
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    color: colors.text,
                    paddingVertical: 12,
                    fontSize: 16,
                    textAlign: 'right',
                  }}
                />
                {isSearching ? (
                  <ActivityIndicator size="small" color={colors.gold} style={{ marginLeft: 6 }} />
                ) : query ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="נקה חיפוש"
                    onPress={() => {
                      setQuery('');
                      setDebouncedQuery('');
                    }}
                    style={{ padding: 6 }}
                  >
                    <Text style={{ color: colors.muted, fontSize: 16, fontWeight: '700' }}>✕</Text>
                  </Pressable>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setFilterOpen(true)}
                style={{
                  minHeight: 44,
                  paddingHorizontal: 12,
                  justifyContent: 'center',
                  backgroundColor: filtersActive(filters) ? 'rgba(227, 179, 65, 0.2)' : 'transparent',
                  borderRadius: 10,
                  borderWidth: filtersActive(filters) ? 1 : 0,
                  borderColor: colors.gold,
                }}
              >
                <Text
                  style={{
                    color: filtersActive(filters) ? colors.gold : 'rgba(244,247,242,0.72)',
                    fontWeight: '700',
                    fontSize: 16,
                  }}
                >
                  סינון {filtersActive(filters) ? '●' : ''}
                </Text>
              </Pressable>
            </View>
            <Text style={{ color: colors.muted, textAlign: 'right', fontWeight: '700' }}>
              {players.length === 0
                ? 'אין תוצאות'
                : `מציג ${from}–${to} מתוך ${players.length.toLocaleString('he-IL')}`}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View
            style={{
              marginTop: 8,
              backgroundColor: 'rgba(6, 12, 10, 0.72)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(227, 179, 65, 0.16)',
              paddingVertical: 8,
              paddingHorizontal: 10,
            }}
          >
            {pager}
          </View>
        }
        ListEmptyComponent={
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 24, fontWeight: '700' }}>
            לא נמצאו שחקנים לחיפוש הזה
          </Text>
        }
        renderItem={({ item: row }) => (
          <View style={{ flexDirection: 'row-reverse', gap, marginBottom: gap }}>
            {row.map((player: FcPlayer) => (
              <Pressable
                key={player.id}
                accessibilityRole="button"
                onPress={() => router.push(`/market/${player.id}`)}
                style={{ width: cardWidth, alignItems: 'center' }}
              >
                <PortraitCard player={player} width={cardWidth} />
              </Pressable>
            ))}
            {Array.from({ length: columns - row.length }).map((_, index) => (
              <View key={`pad-${index}`} style={{ width: cardWidth }} />
            ))}
          </View>
        )}
      />
      {filterOpen ? (
        <PlayerFilter filters={filters} onChange={setFilters} onClose={() => setFilterOpen(false)} />
      ) : null}
    </View>
  );
}
