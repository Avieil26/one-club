import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient as SvgLinearGradient, Path, Polygon, Stop } from 'react-native-svg';

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
  'upamecano': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50561206.webp',
  'diani': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50559009.webp',
  'caicedo-w': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50604801.webp',
  'mbeumo': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50574662.webp',
  'lookman': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50562547.webp',
  'haaland': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50570733.webp',
  'kiwior': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50597341.webp',
  'ea-275029-ibrahim-maza': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50606677.webp',
  'gordon': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50574612.webp',
  'ea-277846-nico-paz': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50609494.webp',
  'ea-223697-robin-gosens': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50555345.webp',
  'ea-270857-mateus-fernandes': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50602505.webp',
  'cucurella': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50570879.webp',
  'mckennie': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50570392.webp',
  'ea-254121-charlie-cresswell': 'https://game-assets.fut.gg/2026/player-item-social-small/27-50585769.webp',
};
const DESTINED_REMOTE_FALLBACK: Record<string, string> = {
  'upamecano': 'https://assets.fodder.gg/renders/50561206.webp',
  'diani': 'https://assets.fodder.gg/renders/50559009.webp',
  'caicedo-w': 'https://assets.fodder.gg/renders/50604801.webp',
  'mbeumo': 'https://assets.fodder.gg/renders/50574662.webp',
  'lookman': 'https://assets.fodder.gg/renders/50562547.webp',
  'haaland': 'https://assets.fodder.gg/renders/50570733.webp',
  'kiwior': 'https://assets.fodder.gg/renders/50597341.webp',
  'ea-275029-ibrahim-maza': 'https://assets.fodder.gg/renders/50606677.webp',
  'gordon': 'https://assets.fodder.gg/renders/50574612.webp',
  'ea-277846-nico-paz': 'https://assets.fodder.gg/renders/50609494.webp',
  'ea-223697-robin-gosens': 'https://assets.fodder.gg/renders/50555345.webp',
  'ea-270857-mateus-fernandes': 'https://assets.fodder.gg/renders/50602505.webp',
  'cucurella': 'https://assets.fodder.gg/renders/50570879.webp',
  'mckennie': 'https://assets.fodder.gg/renders/50570392.webp',
  'ea-254121-charlie-cresswell': 'https://assets.fodder.gg/renders/50585769.webp',
};

