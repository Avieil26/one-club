import { useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ClubBadge } from '@/components/ClubBadge';
import { CardMetalSheen, heroChrome, iconChrome, tierChrome, totwChrome, type TierTone } from '@/components/cardChrome';
import { NationFlag } from '@/components/NationFlag';
import { ShieldPortrait } from '@/components/ShieldPortrait';
import type { FcPlayer } from '@/lib/fcPlayers';
import { playerMedia, type FaceStats } from '@/lib/playerMedia';
import { HERO_ART } from '@/lib/heroArt';
import { otwFor, totwFor } from '@/lib/specialCards';
import { totwFinish } from '@/lib/totwShine';

export const PORTRAIT_RATIO = 1.6;

/** Approved Destined for Glory art. The picture is the card, so the site matches the preview. */
const DESTINED_ART: Record<string, number> = {
  mbappe: require('@/assets/images/cards/mbappe-destined.png'),
  nuno: require('@/assets/images/cards/nuno-destined.png'),
  isak: require('@/assets/images/cards/isak-destined.png'),
  'ea-259287-pernille-harder': require('@/assets/images/cards/harder-destined.png'),
  rogers: require('@/assets/images/cards/rogers-destined.png'),
  'ea-244176-deniz-undav': require('@/assets/images/cards/undav-destined.png'),
  'ea-227678-ezri-konsa': require('@/assets/images/cards/konsa-destined.png'),
  'ea-261855-kika-nazareth': require('@/assets/images/cards/kika-destined.png'),
  aubameyang: require('@/assets/images/cards/aubameyang-destined.png'),
  kokcu: require('@/assets/images/cards/kokcu-destined.png'),
  'ea-253109-joey-veerman': require('@/assets/images/cards/veerman-destined.png'),
  'ea-279604-jauregizar': require('@/assets/images/cards/jauregizar-destined.png'),
  'ea-248165-andrei-ratiu': require('@/assets/images/cards/ratiu-destined.png'),
  'ea-246688-saud-abdulhamid': require('@/assets/images/cards/abdulhamid-destined.png'),
  'ea-241736-yann-aurel-bisseck': require('@/assets/images/cards/bisseck-destined.png'),
};
const DESTINED_REMOTE_ART: Record<string, string> = {
  upamecano: 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-50561206.webp',
  diani: 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-50559009.webp',
  'caicedo-w': 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-50604801.webp',
  mbeumo: 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-67351878.webp',
  lookman: 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-50562547.webp',
  haaland: 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-67347949.webp',
  kiwior: 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-50597341.webp',
  'ea-275029-ibrahim-maza': 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-50606677.webp',
  gordon: 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-67351828.webp',
  'ea-277846-nico-paz': 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-67386710.webp',
  'ea-223697-robin-gosens': 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-50555345.webp',
  cucurella: 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-50570879.webp',
  mckennie: 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-67347608.webp',
  'ea-254121-charlie-cresswell': 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-50585769.webp',
};

const OTW_REMOTE_ART: Record<string, string> = {
  'ea-264947-nicole-anyomi': 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,format=auto/2026/player-item-social-small/27-50596595.webp',
};

const DESTINED_RATIO = 1152 / 864;
const TOTW_RATIO = 1152 / 864;

