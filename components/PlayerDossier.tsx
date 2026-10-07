import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';

import { ClubBadge } from '@/components/ClubBadge';
import { MarketQuote } from '@/components/MarketQuote';
import { NationFlag } from '@/components/NationFlag';
import { PortraitCard } from '@/components/PortraitCard';
import { destinedCardMeta, destinedEdition } from '@/lib/destinedEditions';
import { marketQuote, useMarketPrices } from '@/lib/marketPrices';
import { otwFor, totwFor } from '@/lib/specialCards';
import { colors } from '@/components/ui';
import type { FcPlayer } from '@/lib/fcPlayers';
import { playerMedia } from '@/lib/playerMedia';
import { otwCardMeta, playerCardMeta, statGroups, statTone, totwCardMeta, type MetaAttr } from '@/lib/playerMeta';
import { boostedStat, chemFaceDelta, CHEM_STYLES, type ChemBoosts } from '@/lib/chemStyles';
import { LEAGUE_LOGO } from '@/lib/leagueLogo';
import { playerHeight } from '@/lib/playerHeight';
import { addPlayerComment, loadPlayerTalk, voteOnComment, voteOnPlayer, type PlayerTalk } from '@/lib/playerTalk';
import { useApp } from '@/lib/store';

function Stars({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: 5 }, (_, index) => (
        <Text key={index} style={{ color: index < count ? '#E3B341' : '#5C6570', fontSize: 16 }}>
          ★
        </Text>
      ))}
    </View>
  );
}

function toneBar(value: number) {
  return (
    <View style={{ height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 4 }}>
      <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', backgroundColor: statTone(value) }} />
    </View>
  );
}

function SkillMark() {
  return (
    <Svg width={28} height={28} viewBox="0 0 32 32">
      <Path d="M7 22c1.5-7 7-12 13-10 1.5 5-2 9-6 11-1.5 3.5-5 5.5-8.5 4 1-2 1.5-3.5 1.5-5z" fill="#E3B341" />
      <Path d="M18 7.5a9 9 0 0 1 7.5 6.5" stroke="#F6E7B2" strokeWidth={1.7} fill="none" />
      <Path d="M24.2 8.2l2.4 3.1-3.3.4z" fill="#F6E7B2" />
    </Svg>
  );
}

