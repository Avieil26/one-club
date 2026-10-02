import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { NationFlag } from '@/components/NationFlag';
import { TypeShell } from '@/components/PortraitCard';
import { colors } from '@/components/ui';
import { PLAYERS } from '@/lib/fcPlayers';
import { LEAGUE_LOGO } from '@/lib/leagueLogo';
import {
  EMPTY_FILTERS,
  filterChoices,
  type CardKind,
  type PlayerFilters,
} from '@/lib/playerFilter';

type Panel = 'menu' | 'kind' | 'nation' | 'squad' | 'position' | 'rating';

const KINDS: { id: CardKind; label: string }[] = [
  { id: 'gold', label: 'גולד' },
  { id: 'silver', label: 'סילבר' },
  { id: 'icon', label: 'אייקון' },
  { id: 'hero', label: 'הירו' },
  { id: 'totw', label: 'TOTW' },
  { id: 'promo', label: 'OTW' },
];

const TEXT = '#F4F7F2';
const QUIET = 'rgba(214,222,232,0.72)';
const LINE = 'rgba(170,186,204,0.28)';
const PRESETS = [70, 75, 80, 85, 90];

function kindLabel(kind: CardKind) {
  return KINDS.find((option) => option.id === kind)?.label ?? '';
}

function ratingLabel(filters: PlayerFilters, low: number, high: number) {
  if (filters.minRating != null && filters.maxRating == null && PRESETS.includes(filters.minRating)) return `${filters.minRating}+`;
  if (filters.minRating != null || filters.maxRating != null) return `${filters.minRating ?? low}–${filters.maxRating ?? high}`;
  return '';
}

