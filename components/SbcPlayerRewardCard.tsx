import { LinearGradient } from 'expo-linear-gradient';
import { Image, Text, View } from 'react-native';

import { ClubBadge } from '@/components/ClubBadge';
import { NationFlag } from '@/components/NationFlag';
import { playerMedia } from '@/lib/playerMedia';

export type SbcPlayerRewardCardProps = {
  playerId: string;
  name: string;
  rating: number;
  position: string;
  nation: string;
  club: string;
  foot: 'L' | 'R';
  skillMoves: number;
  weakFoot: number;
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  rarity: 'POTM' | 'DESTINED';
  width?: number;
};

const STAT_ROWS: Array<[keyof Omit<SbcPlayerRewardCardProps, 'playerId' | 'name' | 'rating' | 'position' | 'nation' | 'club' | 'foot' | 'skillMoves' | 'weakFoot' | 'rarity' | 'width'>, string]> = [
  ['pac', 'PAC'],
  ['sho', 'SHO'],
  ['pas', 'PAS'],
  ['dri', 'DRI'],
  ['def', 'DEF'],
  ['phy', 'PHY'],
];

export function SbcPlayerRewardCard({
  playerId,
  name,
  rating,
  position,
  nation,
  club,
  foot,
  skillMoves,
  weakFoot,
  pac,
  sho,
  pas,
  dri,
  def,
  phy,
  rarity,
  width = 70,
}: SbcPlayerRewardCardProps) {
  const height = Math.round(width * 1.3143);
  const media = playerMedia(playerId);
  const photo = media.photo;

  return (
    <View
      accessibilityLabel={`${name} ${rating} ${position} SBC reward card`}
      style={{
        width,
        height,
        alignSelf: 'center',
        borderRadius: width * 0.11,
        overflow: 'hidden',
        shadowColor: rarity === 'DESTINED' ? '#2BB8A0' : '#E3B341',
        shadowOpacity: 0.8,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 7,
        backgroundColor: '#0A0D12',
      }}
    >
      <LinearGradient
        colors={rarity === 'DESTINED'
          ? ['#B8FFF0', '#25B79D', '#0B4F45']
          : ['#FFF1B0', '#D9A93A', '#6E4A0D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, padding: 2 }}
      >
        <View style={{ flex: 1, borderRadius: width * 0.085, overflow: 'hidden', backgroundColor: '#0A1115' }}>
          <LinearGradient
            colors={rarity === 'DESTINED'
              ? ['#12352E', '#081714', '#04100E']
              : ['#39290D', '#171207', '#090704']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{ flex: 1 }}
          >
            <View style={{ position: 'absolute', left: 0, top: 0, right: 0, height: height * 0.06, backgroundColor: 'rgba(255,255,255,0.18)' }} />
            <View style={{ position: 'absolute', left: 4, top: 4, zIndex: 5 }}>
              <Text style={{ color: '#FFF7D6', fontSize: Math.max(13, width * 0.25), lineHeight: Math.max(14, width * 0.26), fontWeight: '900' }}>{rating}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: Math.max(7, width * 0.105), lineHeight: Math.max(8, width * 0.115), fontWeight: '900' }}>{position}</Text>
            </View>
            <View style={{ position: 'absolute', right: 4, top: 5, zIndex: 5 }}>
              <Text style={{ color: rarity === 'DESTINED' ? '#8CFFE4' : '#FFE69A', fontSize: Math.max(6, width * 0.09), fontWeight: '900', letterSpacing: 0.7 }}>{rarity}</Text>
            </View>
            <View style={{ position: 'absolute', left: 4, right: 4, top: height * 0.19, height: height * 0.39, alignItems: 'center', justifyContent: 'center' }}>
              {photo ? (
                <Image
                  source={{ uri: photo }}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <View style={{ width: width * 0.58, height: width * 0.58, borderRadius: width * 0.29, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#F7F8FA', fontWeight: '900', fontSize: width * 0.18 }}>
                    {name.slice(0, 1)}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ position: 'absolute', left: 5, right: 5, bottom: height * 0.37, alignItems: 'center' }}>
              <Text numberOfLines={1} style={{ color: '#FFFFFF', fontSize: Math.max(7, width * 0.115), lineHeight: Math.max(8, width * 0.13), fontWeight: '900', textTransform: 'uppercase', textAlign: 'center' }}>
                {name}
              </Text>
              <Text style={{ color: rarity === 'DESTINED' ? '#9EFFE7' : '#FFE8A6', fontSize: Math.max(6, width * 0.075), fontWeight: '800', marginTop: 1 }}>
                {skillMoves}★  {weakFoot}★
              </Text>
            </View>

            <View style={{ position: 'absolute', left: 4, right: 4, bottom: height * 0.065, flexDirection: 'row', flexWrap: 'wrap' }}>
              {STAT_ROWS.map(([key, label]) => (
                <View key={label} style={{ width: '33.333%', flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 1 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.58)', fontSize: Math.max(5, width * 0.062), fontWeight: '800' }}>{label}</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: Math.max(7, width * 0.09), fontWeight: '900' }}>
                    {({ pac, sho, pas, dri, def, phy } as Record<string, number>)[key]}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ position: 'absolute', left: 4, right: 4, bottom: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <NationFlag nation={nation} size={Math.max(9, width * 0.14)} />
              <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: Math.max(5, width * 0.06), fontWeight: '900' }}>{foot === 'L' ? 'L' : 'R'}</Text>
              <ClubBadge club={club} size={Math.max(9, width * 0.14)} />
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>
    </View>
  );
}