function ChemGlyph({ id, color }: { id: string; color: string }) {
  const stroke = { stroke: color, fill: 'none' as const, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      {id === 'basic' ? <Circle cx={8} cy={8} r={3} {...stroke} /> : null}
      {id === 'hunter' ? <Path {...stroke} d="M2 11c2.4-.3 3.8-3.2 5.4-5.2C9 7.2 11 8 14 7.2M8 5.4l.7-2.2 2 .7" /> : null}
      {id === 'shadow' ? <Path {...stroke} d="M8 2.4c2 1.8 2.6 3.4 2.6 5.2 0 2.5-1 4.6-2.6 5.8C6.4 12.2 5.4 10.1 5.4 7.6 5.4 5.8 6 4.2 8 2.4z" /> : null}
      {id === 'catalyst' ? <Path {...stroke} d="M6.2 2.4h3.6M7.2 2.4v2.6L4.8 12.4h6.4L8.8 5V2.4" /> : null}
      {id === 'engine' ? (
        <>
          <Circle cx={8} cy={8} r={2.1} {...stroke} />
          <Path {...stroke} d="M8 2.2v1.8M8 12v1.8M2.2 8h1.8M12 8h1.8M4.1 4.1l1.3 1.3M10.6 10.6l1.3 1.3M11.9 4.1l-1.3 1.3M5.4 10.6l-1.3 1.3" />
        </>
      ) : null}
      {id === 'anchor' ? <Path {...stroke} d="M8 2.4v8.2M5.2 6.2h5.6M8 10.6c-2 0-3.2 1-3.2 2.2M8 10.6c2 0 3.2 1 3.2 2.2" /> : null}
      {id === 'hawk' ? <Path {...stroke} d="M2 9c2.8-.8 4-2.8 6-4.8 2 2 3.2 4 6 4.8-2 .8-4 2.6-6 2.6S4 9.8 2 9z" /> : null}
      {id === 'finisher' ? (
        <>
          <Circle cx={8} cy={8} r={4.2} {...stroke} />
          <Circle cx={8} cy={8} r={1.3} {...stroke} />
        </>
      ) : null}
      {id === 'sniper' ? (
        <>
          <Circle cx={8} cy={8} r={2.8} {...stroke} />
          <Path {...stroke} d="M8 1.8v2.2M8 12v2.2M1.8 8h2.2M12 8h2.2" />
        </>
      ) : null}
      {id === 'deadeye' ? (
        <>
          <Path {...stroke} d="M1.8 8s2.4-3.2 6.2-3.2S14.2 8 14.2 8 11.8 11.2 8 11.2 1.8 8 1.8 8z" />
          <Circle cx={8} cy={8} r={1.4} {...stroke} />
        </>
      ) : null}
      {id === 'marksman' ? <Path {...stroke} d="M8 2.2v3.2M8 10.6v3.2M2.2 8h3.2M10.6 8h3.2M4.4 4.4l1.8 1.8M9.8 9.8l1.8 1.8M11.6 4.4L9.8 6.2M6.2 9.8l-1.8 1.8" /> : null}
      {id === 'artist' ? <Path {...stroke} d="M3.5 12.2l6.2-7 1.8 1.8-6.2 7H3.5zM10.6 4.2l1.6 1.6" /> : null}
      {id === 'architect' ? <Path {...stroke} d="M2.8 13h10.4L8 3z" /> : null}
      {id === 'powerhouse' ? <Path {...stroke} d="M8 2.2v3.4M5.6 4.8 8 7.2l2.4-2.4M4 9h8v3.2H4z" /> : null}
      {id === 'maestro' ? <Path {...stroke} d="M6 12.2V5.6l6.4-1.8v5.2M6 12.2a1.4 1.4 0 1 1-1.8-.2M12.4 9a1.4 1.4 0 1 1-1.8-.2" /> : null}
      {id === 'sentinel' ? <Path {...stroke} d="M8 2.2l4.4 1.8v4c0 2.8-1.8 4.6-4.4 5.6-2.6-1-4.4-2.8-4.4-5.6v-4z" /> : null}
      {id === 'guardian' ? <Path {...stroke} d="M8 2.2l4.2 2v3.6c0 2.6-1.8 4.2-4.2 5.2-2.4-1-4.2-2.6-4.2-5.2V4.2zM8 6.2v4.2" /> : null}
      {id === 'gladiator' ? <Path {...stroke} d="M3 7.2h10v2.2c0 2.6-2 4.2-5 5.2-3-1-5-2.6-5-5.2zM3 7.2c.8-2 2.4-3 5-3s4.2 1 5 3" /> : null}
      {id === 'backbone' ? <Path {...stroke} d="M8 2.2v11.6M5.4 5h5.2M5.4 8h5.2M5.4 11h5.2" /> : null}
    </Svg>
  );
}

const CHEM_GROUPS = [
  { title: 'Controlled', ids: ['architect', 'artist', 'backbone', 'basic', 'deadeye', 'finisher', 'gladiator', 'guardian', 'maestro', 'marksman', 'powerhouse', 'sentinel', 'sniper'] },
  { title: 'Explosive', ids: ['anchor', 'catalyst', 'engine', 'hawk', 'hunter', 'shadow'] },
];