const TOTW_ART: Record<string, number> = {
  raphinha: require('@/assets/images/cards/raphinha-totw-built.png'),
  olise: require('@/assets/images/cards/olise-totw.png'),
  wilson: require('@/assets/images/cards/wilson-totw.png'),
  marquinhos: require('@/assets/images/cards/marquinhos-totw.png'),
  salah: require('@/assets/images/cards/salah-totw.png'),
  semenyo: require('@/assets/images/cards/semenyo-totw.png'),
  'ea-219683-corentin-tolisso': require('@/assets/images/cards/ea-219683-corentin-tolisso-totw.png'),
  'ea-264388-moleiro': require('@/assets/images/cards/ea-264388-moleiro-totw.png'),
  'ea-223710-vedat-muriqi': require('@/assets/images/cards/ea-223710-vedat-muriqi-totw.png'),
  'ea-243630-jonathan-david': require('@/assets/images/cards/ea-243630-jonathan-david-totw.png'),
  'ea-261865-miguel-gutierrez': require('@/assets/images/cards/ea-261865-miguel-gutierrez-totw.png'),
  'ea-190765-pascal-gro': require('@/assets/images/cards/ea-190765-pascal-gro-totw.png'),
  'ea-273177-olivia-holdt': require('@/assets/images/cards/ea-273177-olivia-holdt-totw.png'),
  'ea-70726-anis-hadj-moussa': require('@/assets/images/cards/ea-70726-anis-hadj-moussa-totw.png'),
  'ea-80230-bella-andersson': require('@/assets/images/cards/ea-80230-bella-andersson-totw.png'),
  'ea-188350-marco-reus': require('@/assets/images/cards/ea-188350-marco-reus-totw.png'),
  'ea-235134-pablo-rosario': require('@/assets/images/cards/ea-235134-pablo-rosario-totw.png'),
  'ea-237440-hannes-delcroix': require('@/assets/images/cards/ea-237440-hannes-delcroix-totw.png'),
  'ea-238071-dujon-sterling': require('@/assets/images/cards/ea-238071-dujon-sterling-totw.png'),
  'ea-261861-jack-moylan': require('@/assets/images/cards/ea-261861-jack-moylan-totw.png'),
  'ea-273567-chiara-hahn': require('@/assets/images/cards/ea-273567-chiara-hahn-totw.png'),
  'ea-276725-lorenzo-palmisani': require('@/assets/images/cards/ea-276725-lorenzo-palmisani-totw.png'),
  'totw-salomon-rodriguez': require('@/assets/images/cards/totw-salomon-rodriguez-totw.png'),
  'ea-279799-temwa-chawinga': require('@/assets/images/cards/ea-279799-temwa-chawinga-totw.png'),
  odegaard: require('@/assets/images/cards/odegaard-totw.png'),
  gyokeres: require('@/assets/images/cards/gyokeres-totw.png'),
  'ea-177003-luka-modric': require('@/assets/images/cards/ea-177003-luka-modric-totw.png'),
  'ea-240030-ellie-carpenter': require('@/assets/images/cards/ea-240030-ellie-carpenter-totw.png'),
  'ea-242444-joao-felix': require('@/assets/images/cards/ea-242444-joao-felix-totw.png'),
  'ea-257279-alex-baena': require('@/assets/images/cards/ea-257279-alex-baena-totw.png'),
  'ea-200104-son-heung-min': require('@/assets/images/cards/ea-200104-son-heung-min-totw.png'),
  'ea-277869-michael-kayode': require('@/assets/images/cards/ea-277869-michael-kayode-totw.png'),
  'ea-85272-felicia-schroder': require('@/assets/images/cards/ea-85272-felicia-schroder-totw.png'),
  'ea-271040-jaedyn-shaw': require('@/assets/images/cards/ea-271040-jaedyn-shaw-totw.png'),
  'ea-252552-konstantinos-tzolakis': require('@/assets/images/cards/ea-252552-konstantinos-tzolakis-totw.png'),
  'ea-210897-chancel-mbemba': require('@/assets/images/cards/ea-210897-chancel-mbemba-totw.png'),
  'ea-216275-phillipp-mwene': require('@/assets/images/cards/ea-216275-phillipp-mwene-totw.png'),
  'ea-224151-henry-martin': require('@/assets/images/cards/ea-224151-henry-martin-totw.png'),
  'ea-239631-danny-namaso': require('@/assets/images/cards/ea-239631-danny-namaso-totw.png'),
  'ea-252162-ayase-ueda': require('@/assets/images/cards/ea-252162-ayase-ueda-totw.png'),
  'ea-255205-sebastian-berhalter': require('@/assets/images/cards/ea-255205-sebastian-berhalter-totw.png'),
  'ea-255275-milan-iloski': require('@/assets/images/cards/ea-255275-milan-iloski-totw.png'),
  'ea-262642-zeki-amdouni': require('@/assets/images/cards/ea-262642-zeki-amdouni-totw.png'),
  'ea-267974-mexx-meerdink': require('@/assets/images/cards/ea-267974-mexx-meerdink-totw.png'),
  'ea-272137-sara-ortega': require('@/assets/images/cards/ea-272137-sara-ortega-totw.png'),
  'ea-276695-shea-charles': require('@/assets/images/cards/ea-276695-shea-charles-totw.png'),
};

