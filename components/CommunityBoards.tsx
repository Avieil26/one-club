import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Image, Platform, Pressable, Text, useWindowDimensions, View, type ImageStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Polygon, Stop } from 'react-native-svg';

import { ProfileFace } from '@/components/ProfileFace';
import { careerFont } from '@/lib/careerCardTheme';
import type { BoardRow, CommunityBoards as BoardData } from '@/lib/communityBoard';

const INK = '#241c14';

function Trophy({ tone }: { tone: 'gold' | 'silver' | 'bronze' }) {
  const fill = tone === 'gold' ? '#f0c14a' : tone === 'silver' ? '#d7dee6' : '#c9844a';
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill={fill}
        d="M8 3h8v2h2.2c.5 0 .8.4.8.9V8a3.2 3.2 0 0 1-2.6 3.1A5.2 5.2 0 0 1 13 15.2V18h3v2H8v-2h3v-2.8a5.2 5.2 0 0 1-3.4-4.1A3.2 3.2 0 0 1 5 8V5.9c0-.5.3-.9.8-.9H8V3zm-1.2 3.2V8c0 .8.5 1.5 1.2 1.8-.1-.6-.2-1.2-.2-1.8V6.2H6.8zm10.4 0h-1V8c0 .6-.1 1.2-.2 1.8.7-.3 1.2-1 1.2-1.8V6.2z"
      />
    </Svg>
  );
}

function HexMark() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Path fill="none" stroke="#fff" strokeWidth={1.7} d="M12 2.8 20.2 7.4v9.2L12 21.2 3.8 16.6V7.4L12 2.8z" />
    </Svg>
  );
}

function CheckMark({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill="#3ddc97" d="M12 2a10 10 0 1 0 .01 20.01A10 10 0 0 0 12 2zm-1.1 14.1-3.6-3.6 1.5-1.5 2.1 2.1 4.8-4.8 1.5 1.5-6.3 6.3z" />
    </Svg>
  );
}

function HeartMark({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill="#ff4d6a" d="M12 20.4s-6.7-4.1-6.7-8.6c0-2.4 1.8-4.1 4-4.1 1.2 0 2.2.6 2.7 1.5.5-.9 1.5-1.5 2.7-1.5 2.2 0 4 1.7 4 4.1 0 4.5-6.7 8.6-6.7 8.6z" />
    </Svg>
  );
}

