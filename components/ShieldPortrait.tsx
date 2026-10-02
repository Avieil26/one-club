import { Text, View } from 'react-native';
import Svg, { ClipPath, Defs, G, Image as SvgImage, LinearGradient, Line, Path, Stop } from 'react-native-svg';

import { ClubBadge } from '@/components/ClubBadge';
import { NationFlag } from '@/components/NationFlag';
import type { FcPlayer } from '@/lib/fcPlayers';
import { playerMedia, type FaceStats } from '@/lib/playerMedia';
import { totwFor } from '@/lib/specialCards';

/**
 * Preview silhouette: low center peak, wide straight sides, short bottom point.
 * The stat row sits in the wide body. The point starts only under the numbers.
 * ViewBox 240×348.
 */
const OUTER = 'M120 6 C162 8 196 20 214 40 C228 56 230 76 228 100 L226 262 C224 300 184 322 120 342 C56 322 16 300 14 262 L12 100 C10 76 12 56 26 40 C44 20 78 8 120 6 Z';
const INNER = 'M120 22 C156 24 186 34 202 52 C214 66 216 84 214 106 L212 256 C210 288 176 308 120 326 C64 308 30 288 28 256 L26 106 C24 84 26 66 38 52 C54 34 84 24 120 22 Z';

const ROWS: { key: keyof FaceStats; label: string }[] = [
  { key: 'pac', label: 'PAC' },
  { key: 'sho', label: 'SHO' },
  { key: 'pas', label: 'PAS' },
  { key: 'dri', label: 'DRI' },
  { key: 'def', label: 'DEF' },
  { key: 'phy', label: 'PHY' },
];

const GK_ROWS: { key: keyof FaceStats; label: string }[] = [
  { key: 'pac', label: 'DIV' },
  { key: 'sho', label: 'HAN' },
  { key: 'pas', label: 'KIC' },
  { key: 'dri', label: 'REF' },
  { key: 'def', label: 'SPD' },
  { key: 'phy', label: 'POS' },
];

function surname(en: string) {
  const parts = en.trim().split(' ');
  return (parts[parts.length - 1] || en).toUpperCase();
}