const TOTW_RIM = `<filter id="totw-rim" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
  <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="core"></feMorphology>
  <feMorphology in="SourceAlpha" operator="dilate" radius="7" result="big"></feMorphology>
  <feComposite in="big" in2="core" operator="out" result="outer"></feComposite>
  <feComposite in="core" in2="SourceAlpha" operator="out" result="inner"></feComposite>
  <feGaussianBlur in="outer" stdDeviation="1.4" result="outerBlur"></feGaussianBlur>
  <feGaussianBlur in="inner" stdDeviation="0.6" result="innerBlur"></feGaussianBlur>
  <feFlood flood-color="#a855f7" flood-opacity="0.9" result="outerColor"></feFlood>
  <feFlood flood-color="#f3e8ff" flood-opacity="1" result="innerColor"></feFlood>
  <feComposite in="outerColor" in2="outerBlur" operator="in" result="outerLit"></feComposite>
  <feComposite in="innerColor" in2="innerBlur" operator="in" result="innerLit"></feComposite>
  <feMerge>
    <feMergeNode in="outerLit"></feMergeNode>
    <feMergeNode in="innerLit"></feMergeNode>
    <feMergeNode in="SourceGraphic"></feMergeNode>
  </feMerge>
</filter>`;

function ensureTotwRim() {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || document.getElementById('totw-rim')) return;
  const host = document.createElement('div');
  host.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" style="position:absolute">${TOTW_RIM}</svg>`;
  const node = host.firstElementChild;
  if (node) document.body.prepend(node);
}

function webRimStyle() {
  ensureTotwRim();
  const base = window.location.href.split('#')[0];
  return { filter: `url("${base}#totw-rim")` } as object;
}