function LevelShield({ level, id }: { level: number; id: string }) {
  const tone = level >= 20 ? 'gold' : level >= 10 ? 'silver' : 'bronze';
  const stops =
    tone === 'gold' ? ['#ffe7a6', '#e2b34a', '#a67c2d'] : tone === 'silver' ? ['#f4f7fb', '#b7c0ca', '#8d98a4'] : ['#f3c7a2', '#c4844a', '#8a5430'];
  const gid = `shield-${id}-${tone}`;
  return (
    <View style={{ width: 34, height: 38, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={34} height={38} viewBox="0 0 34 38" style={{ position: 'absolute' }}>
        <Defs>
          <SvgGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={stops[0]} />
            <Stop offset="0.52" stopColor={stops[1]} />
            <Stop offset="1" stopColor={stops[2]} />
          </SvgGradient>
        </Defs>
        <Polygon points="17,1 33,10 33,28 17,37 1,28 1,10" fill={`url(#${gid})`} />
      </Svg>
      <Text style={{ color: INK, fontFamily: careerFont, fontSize: 13, fontWeight: '900' }}>{level}</Text>
    </View>
  );
}

function Rank({ place }: { place: number }) {
  if (place === 1) return <Trophy tone="gold" />;
  if (place === 2) return <Trophy tone="silver" />;
  if (place === 3) return <Trophy tone="bronze" />;
  return <Text style={{ color: '#d5dbe3', fontFamily: careerFont, fontSize: 15, fontWeight: '700' }}>{place}</Text>;
}

function BoardRowView({ row, place, mark, onOpenProfile }: { row: BoardRow; place: number; mark?: 'check' | 'heart'; onOpenProfile?: (userId: string) => void }) {
  const value = row.value.toLocaleString('en-US');
  return (
    <Pressable
      disabled={!onOpenProfile}
      onPress={() => onOpenProfile?.(row.userId)}
      style={{
        minHeight: 58,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.07)',
        flexDirection: 'row',
        direction: 'rtl',
        alignItems: 'center',
        gap: 8,
        backgroundColor: row.you ? 'rgba(227,179,65,0.08)' : 'transparent',
      }}
    >
      <View style={{ width: 46, alignItems: 'center' }}>
        <Rank place={place} />
      </View>
      <View style={{ width: 46, alignItems: 'center' }}>
        <Text style={{ color: '#8b939e', fontFamily: careerFont, fontSize: 14, fontWeight: '700' }}>–</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', direction: 'rtl', alignItems: 'center', gap: 10 }}>
        <ProfileFace name={row.name} uri={row.avatarUrl} size={38} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ color: '#f3f5f7', fontFamily: careerFont, fontSize: 15, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' }}>
            {row.name}
          </Text>
          <Text numberOfLines={1} style={{ color: '#8b939e', fontFamily: careerFont, fontSize: 11, fontWeight: '600', textAlign: 'right', writingDirection: 'rtl' }}>
            {row.joined}
          </Text>
        </View>
      </View>
      <LevelShield level={row.level} id={`${row.userId}-${place}`} />
      <View style={{ width: 84, flexDirection: 'row', direction: 'rtl', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
        {mark === 'check' ? <CheckMark size={14} /> : null}
        {mark === 'heart' ? <HeartMark size={14} /> : null}
        <Text style={{ color: '#f3f5f7', fontFamily: careerFont, fontSize: 16, fontWeight: '800', writingDirection: 'ltr' }}>{value}</Text>
      </View>
    </View>
  );
}

function Column({
  title,
  color,
  icon,
  valueLabel,
  rows,
  mark,
  onOpenProfile,
}: {
  title: string;
  color: string;
  icon: ReactNode;
  valueLabel: string;
  rows: BoardRow[];
  mark?: 'check' | 'heart';
  onOpenProfile?: (userId: string) => void;
}) {
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
        {icon}
        <Text style={{ color, fontFamily: careerFont, fontSize: 26, fontWeight: '800', textAlign: 'center' }}>{title}</Text>
      </View>
      <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', gap: 8, paddingHorizontal: 6, paddingBottom: 8 }}>
        <Text style={[head, { width: 46 }]}>דירוג</Text>
        <Text style={[head, { width: 46 }]}>מגמה</Text>
        <Text style={[head, { flex: 1, width: undefined, textAlign: 'right' }]}>משתמש</Text>
        <Text style={[head, { width: 34 }]}>רמה</Text>
        <Text style={[head, { width: 84, textAlign: 'left' }]}>{valueLabel}</Text>
      </View>
      {rows.length ? (
        rows.map((row, index) => <BoardRowView key={row.userId} row={row} place={index + 1} mark={mark} onOpenProfile={onOpenProfile} />)
      ) : (
        <Text style={{ color: '#8b939e', fontFamily: careerFont, fontSize: 13, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl', paddingVertical: 16 }}>
          עוד אין כאן אף אחד
        </Text>
      )}
    </View>
  );
}

const head = {
  color: '#8b939e',
  fontFamily: careerFont,
  fontSize: 11,
  fontWeight: '800' as const,
  textAlign: 'center' as const,
};

export function CommunityBoards({ boards, onOpenProfile }: { boards: BoardData; onOpenProfile?: (userId: string) => void }) {
  const { width } = useWindowDimensions();
  const sideBySide = width >= 980;
  return (
    <View>
      <View style={{ height: 128, marginHorizontal: -12, marginBottom: -100, overflow: 'hidden' }}>
        <Image
          source={require('@/assets/images/board-stadium.jpg')}
          resizeMode="cover"
          style={[
            { width: '100%', height: 128 },
            Platform.OS === 'web' ? ({ objectFit: 'cover', objectPosition: 'center 40%' } as ImageStyle) : null,
          ]}
        />
        <LinearGradient
          colors={['rgba(7,8,12,0.2)', 'rgba(7,8,12,0.45)', '#07080c']}
          locations={[0, 0.62, 1]}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
      </View>
      <View style={{ flexDirection: sideBySide ? 'row' : 'column', direction: 'rtl', gap: sideBySide ? 28 : 36, alignItems: 'stretch' }}>
        <Column title="הכי הרבה XP" color="#f7f8fa" icon={<HexMark />} valueLabel="XP" rows={boards.xp} onOpenProfile={onOpenProfile} />
        <Column title="פותרים" color="#5ee6a0" icon={<CheckMark />} valueLabel="פתרונות" rows={boards.solvers} mark="check" onOpenProfile={onOpenProfile} />
        <Column title="מפרגנים" color="#ff5d73" icon={<HeartMark />} valueLabel="אישורים" rows={boards.supporters} mark="heart" onOpenProfile={onOpenProfile} />
      </View>
    </View>
  );
}