/** One shield for Hero and TOTW. Only the metal color changes. */
export function ShieldPortrait({
  player,
  width,
  edition,
  shell = false,
  pitch = false,
}: {
  player: FcPlayer;
  width: number;
  edition: 'hero' | 'totw';
  shell?: boolean;
  pitch?: boolean;
}) {
  const hero = edition === 'hero';
  const media = playerMedia(player.baseId ?? player.id);
  const totw = edition === 'totw' ? totwFor(player.baseId ?? player.id) : null;
  const stats = edition === 'totw' ? (totw?.face ?? player.face) : player.face;
  const rating = edition === 'totw' ? (totw?.face.ovr ?? totw?.rating ?? player.rating) : (player.face?.ovr ?? player.rating);
  const position = edition === 'totw' ? (totw?.position ?? player.position) : player.position;
  const ink = hero ? '#F4E6C8' : '#E8C56A';
  const quiet = hero ? 'rgba(244,230,200,0.78)' : 'rgba(232,197,106,0.78)';
  const height = Math.round(width * (pitch ? 1.42 : 348 / 240));
  const gid = `sh${player.id.replace(/[^a-zA-Z0-9]/g, '')}${edition}`;
  const photo = !shell && media.photo ? media.photo : '';
  const showClub = !shell && player.club !== 'Heroes' && player.club !== 'TOTW';
  const rows = position === 'GK' ? GK_ROWS : ROWS;
  const deep = hero ? '#14081C' : '#070604';

  return (
    <View style={{ width, height, alignSelf: 'center', direction: 'ltr' }}>
      <Svg width={width} height={height} viewBox="0 0 240 348">
        <Defs>
          <LinearGradient id={`${gid}-frame`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={hero ? '#F8F0FF' : '#FFF8DC'} />
            <Stop offset="0.28" stopColor={hero ? '#D4B4FF' : '#F0D56A'} />
            <Stop offset="0.55" stopColor={hero ? '#7A45C8' : '#C9A227'} />
            <Stop offset="0.78" stopColor={hero ? '#4A2288' : '#8A6412'} />
            <Stop offset="1" stopColor={hero ? '#E7D6FF' : '#FFE9A8'} />
          </LinearGradient>
          <LinearGradient id={`${gid}-face`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={hero ? '#3C1874' : '#14110C'} />
            <Stop offset="1" stopColor={deep} />
          </LinearGradient>
          <LinearGradient id={`${gid}-fade`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={deep} stopOpacity="0" />
            <Stop offset="0.55" stopColor={deep} stopOpacity="0.2" />
            <Stop offset="1" stopColor={deep} stopOpacity="1" />
          </LinearGradient>
          <ClipPath id={`${gid}-clip`}>
            <Path d={INNER} />
          </ClipPath>
        </Defs>

        <Path d={OUTER} fill={`url(#${gid}-frame)`} />
        <Path d={OUTER} fill="none" stroke={hero ? 'rgba(255,255,255,0.7)' : 'rgba(255,248,214,0.85)'} strokeWidth="1.6" />

        <G clipPath={`url(#${gid}-clip)`}>
          <Path d={INNER} fill={`url(#${gid}-face)`} />
          {hero ? (
            <>
              <Path d="M36 48 L58 100 L42 108 L78 170" stroke="#E7D4FF" strokeWidth="2.4" fill="none" opacity="0.8" />
              <Path d="M190 36 L164 92 L184 100 L140 168 L156 176 L112 230" stroke="#F0E4FF" strokeWidth="2.2" fill="none" opacity="0.7" />
              <Path d="M204 70 L176 130 L192 138 L148 200" stroke="#C9A6FF" strokeWidth="1.8" fill="none" opacity="0.55" />
            </>
          ) : (
            <>
              <Line x1="150" y1="28" x2="214" y2="86" stroke="#E8C56A" strokeWidth="1.1" opacity="0.55" />
              <Line x1="168" y1="26" x2="214" y2="64" stroke="#F6E7B0" strokeWidth="0.9" opacity="0.45" />
              <Line x1="132" y1="34" x2="214" y2="110" stroke="#E8C56A" strokeWidth="0.8" opacity="0.35" />
              <Line x1="186" y1="40" x2="214" y2="48" stroke="#F6E7B0" strokeWidth="0.8" opacity="0.4" />
            </>
          )}
          {photo ? (
            <SvgImage href={{ uri: photo }} x="36" y="28" width="168" height="188" preserveAspectRatio="xMidYMin slice" />
          ) : null}
          <Path d="M26 150 H214 V270 H26 Z" fill={`url(#${gid}-fade)`} />
        </G>

        <Path d={INNER} fill="none" stroke={hero ? 'rgba(244,230,255,0.9)' : 'rgba(255,236,170,0.95)'} strokeWidth="1.8" />
      </Svg>

      <Text
        style={{
          position: 'absolute',
          top: height * 0.075,
          right: width * 0.14,
          color: hero ? 'rgba(244,230,200,0.82)' : ink,
          fontSize: Math.max(8, width * 0.04),
          fontWeight: '800',
          letterSpacing: 1.3,
        }}
      >
        {shell ? '' : hero ? 'HERO' : 'TOTW'}
      </Text>

      <View style={{ position: 'absolute', top: height * 0.07, left: width * 0.1, width: width * 0.28, alignItems: 'center' }}>
        <Text
          style={{
            color: ink,
            fontSize: width * 0.19,
            fontWeight: '900',
            lineHeight: width * 0.19,
            textShadowColor: 'rgba(0,0,0,0.75)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 4,
          }}
        >
          {shell ? '' : rating}
        </Text>
        <Text style={{ color: ink, fontSize: width * 0.058, fontWeight: '800', letterSpacing: 0.8, marginTop: 1 }}>{shell ? '' : position}</Text>
        {shell ? null : (
          <View style={{ marginTop: 5 }}>
            <NationFlag nation={player.nation} size={Math.max(12, width * 0.072)} />
          </View>
        )}
        {showClub ? (
          <View style={{ marginTop: 4 }}>
            <ClubBadge club={player.club} size={Math.max(16, width * 0.115)} />
          </View>
        ) : null}
      </View>

      <Text
        numberOfLines={1}
        style={{
          position: 'absolute',
          left: width * 0.12,
          right: width * 0.12,
          top: height * (pitch ? 0.68 : 0.575),
          color: ink,
          fontSize: width * 0.068,
          fontWeight: '900',
          textAlign: 'center',
          letterSpacing: 1.2,
          textShadowColor: 'rgba(0,0,0,0.85)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 4,
        }}
      >
        {shell ? '' : surname(player.en || media.en)}
      </Text>

      {!pitch && !shell && stats ? (
        <View style={{ position: 'absolute', left: width * 0.11, right: width * 0.11, top: height * 0.68, flexDirection: 'row' }}>
          {rows.map((row) => (
            <View key={row.label} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: quiet, fontSize: Math.max(7, width * 0.034), fontWeight: '800' }}>{row.label}</Text>
              <Text style={{ color: ink, fontSize: Math.max(12, width * 0.068), fontWeight: '900', marginTop: 1 }}>{stats[row.key]}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
