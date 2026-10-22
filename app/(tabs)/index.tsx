import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

import { AuthorNote } from '@/components/AuthorNote';
import { FutzBetaDownload } from '@/components/FutzBetaDownload';
import { LegalLinks } from '@/components/LegalLinks';
import { PlatformMark } from '@/components/PlatformPicker';
import { SquadPhoto } from '@/components/SquadPhoto';
import { useColumns } from '@/components/TileGrid';
import { Card, colors, Muted, Screen, Title } from '@/components/ui';
import { displayName } from '@/lib/labels';
import { HomeSbcOverview } from '@/components/HomeSbcOverview';
import { HomeSeason2Overview } from '@/components/HomeSeason2Overview';
import { useApp } from '@/lib/store';
import { useLanguage } from '@/lib/language';

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

function DoorButton({
  door,
  onPress,
}: {
  door: (typeof doors)[number];
  onPress: () => void;
}) {
  const { language, t } = useLanguage();
  const rtl = language === 'he';
  const label = t(door.label, door.href === '/career' ? 'Career' : door.href === '/ultimate' ? 'Ultimate Team' : door.href === '/champions' ? 'FUT Champions' : door.href === '/grounds' ? 'Grounds' : door.href === '/sbc' ? 'SBC' : 'Players');
  const hint = t(door.hint, door.href === '/career' ? 'Challenges and proof' : door.href === '/ultimate' ? 'Squads and packs' : door.href === '/champions' ? 'Your run, rewards and tactics' : door.href === '/grounds' ? 'Find a player' : door.href === '/sbc' ? 'Community solutions' : 'Cards and data');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#30404D',
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
        shadowColor: door.accent,
        shadowOpacity: 0,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      })}
    >
      <LinearGradient
        colors={['#080F18', '#080F18', '#080F18']}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ minHeight: 112, padding: 16, gap: 12, flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center' }}
      >
        <View style={{ flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
              shadowOpacity: 0,
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

        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Text style={{ color: '#F6F8FC', fontSize: 22, fontWeight: '900', textAlign: rtl ? 'right' : 'left' }}>{label}</Text>
          <Text style={{ color: 'rgba(220,230,240,0.72)', fontSize: 13, textAlign: rtl ? 'right' : 'left', fontWeight: '600' }}>
            {hint}
          </Text>
          <View
            style={{
              marginTop: 8,
              alignSelf: rtl ? 'flex-end' : 'flex-start',
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
  const { user, futPosts, profiles, likes } = useApp();
  const { language, t } = useLanguage();
  const rtl = language === 'he';
  const columns = useColumns(3, 1);
  const featured = futPosts.find((post) => post.kind === 'squad');
  const featuredLikes = featured ? likes.filter((like) => like.postId === featured.id).length : 0;


  return (
    <Screen scene="home">
      <View>
        <Text style={{ color: '#FD6502', fontSize: 13, fontWeight: '700', textAlign: rtl ? 'right' : 'left', letterSpacing: 1 }}>
          1 CLUB
        </Text>
        <Title>{t('מה משחקים היום?', 'What are we playing today?')}</Title>
        <Muted>{user ? t(`היי ${user.displayName}, הנה מה שחדש ומה שכדאי להספיק.`, `Hi ${user.displayName}, see what is new and what ends soon.`) : t('פתרונות SBC, שחקנים ואתגרי קריירה — מתחילים בלי חשבון.', 'SBC solutions, players and Career challenges — start without an account.')}</Muted>
      </View>
      <HomeSeason2Overview />
      <HomeSbcOverview />
      <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 14, textAlign: rtl ? 'right' : 'left' }}>{t('המגרשים שלכם', 'Your game modes')}</Text>
      <View style={{ flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr', flexWrap: 'wrap', gap: 12 }}>
        {doors.map((door) => (
          <View key={door.href} style={{ width: columns === 1 ? '100%' : `${100 / columns - 1}%`, minWidth: 0 }}>
            <View>
              <DoorButton door={door} onPress={() => router.push(door.href)} />
            </View>
          </View>
        ))}
      </View>
      {featured ? (
        <View>
          <Card onPress={() => router.push(`/ultimate/${featured.id}`)}>
            <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
              <PlatformMark id={featured.platform} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '700', textAlign: rtl ? 'right' : 'left' }}>{t('קבוצה מהקהילה', 'Community squad')}</Text>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', textAlign: rtl ? 'right' : 'left' }}>
                  {displayName(profiles, featured.userId)}
                </Text>
              </View>
            </View>
            <SquadPhoto uris={featured.imageUris} expandable={false} />
            <AuthorNote
              name={displayName(profiles, featured.userId)}
              body={featured.body}
              avatarUrl={profiles.find((profile) => profile.id === featured.userId)?.avatarUrl}
            />
            <Muted>{featuredLikes ? t(`${featuredLikes} לייקים`, `${featuredLikes} likes`) : t('עדיין בלי לייקים', 'No likes yet')}</Muted>
          </Card>
        </View>
      ) : null}
      <FutzBetaDownload />
      <View style={{ marginTop: 36, alignItems: 'center' }}>
        <LegalLinks />
      </View>
    </Screen>
  );
}