const OTW_REMOTE_ART: Record<string, string> = {
  'ea-264947-nicole-anyomi': 'https://game-assets.fut.gg/cdn-cgi/image/quality=85,width=300,format=auto/2027/player-item/27-50596595.acf6c24bd5d6e98a42d8e80d4757d6a74bf7ce8d8ff9dce9c0e0cb2bd39ca702.webp',
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

function DynamicTotwPortraitCard({ player, width }: { player: FcPlayer; width: number }) {
  const baseHeight = Math.round(width * TOTW_RATIO);
  const shellWidth = Math.round(width * 1.38);
  const shellHeight = Math.round(baseHeight * 1.38);
  const contentWidth = width;
  const contentHeight = baseHeight;
  const overlayOffsetX = Math.round((shellWidth - contentWidth) / 2);
  const overlayOffsetY = Math.round((shellHeight - contentHeight) / 2);
  const id = player.baseId ?? player.id;
  const media = playerMedia(id);
  const face = player.face ?? media.face;
  const stats = [
    ['PAC', face?.pac],
    ['SHO', face?.sho],
    ['PAS', face?.pas],
    ['DRI', face?.dri],
    ['DEF', face?.def],
    ['PHY', face?.phy],
  ] as const;
  const name = surname(media.en || player.name || id);
  const [failed, setFailed] = useState(false);

  return (
    <View
      style={{
        width: shellWidth,
        height: shellHeight,
        alignSelf: 'center',
        overflow: 'hidden',
        borderRadius: shellWidth * 0.08,
        backgroundColor: 'transparent',
      }}
    >
      <Image
        source={require('@/assets/images/cards/totw-shell.png')}
        resizeMode="stretch"
        style={{ position: 'absolute', top: 0, left: 0, width: shellWidth, height: shellHeight }}
      />
      <View
        style={{
          position: 'absolute',
          left: overlayOffsetX,
          top: overlayOffsetY,
          width: contentWidth,
          height: contentHeight,
        }}
      >
        {!failed && media.photo ? (
          <Image
            source={{ uri: media.photo }}
            resizeMode="contain"
            onError={() => setFailed(true)}
            accessibilityIgnoresInvertColors
            style={{
              position: 'absolute',
              left: contentWidth * 0.15,
              top: contentHeight * 0.075,
              width: contentWidth * 0.70,
              height: contentHeight * 0.47,
            }}
          />
        ) : null}
        <View style={{ position: 'absolute', top: contentHeight * 0.12, left: contentWidth * 0.11, zIndex: 4 }}>
          <Text style={{ color: '#F8F0FF', fontSize: Math.max(15, contentWidth * 0.19), lineHeight: Math.max(16, contentWidth * 0.19), fontWeight: '900' }}>{player.rating}</Text>
          <Text style={{ color: '#D8B4FE', fontSize: Math.max(7, contentWidth * 0.062), fontWeight: '900', letterSpacing: 0.8 }}>{player.position}</Text>
        </View>
        <View style={{ position: 'absolute', top: contentHeight * 0.095, right: contentWidth * 0.1, zIndex: 4, alignItems: 'center' }}>
          <Text style={{ color: '#F5D0FE', fontSize: Math.max(7, contentWidth * 0.052), fontWeight: '900', letterSpacing: 1.2 }}>TOTW</Text>
        </View>
        <View style={{ position: 'absolute', top: contentHeight * 0.60, left: contentWidth * 0.10, right: contentWidth * 0.10, zIndex: 5, alignItems: 'center' }}>
          <Text numberOfLines={1} style={{ color: '#FFFFFF', fontSize: Math.max(10, contentWidth * 0.095), fontWeight: '900', letterSpacing: 1.05 }}>{name}</Text>
          <View style={{ width: '72%', height: 1.5, backgroundColor: '#D8B4FE', marginTop: 4, opacity: 0.9 }} />
          <Text numberOfLines={1} style={{ color: '#D6D0DC', fontSize: Math.max(5.5, contentWidth * 0.043), fontWeight: '700', marginTop: 3 }}>{player.club}</Text>
        </View>
        <View style={{ position: 'absolute', left: contentWidth * 0.075, right: contentWidth * 0.075, bottom: contentHeight * 0.105, flexDirection: 'row', direction: 'ltr', zIndex: 6 }}>
          {stats.map(([label, value]) => (
            <View key={label} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: '#C084FC', fontSize: Math.max(4.5, contentWidth * 0.034), fontWeight: '800' }}>{label}</Text>
              <Text style={{ color: '#FFFFFF', fontSize: Math.max(7.5, contentWidth * 0.057), fontWeight: '900' }}>{value ?? '·'}</Text>
            </View>
          ))}
        </View>
        <View style={{ position: 'absolute', bottom: contentHeight * 0.022, left: 0, right: 0, alignItems: 'center', zIndex: 7 }}>
          <NationFlag nation={player.nation} size={Math.max(11, contentWidth * 0.082)} />
        </View>
      </View>
    </View>
  );
}