function Identity({ player, compact }: { player: FcPlayer; compact?: boolean }) {
  const text = compact ? 13 : 15;
  if (player.icon) {
    return (
      <View style={{ gap: 8, alignItems: 'flex-end' }}>
        <Text style={{ color: '#E8C86A', fontWeight: '800', fontSize: compact ? 12 : 13, letterSpacing: 1.4 }}>אייקון</Text>
        <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', gap: 8 }}>
          <NationFlag nation={player.nation} size={compact ? 14 : 16} />
          <Text style={{ color: '#F4F7F2', fontWeight: '700', fontSize: text }}>{player.nation}</Text>
        </View>
        {playerHeight(player.baseId ?? player.id) ? (
          <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: '#C5D5C8', fontSize: compact ? 12 : 14 }}>{playerHeight(player.baseId ?? player.id)!.cm} ס״מ</Text>
            <Text style={{ color: '#F4F7F2', fontSize: compact ? 12 : 14, fontWeight: '800' }}>{'\u200E'}{playerHeight(player.baseId ?? player.id)!.feet}</Text>
          </View>
        ) : null}
        {player.playstyles?.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', maxWidth: 420 }}>
            {player.playstyles.map((style) => (
              <Text key={style.name} style={{ color: style.plus ? '#E8C86A' : '#C5D0C8', fontSize: 12, fontWeight: style.plus ? '800' : '600' }}>
                {style.name}
                {style.plus ? ' +' : ''}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    );
  }
  const logo = LEAGUE_LOGO[player.league];
  const height = playerHeight(player.baseId ?? player.id);
  return (
    <View style={{ gap: compact ? 6 : 8, alignItems: 'flex-end' }}>
      <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', gap: 8 }}>
        <ClubBadge club={player.club} size={compact ? 20 : 26} />
        <Text style={{ color: '#F4F7F2', fontWeight: '700', fontSize: text }}>{player.club}</Text>
      </View>
      <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', gap: 8 }}>
        {logo ? <Image source={logo} resizeMode="contain" style={{ width: compact ? 72 : 84, height: compact ? 32 : 38 }} /> : null}
        <Text style={{ color: '#E7D7A1', fontWeight: '700', fontSize: compact ? 13 : 14 }}>{player.league}</Text>
      </View>
      {height ? (
        <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#C5D5C8', fontSize: compact ? 12 : 14 }}>{height.cm} ס״מ</Text>
          <Text style={{ color: '#F4F7F2', fontSize: compact ? 12 : 14, fontWeight: '800' }}>{'\u200E'}{height.feet}</Text>
        </View>
      ) : null}
      {player.playstyles?.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', maxWidth: 420 }}>
          {player.playstyles.map((style) => (
            <Text key={style.name} style={{ color: style.plus ? '#E8C86A' : '#C5D0C8', fontSize: 12, fontWeight: style.plus ? '800' : '600' }}>
              {style.name}
              {style.plus ? ' +' : ''}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function BootPair({ foot, wide, narrow }: { foot: 'L' | 'R'; wide: boolean; narrow?: boolean }) {
  return (
    <View style={{ width: narrow ? 210 : wide ? 300 : 240, maxWidth: '100%' }}>
      <Image
        source={require('@/assets/images/boots-flat.png')}
        resizeMode="contain"
        style={{ width: '100%', height: wide ? 120 : 100, transform: foot === 'L' ? [{ scaleX: -1 }] : undefined }}
      />
      <View style={{ flexDirection: 'row', direction: 'ltr', justifyContent: 'space-between', paddingHorizontal: 18 }}>
        <Text style={{ color: foot === 'L' ? '#E3B341' : '#9AA3A8', fontWeight: '700', fontSize: 12 }}>שמאל</Text>
        <Text style={{ color: foot === 'R' ? '#E3B341' : '#9AA3A8', fontWeight: '700', fontSize: 12 }}>ימין</Text>
      </View>
    </View>
  );
}

function Group({
  group,
  compact,
  boosts,
  totalBoost,
  isPotential,
}: {
  group: { label: string; total?: number; rows: { key: string; label: string; value: number }[] };
  compact: boolean;
  boosts?: ChemBoosts;
  totalBoost?: number;
  isPotential?: boolean;
}) {
  const total = Math.min(99, (group.total ?? 0) + (totalBoost ?? 0));
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        gap: 4,
        padding: compact ? 8 : 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: isPotential ? 'rgba(56,189,248,0.35)' : 'rgba(227,179,65,0.18)',
        backgroundColor: isPotential ? 'rgba(10,25,45,0.65)' : 'rgba(0,0,0,0.35)',
        direction: 'ltr',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 6 }}>
        <Text style={{ color: isPotential ? '#7dd3fc' : '#F4F7F2', fontSize: compact ? 13 : 16, fontWeight: '800' }}>{group.label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          {totalBoost ? <Text style={{ color: '#3DDC97', fontSize: compact ? 12 : 14, fontWeight: '800' }}>+{totalBoost}</Text> : null}
          <Text style={{ color: totalBoost ? '#3DDC97' : isPotential ? '#38bdf8' : statTone(total), fontSize: compact ? 18 : 22, fontWeight: '900' }}>{total}</Text>
        </View>
      </View>
      {toneBar(total)}
      {group.rows.map((row) => {
        const boost = boosts?.[row.key as MetaAttr] ?? 0;
        const shown = boostedStat(row.value, boost);
        return (
          <View key={row.key} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, gap: 6 }}>
            <Text numberOfLines={1} style={{ color: '#C5D0C8', fontSize: compact ? 11 : 13, flex: 1 }}>
              {row.label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              {boost > 0 ? <Text style={{ color: '#8AF0C0', fontSize: 10, fontWeight: '700' }}>+{boost}</Text> : null}
              <Text style={{ color: boost > 0 ? '#3DDC97' : statTone(shown), fontSize: compact ? 12 : 13, fontWeight: '800' }}>{shown}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ago(iso: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `לפני ${minutes} דק׳`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `לפני ${hours} שע׳`;
  return `לפני ${Math.round(hours / 24)} ימים`;
}

function opening(player: FcPlayer): 'base' | 'destined' | 'hero' | 'totw' | 'otw' {
  if (player.edition === 'destined' || player.edition === 'hero' || player.edition === 'totw' || player.edition === 'otw') return player.edition;
  return 'base';
}

export function PlayerDossier({ player }: { player: FcPlayer }) {
  useMarketPrices();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const app = useApp();
  const personId = player.baseId ?? player.id;
  const media = playerMedia(personId);
  const baseMeta = playerCardMeta(personId);
  const [talk, setTalk] = useState<PlayerTalk | null>(null);
  const [edition, setEdition] = useState<'base' | 'destined' | 'hero' | 'totw' | 'otw'>(opening(player));
  const [shine, setShine] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [chemId, setChemId] = useState<string | null>(null);
  const [showPotential, setShowPotential] = useState(false);
  const userId = app.user?.id ?? null;

  useEffect(() => {
    let live = true;
    void loadPlayerTalk(personId, userId).then((next) => {
      if (live) setTalk(next);
    });
    return () => {
      live = false;
    };
  }, [personId, userId]);

  useEffect(() => {
    setChemId(null);
    setEdition(opening(player));
    setShine(false);
  }, [player.id, player.edition]);

  async function refresh() {
    setTalk(await loadPlayerTalk(personId, userId));
  }

  function requireUser() {
    if (!app.user) {
      Alert.alert('רגע', 'צריך להתחבר כדי להצביע או לכתוב');
      return false;
    }
    return true;
  }

  async function voteCard(vote: 1 | -1) {
    if (!requireUser() || !app.user || busy) return;
    setBusy(true);
    try {
      await voteOnPlayer(personId, app.user.id, vote);
      await refresh();
    } catch (error) {
      Alert.alert('רגע', error instanceof Error ? error.message : 'ההצבעה נכשלה');
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (!requireUser() || !app.user || busy) return;
    setBusy(true);
    try {
      const result = await addPlayerComment(personId, app.user.id, app.user.displayName, draft);
      setDraft('');
      await refresh();
      if (result === 'held') Alert.alert('נשמר לבדיקה', 'התגובה לא פורסמה כי היא לא עומדת בכללי הכבוד.');
    } catch (error) {
      Alert.alert('רגע', error instanceof Error ? error.message : 'התגובה נכשלה');
    } finally {
      setBusy(false);
    }
  }

  async function voteRow(commentId: string, vote: 1 | -1) {
    if (!requireUser() || !app.user || busy) return;
    setBusy(true);
    try {
      await voteOnComment(commentId, app.user.id, vote);
      await refresh();
    } catch (error) {
      Alert.alert('רגע', error instanceof Error ? error.message : 'ההצבעה נכשלה');
    } finally {
      setBusy(false);
    }
  }

  const promo = destinedEdition(personId);
  const totw = totwFor(personId);
  const otw = otwFor(personId);
  const viewingPromo = edition === 'destined' && promo != null;
  const viewingTotw = edition === 'totw' && (totw != null || player.edition === 'totw');
  const viewingOtw = edition === 'otw' && (otw != null || player.edition === 'otw');
  const viewingHero = edition === 'hero';
  const card: FcPlayer = viewingPromo
    ? { ...player, rating: promo.rating, position: promo.position, club: promo.club, league: promo.league, edition: 'destined' }
    : viewingTotw
      ? {
          ...player,
          rating: totw?.rating ?? player.rating,
          position: totw?.position ?? player.position,
          face: totw?.face ?? player.face,
          edition: 'totw',
          ...(totw?.positions?.length ? { positions: totw.positions } : {}),
          ...(totw?.playstyles?.length ? { playstyles: totw.playstyles } : {}),
        }
      : viewingOtw
        ? { ...player, rating: otw?.rating ?? player.rating, position: otw?.position ?? player.position, face: otw?.face ?? player.face, edition: 'otw', ...(otw?.positions?.length ? { positions: otw.positions } : {}), ...(otw?.playstyles?.length ? { playstyles: otw.playstyles } : {}) }
      : viewingHero
        ? { ...player, edition: 'hero' }
        : {
            ...player,
            rating: player.pairRating ?? player.rating,
            position: player.regularPosition ?? player.position,
            club: player.regularClub ?? player.club,
            league: player.regularLeague ?? player.league,
            edition: undefined,
            face: undefined,
          };
  const meta = viewingPromo ? destinedCardMeta(personId) : viewingTotw ? (totwCardMeta(totw ? personId : player.id) ?? baseMeta) : viewingOtw ? (otwCardMeta(personId) ?? baseMeta) : baseMeta;
  const face = viewingPromo ? promo.face : viewingTotw ? (card.face ?? media.face) : viewingOtw ? (card.face ?? media.face) : viewingHero ? player.face : media.face;
  const growth = Math.max(0, 89 - card.rating); // realistic potential delta if not strictly defined
  const metaStats = meta?.stats;

  const effectiveStats: Partial<Record<MetaAttr, number>> = {};
  if (metaStats) {
    (Object.keys(metaStats) as MetaAttr[]).forEach((key) => {
      const baseVal = metaStats[key] ?? 50;
      effectiveStats[key] = showPotential ? Math.min(99, baseVal + Math.round(growth * 1.05)) : baseVal;
    });
  }

  const effectiveFace = showPotential && face
    ? {
        pac: Math.min(99, face.pac + Math.round(growth * 0.9)),
        sho: Math.min(99, face.sho + Math.round(growth * 1.05)),
        pas: Math.min(99, face.pas + Math.round(growth * 1.05)),
        dri: Math.min(99, face.dri + Math.round(growth * 1.0)),
        def: Math.min(99, face.def + Math.round(growth * 0.9)),
        phy: Math.min(99, face.phy + Math.round(growth * 0.95)),
      }
    : face;

  const groups = statGroups(card.position, effectiveFace, effectiveStats).map((group) => ({
    ...group,
    rows: group.rows.flatMap((row) => {
      const value = effectiveStats[row.key];
      return value ? [{ ...row, value }] : [];
    }),
  }));
  const shown = viewingPromo ? 'destined' : viewingTotw ? 'totw' : viewingOtw ? 'otw' : viewingHero ? 'hero' : 'base';
  const quoteId = viewingPromo ? `${personId}--destined` : viewingTotw ? (totw ? `${personId}--totw` : player.id) : viewingOtw ? `${personId}--otw` : personId;
  const shineId = quoteId.endsWith('--totw') ? `${quoteId}-shine` : '';
  const shineQuote = shineId ? marketQuote(shineId) : null;
  const quote = shine && shineQuote ? shineQuote : marketQuote(quoteId);
  const hasRegular = player.edition !== 'hero' && !(player.edition === 'totw' && !player.baseId);
  const alts: { edition: 'base' | 'destined' | 'totw' | 'otw'; label: string }[] = [];
  if (hasRegular && shown !== 'base') alts.push({ edition: 'base', label: 'קלף רגיל' });
  if (promo && shown !== 'destined') alts.push({ edition: 'destined', label: 'קלף פרומו' });
  if ((totw || (player.edition === 'totw' && player.baseId)) && shown !== 'totw') alts.push({ edition: 'totw', label: 'TOTW' });
  if (otw && shown !== 'otw') alts.push({ edition: 'otw', label: 'קלף OTW' });

  const foot = meta?.foot;
  const iconPage = !!player.icon;
  const showChem = card.position !== 'GK' && !!meta;
  const chem = showChem ? CHEM_STYLES.find((style) => style.id === chemId) : undefined;
  const faceDelta = showChem && meta ? chemFaceDelta(meta.stats, chem?.boosts) : {};
  const faceKey: Record<string, 'pac' | 'sho' | 'pas' | 'dri' | 'def' | 'phy'> = {
    Pace: 'pac',
    Shooting: 'sho',
    Passing: 'pas',
    Dribbling: 'dri',
    Defending: 'def',
    Physical: 'phy',
  };
  const compact = !wide;
  const tight = width < 430;
  const columns = wide && iconPage && meta ? 2 : width >= 680 ? 3 : 2;

  const likes = (
    <View style={{ flexDirection: 'row', direction: 'ltr', gap: 8 }}>
      <Pressable
        onPress={() => void voteCard(1)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: talk?.mine === 1 ? '#E3B341' : '#1A2430',
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <Text style={{ color: talk?.mine === 1 ? '#1A1408' : '#F4F7F2', fontSize: 16 }}>👍</Text>
        <Text style={{ color: talk?.mine === 1 ? '#1A1408' : '#F4F7F2', fontWeight: '900', fontSize: 16 }}>{talk?.up ?? 0}</Text>
      </Pressable>
      <Pressable
        onPress={() => void voteCard(-1)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: talk?.mine === -1 ? '#8E96A3' : '#1A2430',
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <Text style={{ fontSize: 16 }}>👎</Text>
        <Text style={{ color: '#F4F7F2', fontWeight: '900', fontSize: 16 }}>{talk?.down ?? 0}</Text>
      </Pressable>
    </View>
  );

  const boots = foot === 'L' || foot === 'R' ? <BootPair foot={foot} wide={wide} narrow={iconPage} /> : null;

  const skills = meta ? (
    <View style={{ gap: 12, alignItems: 'flex-end' }}>
      <View style={{ gap: 4, alignItems: 'flex-end' }}>
        <Text style={{ color: iconPage ? '#E8C86A' : '#E7D7A1', fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>רגל חלשה</Text>
        <Stars count={meta.weakFoot} />
      </View>
      <View style={{ gap: 4, alignItems: 'flex-end' }}>
        <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', gap: 6 }}>
          <SkillMark />
          <Text style={{ color: iconPage ? '#E8C86A' : '#E7D7A1', fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>סקיל</Text>
        </View>
        <Stars count={meta.skillMoves} />
      </View>
    </View>
  ) : (
    <Text style={{ color: iconPage ? '#C9B48A' : colors.muted, fontSize: 13, textAlign: 'right' }}>אין נתון רשמי לרגל ולסקיל</Text>
  );

  const accent = iconPage ? '#E8C86A' : '#E3B341';

  return (
    <View style={{ width: '100%', maxWidth: 1120, alignSelf: 'center', gap: 40 }}>
    <View
      style={{
        width: '100%',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: iconPage ? 'rgba(232,200,106,0.38)' : 'rgba(227,179,65,0.55)',
        backgroundColor: iconPage ? 'transparent' : 'rgba(6,10,12,0.78)',
        padding: wide ? 22 : 14,
        gap: wide ? 22 : 16,
        overflow: iconPage ? 'hidden' : 'visible',
      }}
    >
      {iconPage ? (
        <LinearGradient
          colors={['rgba(8,7,6,0.94)', 'rgba(8,7,6,0.88)', 'rgba(8,7,6,0.55)']}
          locations={[0, 0.62, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {wide ? (
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', direction: 'ltr', gap: 18, alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', gap: 10 }}>
              {likes}
              <PortraitCard player={card} width={210} edition={shown} glow={shown === 'totw' && shine} />
              {alts.map((alt) => (
                <Pressable key={alt.edition} accessibilityRole="button" accessibilityLabel={alt.label} onPress={() => setEdition(alt.edition)}>
                  <PortraitCard player={card} width={78} edition={alt.edition} />
                </Pressable>
              ))}
              {shown === 'totw' && shineQuote ? (
                <Pressable accessibilityRole="button" accessibilityLabel={shine ? 'קלף רגיל' : 'קלף עם זוהר'} onPress={() => setShine((on) => !on)}>
                  <PortraitCard player={card} width={78} edition="totw" glow={!shine} />
                </Pressable>
              ) : null}
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 12, alignItems: 'flex-end', direction: 'ltr', overflow: 'hidden' }}>
              <Text style={{ color: '#F7F4EA', fontSize: 28, fontWeight: '900', textAlign: 'right', alignSelf: 'stretch' }}>{player.name}</Text>
              {quote ? <MarketQuote console={quote.console} pc={quote.pc} /> : null}
              <Identity player={card} />
            </View>
            {iconPage ? null : (
              <View style={{ alignItems: 'flex-end', gap: 16, flexShrink: 1 }}>
                {skills}
                {boots}
              </View>
            )}
          </View>
          {iconPage ? (
            <View style={{ flexDirection: 'row', direction: 'ltr', justifyContent: 'flex-end', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {skills}
              {boots}
            </View>
          ) : null}
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', direction: 'ltr', gap: 10, alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {likes}
              <PortraitCard player={card} width={140} edition={shown} glow={shown === 'totw' && shine} />
              {alts.map((alt) => (
                <Pressable key={alt.edition} accessibilityRole="button" accessibilityLabel={alt.label} onPress={() => setEdition(alt.edition)}>
                  <PortraitCard player={card} width={62} edition={alt.edition} />
                </Pressable>
              ))}
              {shown === 'totw' && shineQuote ? (
                <Pressable accessibilityRole="button" accessibilityLabel={shine ? 'קלף רגיל' : 'קלף עם זוהר'} onPress={() => setShine((on) => !on)}>
                  <PortraitCard player={card} width={62} edition="totw" glow={!shine} />
                </Pressable>
              ) : null}
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 8, alignItems: 'stretch', direction: 'rtl' }}>
              <Text numberOfLines={2} style={{ color: '#F7F4EA', fontSize: 20, fontWeight: '900', textAlign: 'right' }}>{player.name}</Text>
              {quote ? <MarketQuote compact console={quote.console} pc={quote.pc} /> : null}
              <Identity player={card} compact />
            </View>
          </View>
          <View
            style={{
              flexDirection: tight ? 'column' : 'row',
              direction: 'ltr',
              justifyContent: 'space-between',
              alignItems: tight ? 'flex-end' : 'center',
              gap: 10,
            }}
          >
            {boots}
            {skills}
          </View>
        </View>
      )}

      {/* POTENTIAL TOGGLE IN ULTIMATE DOSSIER */}
      {meta && (card.rating < 88) ? (
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: showPotential ? '#38bdf8' : 'rgba(255,255,255,0.08)' }}>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Text style={{ color: showPotential ? '#38bdf8' : '#F7F4EA', fontSize: 14, fontWeight: '800' }}>
              {showPotential ? '🚀 תחזית נתונים במלוא הפוטנציאל' : '📊 נתונים נוכחיים'}
            </Text>
            <Text style={{ color: '#9AA8A0', fontSize: 11 }}>
              {showPotential ? `דירוג שיא משוער: 89 (+${growth})` : 'הצג כיצד כל הנתונים יראו בשיא ההתפתחות'}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowPotential(p => !p)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: showPotential ? '#0284c7' : 'rgba(56, 189, 248, 0.15)',
              borderWidth: 1,
              borderColor: '#38bdf8',
            }}
          >
            <Text style={{ color: showPotential ? '#ffffff' : '#38bdf8', fontSize: 12, fontWeight: '800' }}>
              {showPotential ? '✔ מלוא הפוטנציאל פעיל' : '⚡ ראה מלוא הפוטנציאל'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={{ flexDirection: wide && showChem ? 'row' : 'column', direction: 'ltr', gap: 18, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 10, minWidth: 0 }}>
          {chunk(groups, columns).map((row, index) => (
            <View key={index} style={{ width: '100%', flexDirection: 'row', direction: 'ltr', gap: compact ? 8 : 12 }}>
              {row.map((group) => (
                <Group
                  key={group.label}
                  group={group}
                  compact={compact}
                  boosts={chem?.boosts}
                  totalBoost={faceDelta[faceKey[group.label]]}
                  isPotential={showPotential}
                />
              ))}
              {row.length < columns
                ? Array.from({ length: columns - row.length }, (_, pad) => <View key={pad} style={{ flex: 1 }} />)
                : null}
            </View>
          ))}
        </View>
        {showChem ? (
          <View style={{ width: wide ? 300 : '100%', gap: 14 }}>
            <Text style={{ color: '#F4F7F2', fontWeight: '800', fontSize: 16 }}>Chemistry</Text>
            {CHEM_GROUPS.map((section) => (
              <View key={section.title} style={{ gap: 8 }}>
                <Text style={{ color: '#9AA8A0', fontSize: 12, fontWeight: '700' }}>{section.title}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {section.ids.map((id) => {
                    const style = CHEM_STYLES.find((item) => item.id === id);
                    if (!style) return null;
                    const on = chemId === style.id;
                    return (
                      <Pressable
                        key={style.id}
                        onPress={() => setChemId(on ? null : style.id)}
                        style={{
                          width: '48%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          paddingVertical: 8,
                          paddingHorizontal: 8,
                          borderRadius: 8,
                          backgroundColor: on ? 'rgba(227,179,65,0.16)' : 'rgba(255,255,255,0.04)',
                          borderWidth: 1,
                          borderColor: on ? '#E3B341' : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <ChemGlyph id={style.id} color={on ? '#E3B341' : '#F4F7F2'} />
                        <Text style={{ color: '#F4F7F2', fontSize: 12, fontWeight: '700' }}>{style.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      </View>

      <View
        style={{
          gap: 18,
          borderRadius: 28,
          borderWidth: 1,
          borderColor: iconPage ? 'rgba(196,154,74,0.42)' : 'rgba(120,176,196,0.45)',
          backgroundColor: iconPage ? 'rgba(24,18,12,0.96)' : 'rgba(8,20,28,0.94)',
          padding: wide ? 22 : 16,
        }}
      >
        <View style={{ flexDirection: wide ? 'row' : 'column', direction: 'ltr', gap: 10, alignItems: wide ? 'center' : 'stretch' }}>
          <Text style={{ color: '#F7F4EA', fontSize: 18, fontWeight: '900', textAlign: 'right', flex: wide ? 1 : undefined }}>תגובות</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', width: wide ? 360 : '100%' }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="מה דעתך על הקלף"
              placeholderTextColor="#8E9A90"
              style={{
                flex: 1,
                color: '#F4F7F2',
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(227,179,65,0.25)',
                paddingHorizontal: 12,
                paddingVertical: 10,
                textAlign: 'right',
              }}
            />
            <Pressable
              onPress={() => void send()}
              style={{
                borderWidth: 1,
                borderColor: iconPage ? 'rgba(232,200,106,0.75)' : 'rgba(227,179,65,0.75)',
                backgroundColor: 'transparent',
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: accent, fontWeight: '800' }}>שליחה</Text>
            </Pressable>
          </View>
        </View>
        {(talk?.comments ?? []).map((comment) => (
          <View
            key={comment.id}
            style={{
              gap: 4,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <Text style={{ color: '#F4F7F2', fontWeight: '800', textAlign: 'right' }}>{comment.name}</Text>
            <Text style={{ color: '#9AA89C', fontSize: 12, textAlign: 'right' }}>{ago(comment.createdAt)}</Text>
            <Text style={{ color: '#E7EEE8', textAlign: 'right', fontSize: 15 }}>{comment.body}</Text>
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
              <Pressable onPress={() => void voteRow(comment.id, -1)}>
                <Text style={{ color: comment.mine === -1 ? '#E3B341' : '#C5D0C8' }}>👎 {comment.down}</Text>
              </Pressable>
              <Pressable onPress={() => void voteRow(comment.id, 1)}>
                <Text style={{ color: comment.mine === 1 ? '#E3B341' : '#C5D0C8' }}>👍 {comment.up}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) rows.push(items.slice(index, index + size));
  return rows;
}