export function PlayerFilter({
  filters,
  onChange,
  onClose,
}: {
  filters: PlayerFilters;
  onChange: (next: PlayerFilters) => void;
  onClose: () => void;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const [panel, setPanel] = useState<Panel>('menu');
  const [leagueQuery, setLeagueQuery] = useState('');
  const choices = useMemo(() => filterChoices(PLAYERS), []);
  const clubs = filters.league ? (choices.clubsByLeague.get(filters.league) ?? []) : [];
  const leagues = choices.leagues.filter((name) => !leagueQuery.trim() || name.toLowerCase().includes(leagueQuery.trim().toLowerCase()));

  function toggleKind(kind: CardKind) {
    onChange({ ...filters, kind: filters.kind === kind ? 'all' : kind });
  }

  function toggleNation(nation: string | null) {
    onChange({ ...filters, nation: filters.nation === nation ? null : nation });
  }

  function toggleLeague(league: string) {
    if (filters.league === league) {
      onChange({ ...filters, league: null, club: null });
      return;
    }
    onChange({ ...filters, league, club: null });
  }

  function toggleClub(club: string) {
    onChange({ ...filters, club: filters.club === club ? null : club });
  }

  function togglePosition(position: string) {
    onChange({ ...filters, position: filters.position === position ? null : position });
  }

  const title =
    panel === 'menu' ? 'סינון' : panel === 'kind' ? 'סוג קלף' : panel === 'nation' ? 'מדינה' : panel === 'squad' ? 'ליגה וקבוצה' : panel === 'position' ? 'עמדה' : 'דירוג';

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="סגור סינון" onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />
      <View
        style={{
          width: '100%',
          maxWidth: 560,
          height: Math.min(windowHeight * 0.72, 560),
          backgroundColor: '#1A2030',
          borderRadius: 18,
          borderWidth: 1,
          borderColor: LINE,
          padding: 18,
          gap: 14,
          overflow: 'hidden',
        }}
      >
        <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: TEXT, fontSize: 18, fontWeight: '500' }}>{title}</Text>
          <Pressable accessibilityRole="button" onPress={panel === 'menu' ? onClose : () => setPanel('menu')}>
            <Text style={{ color: QUIET, fontSize: 14, fontWeight: '500' }}>{panel === 'menu' ? 'סגור' : 'חזרה'}</Text>
          </Pressable>
        </View>
        <View style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {panel === 'menu' ? (
          <View>
            <MenuRow label="סוג קלף" value={filters.kind === 'all' ? '' : kindLabel(filters.kind)} onPress={() => setPanel('kind')} />
            <MenuRow label="מדינה" value={filters.nation ?? ''} onPress={() => setPanel('nation')} />
            <MenuRow label="ליגה וקבוצה" value={[filters.league, filters.club].filter(Boolean).join(' · ')} onPress={() => setPanel('squad')} />
            <MenuRow label="עמדה" value={filters.position ?? ''} onPress={() => setPanel('position')} />
            <MenuRow label="דירוג" value={ratingLabel(filters, choices.ratingMin, choices.ratingMax)} onPress={() => setPanel('rating')} />
            <Pressable accessibilityRole="button" onPress={() => onChange(EMPTY_FILTERS)} style={{ alignSelf: 'center', marginTop: 14, minHeight: 32, justifyContent: 'center' }}>
              <Text style={{ color: QUIET, fontWeight: '500' }}>נקה</Text>
            </Pressable>
          </View>
        ) : null}

        {panel === 'kind' ? (
          <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ flexDirection: 'row', direction: 'rtl', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
            <TypePick label="סילבר" kind="silver" active={filters.kind === 'silver'} onPress={() => toggleKind('silver')} />
            <TypePick label="גולד" kind="gold" active={filters.kind === 'gold'} onPress={() => toggleKind('gold')} />
            <TypePick label="אייקון" kind="icon" active={filters.kind === 'icon'} onPress={() => toggleKind('icon')} />
            <TypePick label="הירו" kind="hero" active={filters.kind === 'hero'} onPress={() => toggleKind('hero')} />
            <TypePick label="TOTW" kind="totw" active={filters.kind === 'totw'} onPress={() => toggleKind('totw')} />
            <TypePick label="OTW" kind="otw" active={filters.kind === 'promo'} onPress={() => toggleKind('promo')} />
          </ScrollView>
        ) : null}

        {panel === 'nation' ? (
          <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ flexDirection: 'row', direction: 'rtl', flexWrap: 'wrap', gap: 8 }}>
            {choices.nations.map((nation) => (
              <Pressable
                key={nation}
                accessibilityRole="button"
                onPress={() => toggleNation(nation)}
                style={{
                  width: '23%',
                  minWidth: 76,
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: filters.nation === nation ? 'rgba(255,255,255,0.85)' : 'transparent',
                }}
              >
                <NationFlag nation={nation} size={26} />
                <Text style={{ color: filters.nation === nation ? TEXT : QUIET, fontWeight: '500', fontSize: 12, textAlign: 'center' }}>{nation}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {panel === 'squad' ? (
          <View style={{ flex: 1, minHeight: 0, flexDirection: 'row', direction: 'rtl', gap: 12, overflow: 'hidden' }}>
            <View style={{ flex: 1, minWidth: 0, minHeight: 0, gap: 8, overflow: 'hidden' }}>
              <Text style={{ color: QUIET, fontWeight: '500', textAlign: 'right' }}>ליגה</Text>
              <TextInput
                value={leagueQuery}
                onChangeText={setLeagueQuery}
                placeholder="חיפוש ליגה"
                placeholderTextColor={QUIET}
                style={{ color: TEXT, borderBottomWidth: 1, borderBottomColor: LINE, paddingVertical: 6, textAlign: 'right', fontWeight: '500' }}
              />
              <ScrollView style={{ flex: 1, minHeight: 0 }}>
                {leagues.map((league) => (
                  <Pressable key={league} accessibilityRole="button" onPress={() => toggleLeague(league)} style={{ minHeight: 40, flexDirection: 'row', direction: 'rtl', alignItems: 'center', gap: 8 }}>
                    {LEAGUE_LOGO[league] ? <Image source={LEAGUE_LOGO[league]} style={{ width: 18, height: 18 }} resizeMode="contain" /> : null}
                    <Text style={{ color: filters.league === league ? TEXT : QUIET, fontWeight: '500', textDecorationLine: filters.league === league ? 'underline' : 'none', flexShrink: 1 }}>{league}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <View style={{ width: 1, backgroundColor: LINE }} />
            <View style={{ flex: 1, minWidth: 0, minHeight: 0, gap: 8, overflow: 'hidden' }}>
              <Text style={{ color: QUIET, fontWeight: '500', textAlign: 'right' }}>קבוצה</Text>
              <ScrollView style={{ flex: 1, minHeight: 0 }}>
                {filters.league ? (
                  clubs.map((club) => (
                    <Pressable key={club} accessibilityRole="button" onPress={() => toggleClub(club)} style={{ minHeight: 40, justifyContent: 'center' }}>
                      <Text style={{ color: filters.club === club ? TEXT : QUIET, fontWeight: '500', textAlign: 'right', textDecorationLine: filters.club === club ? 'underline' : 'none' }}>{club}</Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={{ color: QUIET, fontWeight: '500', textAlign: 'right' }}>בחרו ליגה</Text>
                )}
              </ScrollView>
            </View>
          </View>
        ) : null}

        {panel === 'position' ? (
          <View style={{ flexDirection: 'row', direction: 'rtl', flexWrap: 'wrap', gap: 14 }}>
            {choices.positions.map((position) => (
              <Choice key={position} label={position} active={filters.position === position} onPress={() => togglePosition(position)} />
            ))}
          </View>
        ) : null}

        {panel === 'rating' ? (
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', direction: 'rtl', flexWrap: 'wrap', gap: 14 }}>
              {PRESETS.map((rating) => (
                <Choice
                  key={rating}
                  label={`${rating}+`}
                  active={filters.minRating === rating && filters.maxRating == null}
                  onPress={() =>
                    onChange(
                      filters.minRating === rating && filters.maxRating == null
                        ? { ...filters, minRating: null, maxRating: null }
                        : { ...filters, minRating: rating, maxRating: null },
                    )
                  }
                />
              ))}
            </View>
            <RatingEnd
              label="מ־"
              value={filters.minRating}
              fallback={choices.ratingMin}
              min={choices.ratingMin}
              max={filters.maxRating ?? choices.ratingMax}
              onChange={(minRating) => onChange({ ...filters, minRating })}
            />
            <RatingEnd
              label="עד"
              value={filters.maxRating}
              fallback={choices.ratingMax}
              min={filters.minRating ?? choices.ratingMin}
              max={choices.ratingMax}
              onChange={(maxRating) => onChange({ ...filters, maxRating })}
            />
            <Text style={{ color: QUIET, fontWeight: '500', textAlign: 'right' }}>לחיצה על המספר מבטלת את הקצה</Text>
          </View>
        ) : null}
        </View>
      </View>
    </View>
  );
}

function MenuRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 46, flexDirection: 'row', direction: 'rtl', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: LINE }}>
      <Text style={{ color: TEXT, fontSize: 16, fontWeight: '500' }}>{label}</Text>
      <Text style={{ color: QUIET, fontSize: 14, fontWeight: '500' }}>{value}</Text>
    </Pressable>
  );
}

function TypePick({
  label,
  kind,
  active,
  onPress,
}: {
  label: string;
  kind: 'gold' | 'silver' | 'icon' | 'otw' | 'hero' | 'totw';
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ width: 112, alignItems: 'center', gap: 8 }}>
      <View style={{ borderRadius: 14, borderWidth: 1, borderColor: active ? 'rgba(255,255,255,0.9)' : 'transparent', padding: 3 }}>
        <TypeShell kind={kind} width={100} />
      </View>
      <Text style={{ color: active ? TEXT : QUIET, fontSize: 14, fontWeight: '500', textDecorationLine: active ? 'underline' : 'none' }}>{label}</Text>
    </Pressable>
  );
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ paddingVertical: 6 }}>
      <Text style={{ color: active ? TEXT : QUIET, fontSize: 16, fontWeight: '500', textDecorationLine: active ? 'underline' : 'none' }}>{label}</Text>
    </Pressable>
  );
}

function RatingEnd({
  label,
  value,
  fallback,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number | null;
  fallback: number;
  min: number;
  max: number;
  onChange: (next: number | null) => void;
}) {
  const shown = value ?? fallback;
  function step(delta: number) {
    const next = Math.min(max, Math.max(min, (value ?? fallback) + delta));
    onChange(next);
  }
  return (
    <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: TEXT, fontSize: 16, fontWeight: '500' }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable accessibilityRole="button" onPress={() => step(-1)}><Text style={{ color: TEXT, fontSize: 20, fontWeight: '500' }}>−</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => onChange(null)}>
          <Text style={{ color: value == null ? QUIET : TEXT, fontSize: 18, fontWeight: '500', minWidth: 36, textAlign: 'center' }}>{shown}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => step(1)}><Text style={{ color: TEXT, fontSize: 20, fontWeight: '500' }}>+</Text></Pressable>
      </View>
    </View>
  );
}
