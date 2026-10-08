import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

import { AuthorNote } from '@/components/AuthorNote';
import { FutzBetaDownload } from '@/components/FutzBetaDownload';
import { LegalLinks } from '@/components/LegalLinks';
import { PlatformMark } from '@/components/PlatformPicker';
import { SquadPhoto } from '@/components/SquadPhoto';
import { useColumns } from '@/components/TileGrid';
import { Card, colors, Muted, Screen, Title } from '@/components/ui';
import { PLAYERS } from '@/lib/fcPlayers';
import { displayName } from '@/lib/labels';
import { openChallenges } from '@/lib/selectors';
import { useApp } from '@/lib/store';

const doors: {
  href: '/career' | '/ultimate' | '/champions' | '/grounds' | '/sbc' | '/market';
  label: string;
  hint: string;
  accent: string;
  gradient: [string, string, string];
  logo?: ImageSourcePropType;
  icon?: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    href: '/career',
    label: 'קריירה',
    hint: 'אתגרים והוכחות',
    accent: '#8EC5FF',
    gradient: ['#081018', '#122638', '#1E4A6A'],
    logo: require('@/assets/images/door-career.png'),
  },
  {
    href: '/ultimate',
    label: 'אולטימייט',
    hint: 'קבוצות וחבילות',
    accent: '#E3B341',
    gradient: ['#0A0804', '#1C160A', '#3A2E12'],
    logo: require('@/assets/images/door-ultimate.png'),
  },
  {
    href: '/champions',
    label: 'FUT Champions',
    hint: 'תחרות, פרסים וטקטיקות',
    accent: '#F04A52',
    gradient: ['#16070A', '#3A0B12', '#6A1019'],
    icon: 'trophy',
  },
  {
    href: '/grounds',
    label: 'הגראונדס',
    hint: 'מחפשים שחקן',
    accent: '#7ED0C8',
    gradient: ['#070C12', '#12202A', '#1C3A48'],
    logo: require('@/assets/images/door-grounds.png'),
  },
  {
    href: '/sbc',
    label: 'SBC',
    hint: 'פתרונות קהילה',
    accent: '#E0915C',
    gradient: ['#0A0C12', '#161A24', '#242C3A'],
    logo: require('@/assets/images/door-sbc.png'),
  },
  {
    href: '/market',
    label: 'מרקט',
    hint: 'קלפים ונתונים',
    accent: '#F0D060',
    gradient: ['#080A10', '#121820', '#1C2838'],
    logo: require('@/assets/images/door-market.png'),
  },
];

function Rise({ index, children }: { index: number; children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const shift = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 480, delay: 80 + index * 70, useNativeDriver: true }),
      Animated.timing(shift, { toValue: 0, duration: 480, delay: 80 + index * 70, useNativeDriver: true }),
    ]).start();
  }, [index, opacity, shift]);
  return <Animated.View style={{ opacity, transform: [{ translateY: shift }] }}>{children}</Animated.View>;
}