function TotwPortraitCard({ art, width, glow = false, sign = '' }: { art: number; width: number; glow?: boolean; sign?: string }) {
  const height = Math.round(width * TOTW_RATIO);
  const card = (
    <Image
      source={art}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      style={{ width, height, alignSelf: 'center' }}
    />
  );
  const autograph = glow && sign && /^[A-Z][A-Z .'-]*$/.test(sign) ? `${sign.charAt(0)}${sign.slice(1).toLowerCase()}` : '';
  if (!glow && !autograph) return card;
  const script = autograph.length > 10 ? 0.1 : autograph.length > 7 ? 0.12 : 0.15;
  const lit = glow
    ? Platform.OS === 'web'
      ? webRimStyle()
      : { shadowColor: '#C084FC', shadowOpacity: 0.85, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }
    : null;
  return (
    <View style={{ width, height, overflow: 'visible', alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={art}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        style={[{ width, height, alignSelf: 'center' }, lit]}
      />
      {autograph ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: width * 0.2,
            right: width * 0.2,
            top: height * 0.632,
            height: height * 0.075,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#070604',
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: '#F4D78A',
              fontFamily: 'GreatVibes',
              fontSize: width * script,
              lineHeight: width * script * 1.15,
              textAlign: 'center',
            }}
          >
            {autograph}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function RemoteCardArt({ uri, width }: { uri: string; width: number }) {
  return (
    <Image
      source={{ uri }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      style={{ width, height: Math.round(width * DESTINED_RATIO) }}
    />
  );
}

function DestinedPortraitCard({ art, width }: { art: number; width: number }) {
  return (
    <Image
      source={art}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      style={{ width, height: Math.round(width * DESTINED_RATIO) }}
    />
  );
}

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

function faceRows(position: string) {
  return position === 'GK' ? GK_ROWS : ROWS;
}

function photoImageStyle(focus?: 'face' | 'center' | 'bust') {
  if (focus === 'bust') {
    if (Platform.OS === 'web') {
      return {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center 2%',
      } as object;
    }
    return {
      width: '100%',
      height: '100%',
      transform: [{ translateY: 48 }],
    };
  }
  if (focus === 'face') {
    if (Platform.OS === 'web') {
      return {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center 8%',
        transform: [{ scale: 1.72 }],
      } as object;
    }
    return {
      width: '100%',
      height: '100%',
      transform: [{ scale: 1.72 }, { translateY: 42 }],
    };
  }
  return [
    { width: '100%', height: '100%' },
    Platform.OS === 'web' ? ({ objectFit: 'cover', objectPosition: 'center 12%' } as object) : null,
  ];
}

function surname(en: string) {
  const parts = en.trim().split(' ');
  return (parts[parts.length - 1] || en).toUpperCase();
}

/** Same TOTW card. A short purple rim follows the shield, the way FUTBIN shows the second look. */
function totwAura() {
  if (Platform.OS === 'web') return webRimStyle();
  return {
    shadowColor: '#C084FC',
    shadowOpacity: 0.85,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  };
}

export function PortraitCard({
  player,
  width = 168,
  variant = 'full',
  edition = 'auto',
  shell = false,
  glow = false,
  photoOverride,
  faceOverride,
  heightOverride,
  compactStats,
}: {
  player: FcPlayer;
  width?: number;
  variant?: 'full' | 'pitch';
  edition?: 'auto' | 'base' | 'destined' | 'hero' | 'totw' | 'otw';
  /** Same card chrome, with no player on it. */
  shell?: boolean;
  /** Purple aura around a TOTW card. Same card, only the glow changes. */
  glow?: boolean;
  photoOverride?: string;
  faceOverride?: FaceStats;
  heightOverride?: number;
  /** Two-row stat layout for tiny SBC reward cards, preventing stat text collisions. */
  compactStats?: boolean;
}) {
  const artId = player.baseId ?? player.id;
  const showDestined = !shell && (edition === 'auto' ? player.edition === 'destined' : edition === 'destined');
  const destined = showDestined ? DESTINED_ART[artId] : undefined;
  if (destined) return <DestinedPortraitCard art={destined} width={width} />;
  const destinedRemote = showDestined ? DESTINED_REMOTE_ART[artId] : undefined;
  if (destinedRemote) return <RemoteCardArt uri={destinedRemote} width={width} />;
  const shownEdition = edition === 'auto' ? player.edition : edition;
  const otw = shownEdition === 'otw' ? otwFor(artId) : null;
  if (shownEdition === 'otw') {
    const otwArt = OTW_REMOTE_ART[artId];
    if (otwArt) return <RemoteCardArt uri={otwArt} width={width} />;
  }
  const aura = glow && shownEdition === 'totw' ? totwAura() : undefined;
  if (shownEdition === 'totw') {
    const totwArt = TOTW_ART[artId];
    if (totwArt) {
      const autograph = glow && totwFinish(artId) === 'pristine' ? surname(player.en || player.name || '') : '';
      return <TotwPortraitCard art={totwArt} width={width} glow={Boolean(aura)} sign={autograph} />;
    }
  }
  if (shownEdition === 'hero') {
    const heroArt = HERO_ART[player.id];
    if (heroArt) return <TotwPortraitCard art={heroArt} width={width} />;
  }
  if (shownEdition === 'hero' || shownEdition === 'totw') {
    return (
      <View style={aura as object}>
        <ShieldPortrait player={player} width={width} edition={shownEdition} shell={shell} pitch={variant === 'pitch'} />
      </View>
    );
  }
  if (player.icon) {
    return <IconPortraitCard player={player} width={width} variant={variant} shell={shell} />;
  }
  return (
    <StandardPortraitCard
      player={player}
      width={width}
      variant={variant}
      shell={shell}
      edition={edition}
      photoOverride={photoOverride}
      faceOverride={faceOverride}
      heightOverride={heightOverride}
      compactStats={compactStats}
    />
  );
}

/** Empty gold, silver, icon, or OTW card, using the same shape as the player cards. */
export function TypeShell({ kind, width }: { kind: 'gold' | 'silver' | 'icon' | 'otw' | 'hero' | 'totw'; width: number }) {
  if (kind === 'otw') return <OtwShell width={width} />;
  if (kind === 'totw') return <TotwPortraitCard art={require('@/assets/images/cards/totw-shell.png')} width={width} />;
  if (kind === 'hero') {
    const player: FcPlayer = {
      id: `shell-${kind}`,
      name: ' ',
      en: ' ',
      rating: 88,
      position: 'CM',
      nation: '',
      league: '',
      club: '',
      edition: kind,
    };
    return <PortraitCard player={player} width={width} shell />;
  }
  const player: FcPlayer = {
    id: `shell-${kind}`,
    name: ' ',
    rating: kind === 'silver' ? 70 : 82,
    position: 'CM',
    nation: '',
    league: '',
    club: '',
    ...(kind === 'icon' ? { icon: true } : {}),
  };
  return <PortraitCard player={player} width={width} shell />;
}

function OtwShell({ width }: { width: number }) {
  return <DestinedPortraitCard art={require('@/assets/images/cards/otw-empty.png')} width={width} />;
}

/** Rounded metal gold/silver/bronze — original pre-Sharp Cut layout */
function StandardPortraitCard({
  player,
  width,
  variant,
  shell = false,
  edition = 'auto',
  photoOverride,
  faceOverride,
  heightOverride,
  compactStats = false,
}: {
  player: FcPlayer;
  width: number;
  variant: 'full' | 'pitch';
  shell?: boolean;
  edition?: 'auto' | 'base' | 'destined' | 'hero' | 'totw';
  photoOverride?: string;
  faceOverride?: FaceStats;
  heightOverride?: number;
  compactStats?: boolean;
}) {
  const media = playerMedia(player.baseId ?? player.id);
  const shown = edition === 'auto' ? player.edition : edition;
  const totw = shown === 'totw' ? totwFor(player.baseId ?? player.id) : null;
  const special = shown === 'hero' || shown === 'totw';
  const stats = faceOverride ?? (shown === 'totw' ? (totw?.face ?? player.face) : shown === 'hero' ? player.face : media.face);
  const rating = shown === 'totw'
    ? (totw?.face.ovr ?? totw?.rating ?? player.rating)
    : shown === 'hero'
      ? (player.face?.ovr ?? player.rating)
      : shown === 'base'
        ? (media.face?.ovr ?? player.pairRating ?? player.rating)
        : (stats?.ovr ?? player.rating);
  const position = shown === 'totw'
    ? (totw?.position ?? player.position)
    : shown === 'base'
      ? (player.regularPosition ?? player.position)
      : player.position;
  const tone: TierTone = shown === 'hero' ? heroChrome() : shown === 'totw' ? totwChrome() : tierChrome(rating);
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(photoOverride ?? media.photo) && !failed;
  const pitch = variant === 'pitch';
  const height = heightOverride ?? Math.round(width * (pitch ? 1.42 : PORTRAIT_RATIO));
  const pad = Math.max(3, Math.round(width * (pitch ? 0.028 : 0.032)));
  const photoH = Math.round(height * (pitch ? 0.58 : 0.52));
  const radius = width * 0.1;
  const innerRadius = width * 0.075;

  return (
    <View
      style={{
        width,
        height,
        alignSelf: 'center',
        direction: 'ltr',
        borderRadius: radius,
        shadowColor: tone.glow,
        shadowOpacity: pitch ? 0.5 : 0.75,
        shadowRadius: pitch ? 8 : 14,
        shadowOffset: { width: 0, height: pitch ? 3 : 6 },
        elevation: pitch ? 6 : 10,
      }}
    >
      <LinearGradient
        colors={tone.frameColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: radius, padding: pad }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.4)', 'transparent', 'rgba(0,0,0,0.22)']}
          locations={[0, 0.35, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            position: 'absolute',
            top: 1,
            left: 1,
            right: 1,
            bottom: 1,
            borderRadius: radius - 1,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.28)',
          }}
        />
        <LinearGradient
          colors={tone.faceColors}
          locations={[0, 0.45, 1]}
          style={{ flex: 1, borderRadius: innerRadius, overflow: 'hidden' }}
        >
          <CardMetalSheen />

          <View style={{ height: photoH, flexDirection: 'row', zIndex: 2 }}>
            <View
              style={{
                width: width * 0.3,
                paddingTop: width * 0.02,
                paddingLeft: width * 0.02,
                alignItems: 'center',
                gap: Math.max(2, width * 0.008),
                zIndex: 3,
              }}
            >
              <Text
                style={{
                  color: tone.ink,
                  fontSize: width * (pitch ? 0.2 : 0.185),
                  fontWeight: '900',
                  lineHeight: width * (pitch ? 0.2 : 0.185),
                  letterSpacing: -0.6,
                }}
              >
                {shell ? '' : rating}
              </Text>
              <Text
                style={{
                  color: tone.ink,
                  fontSize: width * (pitch ? 0.07 : 0.062),
                  fontWeight: '800',
                  marginTop: -2,
                  letterSpacing: 0.5,
                }}
              >
                {shell ? '' : position}
              </Text>
              <View style={{ width: '50%', height: 1, backgroundColor: 'rgba(0,0,0,0.28)', marginVertical: 1 }} />
              {shell ? null : <NationFlag nation={player.nation} size={Math.max(11, width * 0.085)} />}
              {shell ? null : <ClubBadge club={player.club} size={Math.max(13, width * 0.11)} />}
              {shell || !special ? null : (
                <Text style={{ color: tone.ink, fontSize: Math.max(8, width * 0.045), fontWeight: '800', letterSpacing: 0.4 }}>
                  {tone.label}
                </Text>
              )}
            </View>

            <View style={{ flex: 1, overflow: 'hidden' }}>
              {shell || !showPhoto ? null : (
                <Image
                  source={{ uri: photoOverride ?? media.photo }}
                  onError={() => setFailed(true)}
                  resizeMode="cover"
                  style={photoImageStyle(media.photoFocus)}
                />
              )}
            </View>

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.2)', tone.deep]}
              locations={[0, 0.5, 1]}
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: photoH * 0.4, pointerEvents: 'none' }}
            />
          </View>

          <Text
            numberOfLines={1}
            style={{
              color: '#FFF8E8',
              fontSize: width * (pitch ? 0.08 : 0.074),
              fontWeight: '900',
              textAlign: 'center',
              letterSpacing: pitch ? 0.6 : 1.2,
              marginTop: 2,
              paddingHorizontal: 4,
              textShadowColor: 'rgba(0,0,0,0.5)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
              zIndex: 2,
            }}
          >
            {shell ? '' : surname(player.en || media.en)}
          </Text>

          {!pitch && !shell && !(special && !stats) ? (
            <>
              <View
                style={{
                  height: 1,
                  marginHorizontal: width * 0.12,
                  marginTop: 5,
                  marginBottom: 4,
                  backgroundColor: 'rgba(255,248,232,0.4)',
                  zIndex: 2,
                }}
              />
              {compactStats ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 2, zIndex: 2 }}>
                  {faceRows(position).map((row) => (
                    <View key={row.label} style={{ width: '33.333%', alignItems: 'center', marginBottom: 1 }}>
                      <Text
                        style={{
                          color: 'rgba(255,248,232,0.72)',
                          fontSize: Math.max(4.5, width * 0.058),
                          fontWeight: '800',
                          letterSpacing: 0.1,
                        }}
                      >
                        {row.label}
                      </Text>
                      <Text
                        style={{
                          color: '#FFF8E8',
                          fontSize: Math.max(8, width * 0.105),
                          fontWeight: '900',
                          marginTop: 0,
                        }}
                      >
                        {shell ? '' : (stats?.[row.key] ?? '·')}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ flexDirection: 'row', paddingHorizontal: 2, zIndex: 2 }}>
                  {faceRows(position).map((row) => (
                    <View key={row.label} style={{ flex: 1, alignItems: 'center' }}>
                      <Text
                        style={{
                          color: 'rgba(255,248,232,0.72)',
                          fontSize: Math.max(6.5, width * 0.036),
                          fontWeight: '800',
                          letterSpacing: 0.3,
                        }}
                      >
                        {row.label}
                      </Text>
                      <Text
                        style={{
                          color: '#FFF8E8',
                          fontSize: Math.max(10, width * 0.068),
                          fontWeight: '900',
                          marginTop: 1,
                        }}
                      >
                        {shell ? '' : (stats?.[row.key] ?? '·')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : null}

          <View style={{ flex: 1 }} />
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}

function IconPortraitCard({
  player,
  width,
  variant,
  shell = false,
}: {
  player: FcPlayer;
  width: number;
  variant: 'full' | 'pitch';
  shell?: boolean;
}) {
  const media = playerMedia(player.id);
  const rating = media.face?.ovr ?? player.rating;
  const tone = iconChrome();
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(media.photo) && !failed;
  const pitch = variant === 'pitch';
  const height = Math.round(width * (pitch ? 1.42 : PORTRAIT_RATIO));
  const pad = Math.max(3, Math.round(width * (pitch ? 0.028 : 0.032)));
  const photoH = Math.round(height * (pitch ? 0.62 : 0.54));
  const radius = width * 0.1;
  const innerRadius = width * 0.075;

  return (
    <View
      style={{
        width,
        height,
        alignSelf: 'center',
        direction: 'ltr',
        borderRadius: radius,
        shadowColor: tone.glow,
        shadowOpacity: pitch ? 0.55 : 0.85,
        shadowRadius: pitch ? 8 : 14,
        shadowOffset: { width: 0, height: pitch ? 3 : 6 },
        elevation: pitch ? 6 : 10,
      }}
    >
      <LinearGradient
        colors={tone.frameColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: radius, padding: pad }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.45)', 'transparent', 'rgba(0,0,0,0.25)']}
          locations={[0, 0.35, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            position: 'absolute',
            top: 1,
            left: 1,
            right: 1,
            bottom: 1,
            borderRadius: radius - 1,
            borderWidth: 1,
            borderColor: 'rgba(255, 236, 170, 0.35)',
          }}
        />
        <LinearGradient
          colors={tone.faceColors}
          locations={[0, 0.45, 1]}
          style={{ flex: 1, borderRadius: innerRadius, overflow: 'hidden' }}
        >
          <CardMetalSheen />

          <View style={{ height: photoH, flexDirection: 'row', zIndex: 2 }}>
            <View style={{ width: width * 0.34, paddingTop: width * 0.03, paddingLeft: width * 0.024, zIndex: 3 }}>
              <Text
                style={{
                  color: tone.accent,
                  fontSize: width * (pitch ? 0.22 : 0.2),
                  fontWeight: '900',
                  lineHeight: width * (pitch ? 0.22 : 0.2),
                  textShadowColor: 'rgba(0,0,0,0.55)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {shell ? '' : rating}
              </Text>
              <Text style={{ color: tone.ink, fontSize: width * (pitch ? 0.08 : 0.072), fontWeight: '800', marginTop: -1, letterSpacing: 0.5 }}>
                {shell ? '' : player.position}
              </Text>
              {!pitch ? (
                <LinearGradient
                  colors={['#F5E6A8', '#C9A227', '#8A6A18']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    marginTop: 5,
                    alignSelf: 'flex-start',
                    borderRadius: 4,
                    paddingHorizontal: Math.max(4, width * 0.028),
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: '#1A1408', fontSize: Math.max(7, width * 0.048), fontWeight: '900', letterSpacing: 1.1 }}>ICON</Text>
                </LinearGradient>
              ) : null}
            </View>
            <View style={{ flex: 1, overflow: 'hidden' }}>
              {shell || !showPhoto ? null : (
                <Image
                  source={{ uri: media.photo }}
                  onError={() => setFailed(true)}
                  resizeMode="cover"
                  style={photoImageStyle(media.photoFocus)}
                />
              )}
            </View>
            <LinearGradient
              colors={['transparent', 'rgba(5,4,2,0.55)', tone.deep]}
              locations={[0, 0.55, 1]}
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: photoH * 0.42 }}
            />
          </View>

          <Text
            numberOfLines={1}
            style={{
              color: tone.ink,
              fontSize: width * (pitch ? 0.095 : 0.088),
              fontWeight: '900',
              textAlign: 'center',
              letterSpacing: pitch ? 0.5 : 1.2,
              marginTop: -width * 0.01,
              paddingHorizontal: 4,
              textShadowColor: 'rgba(0,0,0,0.6)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
              zIndex: 2,
            }}
          >
            {shell ? '' : surname(media.en)}
          </Text>

          {!pitch && !shell ? (
            <>
              <LinearGradient
                colors={['transparent', tone.accent, 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ height: 1.5, marginHorizontal: width * 0.12, marginTop: 3, marginBottom: 2, opacity: 0.7, zIndex: 2 }}
              />

              <View style={{ flexDirection: 'row', marginTop: 1, paddingHorizontal: 3, zIndex: 2 }}>
                {faceRows(player.position).map((row) => (
                  <View key={row.label} style={{ flex: 1, alignItems: 'center' }}>
                    <Text
                      style={{
                        color: tone.accent,
                        fontSize: Math.max(7, width * 0.045),
                        fontWeight: '800',
                        opacity: 0.75,
                        letterSpacing: 0.3,
                      }}
                    >
                      {row.label}
                    </Text>
                    <Text style={{ color: tone.ink, fontSize: Math.max(10, width * 0.076), fontWeight: '900' }}>
                      {shell ? '' : (media.face?.[row.key] ?? '·')}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <View style={{ flex: 1 }} />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: pitch ? 'flex-end' : 'center',
              alignItems: 'center',
              gap: width * 0.06,
              paddingBottom: width * (pitch ? 0.045 : 0.04),
              paddingRight: pitch ? width * 0.04 : 0,
              zIndex: 2,
            }}
          >
            {shell ? null : <NationFlag nation={player.nation} size={Math.max(12, width * (pitch ? 0.1 : 0.095))} />}
            {!pitch ? (
              <LinearGradient
                colors={['#F5E6A8', '#C9A227']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 5, paddingHorizontal: Math.max(6, width * 0.04), paddingVertical: 2 }}
              >
                <Text style={{ color: '#1A1408', fontSize: Math.max(8, width * 0.052), fontWeight: '900', letterSpacing: 1 }}>ICON</Text>
              </LinearGradient>
            ) : null}
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}