function TotwPortraitCard({
  art,
  width,
  glow = false,
  sign = '',
  scale = 1,
}: {
  art: number;
  width: number;
  glow?: boolean;
  sign?: string;
  scale?: number;
}) {
  const renderWidth = Math.round(width * scale);
  const renderHeight = Math.round(renderWidth * TOTW_RATIO);
  const card = (
    <Image
      source={art}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      style={{ width: renderWidth, height: renderHeight, alignSelf: 'center' }}
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
    <View style={{ width: renderWidth, height: renderHeight, overflow: 'visible', alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={art}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        style={[{ width: renderWidth, height: renderHeight, alignSelf: 'center' }, lit]}
      />
      {autograph ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: renderWidth * 0.2,
            right: renderWidth * 0.2,
            top: renderHeight * 0.632,
            height: renderHeight * 0.075,
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
              fontSize: renderWidth * script,
              lineHeight: renderWidth * script * 1.15,
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

function RemoteCardArt({ uri, fallbackUri, width }: { uri: string; fallbackUri?: string; width: number }) {
  const [sourceUri, setSourceUri] = useState(uri);
  const [failed, setFailed] = useState(false);
  const height = Math.round(width * DESTINED_RATIO);
  return failed ? (
    <View style={{ width, height, alignSelf: 'center' }} />
  ) : (
    <Image
      source={{ uri: sourceUri }}
      onError={() => {
        if (fallbackUri && sourceUri !== fallbackUri) setSourceUri(fallbackUri);
        else setFailed(true);
      }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      style={{ width, height }}
    />
  );
}

function FutureStarsPortraitCard({ player, width, shell = false }: { player: FcPlayer; width: number; shell?: boolean }) {
  const height = Math.round(width * 1.48);
  const media = playerMedia(player.baseId ?? player.id);
  const portraitUri = !shell ? media.photo : undefined;
  const face = player.face;
  const stats = player.position === 'GK'
    ? ([['DIV', face?.pac], ['HAN', face?.sho], ['KIC', face?.pas], ['REF', face?.dri], ['SPD', face?.def], ['POS', face?.phy]] as const)
    : ([['PAC', face?.pac], ['SHO', face?.sho], ['PAS', face?.pas], ['DRI', face?.dri], ['DEF', face?.def], ['PHY', face?.phy]] as const);
  const name = surname(player.en || player.name || '').toUpperCase();
  const silhouette = 'M120 7 C113 7 109 15 104 23 C99 31 91 29 82 22 L70 15 C62 12 55 19 47 27 L34 37 C22 41 16 51 13 69 L9 116 L3 132 L12 146 L12 181 L15 251 C18 282 42 309 120 350 C198 309 222 282 225 251 L228 181 L228 146 L237 132 L231 116 L227 69 C224 51 218 41 206 37 L193 27 C185 19 178 12 170 15 L158 22 C149 29 141 31 136 23 C131 15 127 7 120 7 Z';
  const sparkles = [
    [26, 67, 1.5], [42, 91, 1], [65, 55, 1.2], [88, 42, 1], [163, 40, 1.1],
    [189, 57, 1.6], [211, 83, 1], [219, 112, 1.4], [30, 130, 1.1], [22, 177, 1.7],
    [43, 202, 1], [207, 203, 1.4], [220, 228, 1], [190, 263, 1.1], [164, 287, 1],
    [71, 278, 1.2], [43, 250, 1], [59, 225, 0.9], [190, 94, 0.9], [35, 157, 1.1],
    [76, 72, 0.8], [205, 147, 0.9], [181, 221, 0.8], [93, 300, 0.9], [146, 277, 0.8],
    [27, 219, 0.8], [217, 184, 0.9], [52, 105, 0.8], [177, 67, 0.9], [197, 246, 1],
  ] as const;

  return (
    <View style={{ width, height, alignSelf: 'center', overflow: 'visible', backgroundColor: 'transparent' }}>
      <Svg width={width} height={height} viewBox="0 0 240 355" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id="future-stars-base" x1="0%" y1="0%" x2="90%" y2="100%">
            <Stop offset="0%" stopColor="#4C147D" />
            <Stop offset="20%" stopColor="#5023AB" />
            <Stop offset="44%" stopColor="#32106D" />
            <Stop offset="68%" stopColor="#241057" />
            <Stop offset="100%" stopColor="#08071D" />
          </SvgLinearGradient>
          <SvgLinearGradient id="future-stars-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E6F6FF" />
            <Stop offset="15%" stopColor="#9FA9FF" />
            <Stop offset="31%" stopColor="#FFF0A9" />
            <Stop offset="47%" stopColor="#B68A35" />
            <Stop offset="62%" stopColor="#F6DC92" />
            <Stop offset="79%" stopColor="#AABEFF" />
            <Stop offset="100%" stopColor="#F7E7B4" />
          </SvgLinearGradient>
          <SvgLinearGradient id="future-stars-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#9D661B" />
            <Stop offset="19%" stopColor="#FFF0A5" />
            <Stop offset="34%" stopColor="#C18A29" />
            <Stop offset="50%" stopColor="#FFF8CE" />
            <Stop offset="71%" stopColor="#A56A16" />
            <Stop offset="87%" stopColor="#F3D77E" />
            <Stop offset="100%" stopColor="#704110" />
          </SvgLinearGradient>
          <SvgLinearGradient id="future-stars-gloss" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.27" />
            <Stop offset="28%" stopColor="#B6C4FF" stopOpacity="0.08" />
            <Stop offset="63%" stopColor="#5A20CC" stopOpacity="0.04" />
            <Stop offset="100%" stopColor="#FA7DFF" stopOpacity="0.17" />
          </SvgLinearGradient>
          <ClipPath id="future-stars-card-clip">
            <Path d={silhouette} />
          </ClipPath>
        </Defs>

        {/* One custom card silhouette; no square plate behind it. */}
        <Path d={silhouette} fill="none" stroke="#41216E" strokeWidth="12" opacity="0.95" />
        <Path d={silhouette} fill="url(#future-stars-base)" />
        <G clipPath="url(#future-stars-card-clip)">
          <Path d="M-8 42 C39 10 69 29 92 61 C119 99 143 97 178 49 L246 7 L246 124 C205 156 180 170 139 156 C94 139 62 93 -8 119 Z" fill="#9A52FF" opacity="0.15" />
          <Path d="M-8 199 C42 156 64 183 91 217 C118 251 172 253 245 188 L245 285 C181 341 117 354 48 311 L-8 270 Z" fill="#D459FF" opacity="0.11" />
          <Path d="M10 57 L49 33 L74 43 L36 99 L20 139 Z" fill="#BBD6FF" opacity="0.11" />
          <Path d="M230 58 L194 33 L167 42 L207 101 L222 139 Z" fill="#F5D1FF" opacity="0.12" />
          <Path d="M19 225 C63 253 74 275 120 291 C166 275 177 253 221 225" fill="none" stroke="#B7B9FF" strokeWidth="1.2" opacity="0.28" />
          {sparkles.map(([cx, cy, r], index) => (
            <Circle key={index} cx={cx} cy={cy} r={r} fill={index % 3 === 0 ? '#FFF4C1' : '#D8D8FF'} opacity={index % 2 === 0 ? 0.76 : 0.42} />
          ))}

          {/* The signature gold, interwoven globe behind the portrait. */}
          <Path d="M48 145 C50 109 94 81 143 86 C187 90 218 119 212 150 C206 181 162 205 115 199 C71 193 45 169 48 145 Z" fill="#B87520" opacity="0.12" />
          <Path d="M48 145 C50 109 94 81 143 86 C187 90 218 119 212 150 C206 181 162 205 115 199 C71 193 45 169 48 145 Z" fill="none" stroke="url(#future-stars-gold)" strokeWidth="2.5" opacity="0.96" />
          <Path d="M55 121 C93 138 166 144 209 120" fill="none" stroke="url(#future-stars-gold)" strokeWidth="3.5" opacity="0.98" />
          <Path d="M49 143 C93 162 166 168 211 143" fill="none" stroke="url(#future-stars-gold)" strokeWidth="4" opacity="0.95" />
          <Path d="M58 164 C98 183 160 185 202 161" fill="none" stroke="url(#future-stars-gold)" strokeWidth="3" opacity="0.92" />
          <Path d="M78 97 C59 124 62 161 88 186" fill="none" stroke="url(#future-stars-gold)" strokeWidth="4" opacity="0.95" />
          <Path d="M103 88 C82 119 86 166 115 198" fill="none" stroke="url(#future-stars-gold)" strokeWidth="4.5" opacity="0.98" />
          <Path d="M137 87 C117 117 119 165 146 200" fill="none" stroke="url(#future-stars-gold)" strokeWidth="4.5" opacity="0.98" />
          <Path d="M169 98 C153 122 158 164 179 181" fill="none" stroke="url(#future-stars-gold)" strokeWidth="4" opacity="0.95" />
          <Path d="M62 113 C85 150 145 178 196 170" fill="none" stroke="url(#future-stars-gold)" strokeWidth="3.1" opacity="0.86" />
          <Path d="M59 163 C99 137 154 109 200 113" fill="none" stroke="url(#future-stars-gold)" strokeWidth="3.1" opacity="0.86" />
          <Path d="M73 100 C111 128 166 146 204 136" fill="none" stroke="#FFF4BE" strokeWidth="1" opacity="0.75" />
          <Path d="M72 181 C111 160 159 158 192 174" fill="none" stroke="#FFF4BE" strokeWidth="1.1" opacity="0.7" />
          <Path d="M42 151 C27 128 31 105 51 91" fill="none" stroke="#C9B7FF" strokeWidth="2.5" opacity="0.65" />
          <Path d="M208 88 C230 107 233 132 219 154" fill="none" stroke="#C5D4FF" strokeWidth="2.5" opacity="0.7" />

          <Path d="M8 37 L45 15 L69 24 L31 80 L15 116 Z" fill="url(#future-stars-gloss)" />
          <Path d="M232 37 L195 15 L171 24 L209 80 L225 116 Z" fill="url(#future-stars-gloss)" />
          <Path d="M8 13 L232 13 L232 355 L8 355 Z" fill="url(#future-stars-gloss)" />
        </G>

        {/* Iridescent, gold-edged contour follows the exact card shape. */}
        <Path d={silhouette} fill="none" stroke="#8CA9FF" strokeWidth="5.2" opacity="0.78" />
        <Path d={silhouette} fill="none" stroke="url(#future-stars-metal)" strokeWidth="2.5" opacity="0.98" />
        <Path d="M120 14 C111 14 108 24 103 30 C95 35 85 28 77 22 C66 14 57 26 48 34 L35 43 C25 49 22 63 20 81 L17 121 L12 135 L19 145 L19 179 L21 250 C26 279 48 303 120 337 C192 303 214 279 219 250 L221 179 L221 145 L228 135 L223 121 L220 81 C218 63 215 49 205 43 L192 34 C183 26 174 14 163 22 C155 28 145 35 137 30 C132 24 129 14 120 14 Z" fill="none" stroke="#F8E8FF" strokeWidth="0.9" opacity="0.62" />

        {/* Small promo crest at the left, echoing the item mark on FUTBIN cards. */}
        <Polygon points="13,157 27,148 41,157 27,174" fill="#261263" stroke="#E1D5FF" strokeWidth="1.4" />
        <Polygon points="19,157 27,152 35,157 27,167" fill="none" stroke="#CBB9FF" strokeWidth="0.9" />
        <Path d="M27 155 L29 159 L33 159 L30 162 L31 166 L27 164 L23 166 L24 162 L21 159 L25 159 Z" fill="#FFF0A8" />

        {/* Tiny crown accents; no foot, skills or weak-foot text belongs on the artwork. */}
        <Path d="M120 9 L123 15 L130 16 L125 21 L126 27 L120 24 L114 27 L115 21 L110 16 L117 15 Z" fill="#FFF1B5" stroke="#B77E2A" strokeWidth="0.7" />
      </Svg>

      {portraitUri ? (
        <Image
          source={{ uri: portraitUri }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          style={{
            position: 'absolute',
            left: width * 0.045,
            top: height * 0.105,
            width: width * 0.91,
            height: height * 0.635,
          }}
        />
      ) : (
        <Svg width={width * 0.72} height={height * 0.52} viewBox="0 0 200 240" style={{ position: 'absolute', top: height * 0.15, left: width * 0.14 }}>
          <Circle cx="100" cy="72" r="37" fill="#B49AFF" opacity="0.9" />
          <Path d="M26 235 Q34 137 100 132 Q166 137 174 235 Z" fill="#7551B0" opacity="0.95" />
          <Path d="M63 53 Q69 20 100 24 Q132 20 138 55" stroke="#F3DCFF" strokeWidth="4" fill="none" opacity="0.75" />
        </Svg>
      )}

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(19,7,47,0)', 'rgba(22,8,50,0.04)', 'rgba(14,5,37,0.66)', '#0D0825']}
        locations={[0, 0.38, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: 'absolute', top: height * 0.49, left: width * 0.07, width: width * 0.86, height: height * 0.26 }}
      />

      <View style={{ position: 'absolute', top: height * 0.055, left: width * 0.105, zIndex: 5, alignItems: 'flex-start' }}>
        <Text style={{ color: '#FFFFFF', fontSize: Math.max(19, width * 0.2), lineHeight: Math.max(21, width * 0.205), fontWeight: '900', letterSpacing: -0.9, textShadowColor: '#180A40', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
          {shell ? '' : player.rating}
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: Math.max(8, width * 0.07), lineHeight: Math.max(10, width * 0.075), fontWeight: '900', letterSpacing: 0.4, textShadowColor: '#180A40', textShadowRadius: 3 }}>
          {shell ? '' : player.position}
        </Text>
      </View>

      <View style={{ position: 'absolute', top: height * 0.675, left: width * 0.09, right: width * 0.09, zIndex: 5, alignItems: 'center' }}>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={{ color: '#FFFFFF', fontSize: Math.max(10, width * 0.112), fontWeight: '900', letterSpacing: 0.1, textAlign: 'center', textShadowColor: '#120520', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}>
          {shell ? '' : name}
        </Text>
        <View style={{ width: '52%', height: 1, backgroundColor: '#E6C97C', opacity: 0.88, marginTop: 2 }} />
      </View>

      <View style={{ position: 'absolute', top: height * 0.748, left: 0, right: 0, zIndex: 5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: width * 0.075 }}>
        {!shell ? <ClubBadge club={player.club} size={Math.max(12, width * 0.087)} /> : null}
        {!shell ? <NationFlag nation={player.nation} size={Math.max(11, width * 0.08)} /> : null}
      </View>

      <View style={{ position: 'absolute', top: height * 0.805, left: width * 0.095, right: width * 0.095, zIndex: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        {stats.map(([label, value], index) => (
          <View key={label} style={{ flex: 1, alignItems: 'center', borderLeftWidth: index ? 0.6 : 0, borderColor: 'rgba(238,216,255,0.23)' }}>
            <Text style={{ color: '#F3D98E', fontSize: Math.max(5, width * 0.039), fontWeight: '900', letterSpacing: -0.15 }}>{label}</Text>
            <Text style={{ color: '#FFFFFF', fontSize: Math.max(8, width * 0.066), lineHeight: Math.max(10, width * 0.071), fontWeight: '900', textShadowColor: '#1D0A42', textShadowRadius: 3 }}>
              {shell ? '' : value ?? '—'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
function OtwPortraitCard({ player, width }: { player: FcPlayer; width: number }) {
  const height = Math.round(width * DESTINED_RATIO);
  const data = otwFor(player.baseId ?? player.id);
  const face = data?.face ?? player.face;
  const [failed, setFailed] = useState(false);
  const uri = OTW_REMOTE_ART[player.baseId ?? player.id];
  const statRows = [
    ['PAC', face?.pac],
    ['SHO', face?.sho],
    ['PAS', face?.pas],
    ['DRI', face?.dri],
    ['DEF', face?.def],
    ['PHY', face?.phy],
  ] as const;
  const name = (player.en || player.name || '').trim().split(' ').pop()?.toUpperCase() || player.name.toUpperCase();

  return (
    <View
      style={{
        width,
        height,
        alignSelf: 'center',
        borderRadius: width * 0.075,
        overflow: 'hidden',
        backgroundColor: '#0B0810',
        borderWidth: 1.5,
        borderColor: '#D56BFF',
        shadowColor: '#D946EF',
        shadowOpacity: 0.42,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 7 },
        elevation: 8,
      }}
    >
      <LinearGradient
        colors={['#26133B', '#110C20', '#07070D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, padding: Math.max(5, width * 0.03) }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.16)', 'transparent', 'rgba(217,70,239,0.12)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View style={{ flex: 1, borderRadius: width * 0.055, overflow: 'hidden', backgroundColor: '#0A0910' }}>
          <LinearGradient
            colors={['rgba(217,70,239,0.18)', 'transparent', 'rgba(0,0,0,0.58)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.58, zIndex: 2 }}
          />
          <View style={{ position: 'absolute', top: 0, left: 0, zIndex: 5, padding: width * 0.055, gap: 1 }}>
            <Text style={{ color: '#F7E9FF', fontSize: Math.max(14, width * 0.19), fontWeight: '900', lineHeight: Math.max(15, width * 0.19) }}>
              {player.rating}
            </Text>
            <Text style={{ color: '#E5B5FF', fontSize: Math.max(7, width * 0.065), fontWeight: '900', letterSpacing: 0.8 }}>
              {player.position}
            </Text>
          </View>
          <View style={{ position: 'absolute', top: height * 0.055, right: width * 0.055, zIndex: 5, paddingHorizontal: width * 0.04, paddingVertical: width * 0.018, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,214,255,0.6)', backgroundColor: 'rgba(12,6,19,0.78)' }}>
            <Text style={{ color: '#FFD6FF', fontSize: Math.max(6, width * 0.05), fontWeight: '900', letterSpacing: 1.1 }}>OTW</Text>
          </View>
          {uri && !failed ? (
            <Image
              source={{ uri }}
              onError={() => setFailed(true)}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
              style={{ position: 'absolute', left: width * 0.02, right: width * 0.02, top: height * 0.04, width: width * 0.96, height: height * 0.64 }}
            />
          ) : null}
          <LinearGradient
            colors={['transparent', 'rgba(7,7,13,0.25)', '#07070D']}
            locations={[0, 0.35, 1]}
            style={{ position: 'absolute', left: 0, right: 0, top: height * 0.42, height: height * 0.27, zIndex: 3 }}
          />
          <View style={{ position: 'absolute', left: width * 0.08, right: width * 0.08, top: height * 0.61, zIndex: 6 }}>
            <Text numberOfLines={1} style={{ color: '#FFFFFF', fontSize: Math.max(11, width * 0.1), fontWeight: '900', textAlign: 'center', letterSpacing: 1.1 }}>
              {name}
            </Text>
            <View style={{ height: 1.5, marginTop: 4, backgroundColor: '#D56BFF', opacity: 0.82 }} />
            <Text style={{ color: '#C9B8D4', fontSize: Math.max(5.5, width * 0.045), fontWeight: '700', textAlign: 'center', marginTop: 3 }}>
              {player.club}
            </Text>
          </View>
          <View style={{ position: 'absolute', left: width * 0.055, right: width * 0.055, bottom: height * 0.075, flexDirection: 'row', zIndex: 7 }}>
            {statRows.map(([label, value]) => (
              <View key={label} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: '#C995F6', fontSize: Math.max(5, width * 0.041), fontWeight: '800', letterSpacing: 0.2 }}>{label}</Text>
                <Text style={{ color: '#FFF8FF', fontSize: Math.max(8, width * 0.062), fontWeight: '900' }}>{value ?? '·'}</Text>
              </View>
            ))}
          </View>
          <View style={{ position: 'absolute', bottom: width * 0.035, left: 0, right: 0, alignItems: 'center', zIndex: 7 }}>
            <NationFlag nation={player.nation} size={Math.max(11, width * 0.085)} />
          </View>
        </View>
      </LinearGradient>
    </View>
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
function SquadFoundationsPortraitCard({ player, width, compact = false }: { player: FcPlayer; width: number; compact?: boolean }) {
  const media = playerMedia(player.id);
  const face = player.face ?? media.face;
  const height = Math.round(width * (compact ? 1.53 : 1.61));
  const photoHeight = Math.round(height * (compact ? 0.49 : 0.51));
  const statRows = [
    ['PAC', face?.pac],
    ['SHO', face?.sho],
    ['PAS', face?.pas],
    ['DRI', face?.dri],
    ['DEF', face?.def],
    ['PHY', face?.phy],
  ] as const;

  return (
    <View
      style={{
        width,
        height,
        alignSelf: 'center',
        overflow: 'hidden',
        borderRadius: width * 0.11,
        borderWidth: compact ? 1.1 : 1.7,
        borderColor: '#CFFFF3',
        backgroundColor: '#071B18',
        shadowColor: '#49DDBE',
        shadowOpacity: compact ? 0.22 : 0.32,
        shadowRadius: compact ? 5 : 12,
        shadowOffset: { width: 0, height: compact ? 2 : 7 },
        elevation: compact ? 4 : 8,
      }}
    >
      <LinearGradient
        colors={['#0B5449', '#0E7665', '#0A302B', '#041513']}
        locations={[0, 0.32, 0.69, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(243,255,252,0.18)', 'transparent', 'rgba(67,250,211,0.11)']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={{ position: 'absolute', left: -width * 0.18, top: height * 0.10, width: width * 1.05, height: width * 0.045, backgroundColor: 'rgba(222,255,247,0.12)', transform: [{ rotate: '-23deg' }] }} />
      <View style={{ position: 'absolute', right: -width * 0.22, top: height * 0.30, width: width * 1.12, height: width * 0.03, backgroundColor: 'rgba(71,255,216,0.11)', transform: [{ rotate: '-23deg' }] }} />
      <View style={{ position: 'absolute', top: -width * 0.10, right: -width * 0.13, width: width * 0.70, height: width * 0.70, borderRadius: width, borderWidth: 1, borderColor: 'rgba(216,255,247,0.16)' }} />

      <View style={{ position: 'absolute', top: compact ? width * 0.035 : width * 0.045, left: compact ? width * 0.055 : width * 0.065, right: compact ? width * 0.055 : width * 0.065, flexDirection: 'row', direction: 'ltr', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 6 }}>
        <View>
          <Text style={{ color: '#F5FFFC', fontSize: compact ? width * 0.16 : width * 0.18, lineHeight: compact ? width * 0.16 : width * 0.18, fontWeight: '900', letterSpacing: -0.7 }}>{player.rating}</Text>
          <Text style={{ color: '#A9F9E7', fontSize: Math.max(6, width * 0.055), lineHeight: Math.max(7, width * 0.065), fontWeight: '900', letterSpacing: 0.8 }}>{player.position}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: '#E7FFFA', fontSize: Math.max(5.5, width * 0.044), fontWeight: '900', letterSpacing: 1.5 }}>SQUAD FOUNDATIONS</Text>
          <Text style={{ color: 'rgba(235,255,251,0.56)', fontSize: Math.max(4.5, width * 0.033), fontWeight: '800', letterSpacing: 0.7 }}>84 OVR · PLAYER ITEM</Text>
        </View>
      </View>

      <View style={{ height: photoHeight, marginTop: compact ? width * 0.005 : width * 0.012, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>
        {media.photo ? (
          <Image
            source={{ uri: media.photo }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
            style={{
              width: width * (compact ? 0.94 : 0.96),
              height: photoHeight * 1.10,
              marginBottom: -height * 0.008,
              ...(Platform.OS === 'web' ? ({ objectFit: 'contain', objectPosition: 'center 13%' } as object) : {}),
            }}
          />
        ) : null}
        <LinearGradient
          colors={['transparent', 'rgba(3,19,16,0.90)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: photoHeight * 0.28 }}
        />
      </View>

      <View
        style={{
          marginHorizontal: compact ? width * 0.055 : width * 0.05,
          marginTop: -width * 0.004,
          borderRadius: width * 0.045,
          overflow: 'hidden',
          zIndex: 7,
          borderWidth: 1,
          borderColor: 'rgba(251,255,253,0.72)',
        }}
      >
        <LinearGradient
          colors={['#F7FFFC', '#BEEFE0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ paddingHorizontal: compact ? width * 0.035 : width * 0.04, paddingVertical: compact ? width * 0.024 : width * 0.032 }}
        >
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 7 }}>
            <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-end' }}>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={{ color: '#061715', fontSize: compact ? Math.max(8.2, width * 0.093) : Math.max(13, width * 0.108), lineHeight: compact ? Math.max(9, width * 0.105) : Math.max(15, width * 0.12), fontWeight: '900', letterSpacing: 0.55 }}>PATATI</Text>
              <Text numberOfLines={1} style={{ color: '#315950', fontSize: compact ? Math.max(4.5, width * 0.038) : Math.max(6, width * 0.045), fontWeight: '800', marginTop: 2 }}>RW · RM++ · LEFT FOOT</Text>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <ClubBadge club={player.club} size={compact ? Math.max(16, width * 0.17) : Math.max(23, width * 0.13)} />
              {!compact ? <NationFlag nation={player.nation} size={Math.max(11, width * 0.075)} /> : null}
            </View>
          </View>
          {!compact ? (
            <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 5, marginTop: 6 }}>
              <Text style={{ color: '#24544A', fontSize: Math.max(5.5, width * 0.035), fontWeight: '900' }}>4★ SKILLS</Text>
              <Text style={{ color: '#24544A', fontSize: Math.max(5.5, width * 0.035), fontWeight: '900' }}>3★ WEAK FOOT</Text>
              <Text style={{ color: '#0A3F34', backgroundColor: '#8FECD3', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3, fontSize: Math.max(5.5, width * 0.035), fontWeight: '900' }}>RM++</Text>
            </View>
          ) : null}
        </LinearGradient>
      </View>

      <View style={{ marginTop: compact ? width * 0.018 : width * 0.022, paddingHorizontal: compact ? width * 0.055 : width * 0.06, gap: compact ? 5 : 6, zIndex: 7 }}>
        {(compact ? [statRows.slice(0, 3), statRows.slice(3)] : [statRows]).map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', direction: 'ltr', gap: compact ? 3 : 5 }}>
            {row.map(([label, value]) => (
              <View key={label} style={{ flex: 1, minWidth: 0, alignItems: 'center', borderRadius: 7, backgroundColor: compact ? 'rgba(2,17,14,0.48)' : 'rgba(3,21,18,0.34)', borderWidth: 1, borderColor: 'rgba(206,255,244,0.13)', paddingVertical: compact ? 3 : 4 }}>
                <Text style={{ color: '#A7F7E4', fontSize: compact ? Math.max(4.5, width * 0.034) : Math.max(5.5, width * 0.036), fontWeight: '900', letterSpacing: 0.25 }}>{label}</Text>
                <Text style={{ color: '#FFFFFF', fontSize: compact ? Math.max(7.4, width * 0.058) : Math.max(8.5, width * 0.064), lineHeight: compact ? Math.max(9, width * 0.067) : Math.max(10, width * 0.073), fontWeight: '900' }}>{value ?? '·'}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }} />
      <View style={{ alignItems: 'center', paddingTop: compact ? 4 : 6, paddingBottom: compact ? width * 0.022 : width * 0.029 }}>
        <Text style={{ color: '#BDF8E9', fontSize: Math.max(4.5, width * 0.034), fontWeight: '900', letterSpacing: 1.1 }}>UNTRADEABLE · SQUAD FOUNDATIONS</Text>
      </View>
    </View>
  );
}
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
  edition?: 'auto' | 'base' | 'destined' | 'hero' | 'totw' | 'otw' | 'squadFoundations' | 'futureStars';
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
  if (destinedRemote) return <RemoteCardArt uri={destinedRemote} fallbackUri={DESTINED_REMOTE_FALLBACK[artId]} width={width} />;
  const shownEdition = edition === 'auto' ? player.edition : edition;
  if (shownEdition === 'futureStars') return <FutureStarsPortraitCard player={player} width={width} shell={shell} />;
  if (shownEdition === 'squadFoundations' && !shell) return <SquadFoundationsPortraitCard player={player} width={width} compact={compactStats} />;
  const otw = shownEdition === 'otw' ? otwFor(artId) : null;
  if (shownEdition === 'otw') {
    const otwArt = OTW_REMOTE_ART[artId];
    if (otwArt) return <OtwPortraitCard player={player} width={width} />;
  }
  const aura = glow && shownEdition === 'totw' ? totwAura() : undefined;
  if (shownEdition === 'totw') {
    const totwArt = TOTW_ART[artId];
    if (totwArt) {
      const autograph = glow && totwFinish(artId) === 'pristine' ? surname(player.en || player.name || '') : '';
      return <TotwPortraitCard art={totwArt} width={width} glow={Boolean(aura)} sign={autograph} scale={1.28} />;
    }
    return <DynamicTotwPortraitCard player={player} width={width} />;
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
export function TypeShell({ kind, width }: { kind: 'gold' | 'silver' | 'icon' | 'otw' | 'hero' | 'totw' | 'futureStars'; width: number }) {
  if (kind === 'otw') return <OtwShell width={width} />;
  if (kind === 'totw') return <TotwPortraitCard art={require('@/assets/images/cards/totw-shell.png')} width={width} />;
  if (kind === 'futureStars') {
    const player: FcPlayer = { id: 'shell-futureStars', name: ' ', en: ' ', rating: 88, position: 'CM', nation: '', league: '', club: '', edition: 'futureStars' };
    return <PortraitCard player={player} width={width} shell />;
  }
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
  edition?: 'auto' | 'base' | 'destined' | 'hero' | 'totw' | 'otw' | 'squadFoundations' | 'futureStars';
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