function DoorButton({
  door,
  index,
  onPress,
}: {
  door: (typeof doors)[number];
  index: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: `${door.accent}55`,
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
        shadowColor: door.accent,
        shadowOpacity: 0.28,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      })}
    >
      <LinearGradient
        colors={door.gradient}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ minHeight: 168, padding: 14, justifyContent: 'space-between' }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.14)', 'transparent', 'transparent']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 0.7 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View style={{ flexDirection: 'row', direction: 'rtl', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1.5,
              borderColor: `${door.accent}88`,
              backgroundColor: '#06080C',
              shadowColor: door.accent,
              shadowOpacity: 0.45,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            {door.logo ? (
              <Image source={door.logo} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={door.icon ?? 'trophy'} size={32} color={door.accent} />
              </View>
            )}
          </View>
          <Text style={{ color: door.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 }}>
            {String(index + 1).padStart(2, '0')}
          </Text>
        </View>
        <View style={{ gap: 4 }}>
          <Text style={{ color: '#F6F8FC', fontSize: 22, fontWeight: '900', textAlign: 'right' }}>{door.label}</Text>
          <Text style={{ color: 'rgba(220,230,240,0.72)', fontSize: 13, textAlign: 'right', fontWeight: '600' }}>
            {door.hint}
          </Text>
          <View
            style={{
              marginTop: 8,
              alignSelf: 'flex-end',
              height: 3,
              width: 42,
              borderRadius: 2,
              backgroundColor: door.accent,
              opacity: 0.85,
            }}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, challenges, futPosts, grounds, profiles, likes } = useApp();
  const open = openChallenges(challenges);
  const columns = useColumns(5, 2);
  const featured = futPosts.find((post) => post.kind === 'squad');
  const featuredLikes = featured ? likes.filter((like) => like.postId === featured.id).length : 0;
  const stats = [
    { value: Number(PLAYERS.length).toLocaleString('en-US'), label: 'שחקנים' },
    { value: String(open.length), label: 'אתגרים פתוחים' },
    { value: String(grounds.length), label: 'מודעות' },
  ];

  return (
    <Screen scene="home">
      <Rise index={0}>
        <Text style={{ color: '#FD6502', fontSize: 13, fontWeight: '700', textAlign: 'right', letterSpacing: 1 }}>
          1 CLUB
        </Text>
        <Title>{user ? user.displayName : 'המגרש'}</Title>
        <Muted>הקהילה הישראלית ל־1 Club. אתר מעריצים עצמאי ולא קשור ל־EA.</Muted>
      </Rise>
      <Rise index={1}>
        <FutzBetaDownload />
      </Rise>
      <Rise index={2}>
        <View style={{ flexDirection: 'row', direction: 'rtl', gap: 8 }}>
          {stats.map((item) => (
            <View
              key={item.label}
              style={{
                flex: 1,
                minWidth: 0,
                backgroundColor: 'rgba(14, 18, 24, 0.82)',
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 6,
                borderWidth: 1,
                borderColor: 'rgba(227, 179, 65, 0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.65}
                style={{
                  color: colors.text,
                  fontSize: 22,
                  fontWeight: '800',
                  textAlign: 'center',
                  writingDirection: 'ltr',
                  width: '100%',
                }}
              >
                {item.value}
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={{
                  color: colors.muted,
                  fontSize: 12,
                  textAlign: 'center',
                  marginTop: 2,
                  width: '100%',
                }}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </Rise>
      <View style={{ flexDirection: 'row', direction: 'rtl', flexWrap: 'wrap', gap: 12 }}>
        {doors.map((door, index) => (
          <View key={door.href} style={{ width: `${100 / columns - 2}%`, flexGrow: 1, minWidth: columns === 5 ? 150 : '46%' }}>
            <Rise index={index + 3}>
              <DoorButton door={door} index={index} onPress={() => router.push(door.href)} />
            </Rise>
          </View>
        ))}
      </View>
      {featured ? (
        <Rise index={8}>
          <Card onPress={() => router.push(`/ultimate/${featured.id}`)}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
              <PlatformMark id={featured.platform} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '700', textAlign: 'right' }}>קבוצה מהקהילה</Text>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'right' }}>
                  {displayName(profiles, featured.userId)}
                </Text>
              </View>
            </View>
            <SquadPhoto uris={featured.imageUris} expandable={false} />
            <AuthorNote
              name={displayName(profiles, featured.userId)}
              body={featured.body}
              avatarUrl={profiles.find((profile) => profile.id === featured.userId)?.avatarUrl}
              userId={featured.userId}
            />
            <Muted>{featuredLikes ? `${featuredLikes} לייקים` : 'עדיין בלי לייקים'}</Muted>
          </Card>
        </Rise>
      ) : null}
      <View style={{ marginTop: 36, alignItems: 'center' }}>
        <LegalLinks />
      </View>
    </Screen>
  );
}
