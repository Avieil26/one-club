import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SiteNav } from '@/components/SiteNav';
import { divisionLabel, intentLabel, platformLabel, playerLevelTone } from '@/lib/labels';
import { GROUNDS_PLAYSTYLES } from '@/lib/groundsPlaystyles';
import { useApp } from '@/lib/store';
import type { GroundsIntent, GroundsPost, PlatformId, Profile } from '@/lib/types';
import { GROUNDS_PREVIEW_BACKGROUND } from '@/assets/groundsPreviewBackground';
import { useLanguage } from '@/lib/language';

const FILL = { position: 'absolute' as const, top: 0, right: 0, bottom: 0, left: 0 };

const C = {
  ink: '#F5F7F6', muted: '#A8B8C5', deep: '#050B12', panel: 'rgba(4,13,22,0.96)',
  line: 'rgba(75,211,222,0.30)', cyan: '#39DBE8', green: '#84F29A', gold: '#EDC66E',
};
const NAV = [
  { href: '/', label: 'בית' }, { href: '/career', label: 'קריירה' },
  { href: '/ultimate', label: 'אולטימייט' }, { href: '/grounds', label: 'גראונדס' },
  { href: '/sbc', label: 'SBC' }, { href: '/games', label: 'משחקונים' },
  { href: '/board', label: 'לוח' }, { href: '/market', label: 'שחקנים' },
] as const;
const POSITIONS = [
  { id: 'all', label: 'כל העמדות' }, { id: 'שוער', label: 'שוער' }, { id: 'חלוץ', label: 'חלוץ' },
  { id: 'כנף', label: 'כנף' }, { id: 'קשר התקפי', label: 'קשר התקפי' }, { id: 'קשר', label: 'קשר מרכזי' },
  { id: 'קשר הגנתי', label: 'קשר אחורי' }, { id: 'בלם', label: 'בלם' }, { id: 'מגן', label: 'מגן' },
] as const;
const PLATFORMS: { id: PlatformId | 'all'; label: string }[] = [
  { id: 'all', label: 'כל הפלטפורמות' }, { id: 'ps5', label: 'PlayStation 5' },
  { id: 'xbox', label: 'Xbox' }, { id: 'pc', label: 'PC' }, { id: 'switch2', label: 'Switch 2' },
];

function matchesPosition(value: string, selected: string) {
  if (selected === 'all') return true;
  const current = (value || '').trim().toLocaleLowerCase();
  const aliases: Record<string, string[]> = {
    'שוער': ['שוער', 'gk', 'goalkeeper', 'shot stopper'],
    'חלוץ': ['חלוץ', 'st', 'cf', 'striker', 'finisher', 'target'],
    'כנף': ['כנף', 'lw', 'rw', 'winger', 'spark'],
    'קשר התקפי': ['קשר התקפי', 'cam', 'attacking midfielder', 'creator', 'magician'],
    'קשר': ['קשר', 'cm', 'lm', 'rm', 'central midfielder', 'maestro'],
    'קשר הגנתי': ['קשר הגנתי', 'קשר אחורי', 'cdm', 'defensive midfielder', 'recycler', 'disruptor'],
    'בלם': ['בלם', 'cb', 'centre back', 'center back', 'boss'],
    'מגן': ['מגן', 'lb', 'rb', 'lwb', 'rwb', 'fullback'],
  };
  return (aliases[selected] || [selected]).some((item) => current === item || current.includes(item));
}
function positionLabel(value: string, language: 'he' | 'en' = 'he') {
  const labels: Record<string, string> = {
    GK: 'שוער', ST: 'חלוץ', CF: 'חלוץ', LW: 'כנף שמאל', RW: 'כנף ימין',
    CAM: 'קשר התקפי', CM: 'קשר מרכזי', CDM: 'קשר אחורי', LM: 'קשר שמאלי',
    RM: 'קשר ימני', LB: 'מגן שמאלי', RB: 'מגן ימני', CB: 'בלם',
  };
  if (language === 'en') {
    const en: Record<string, string> = { GK: 'Goalkeeper', ST: 'Striker', CF: 'Striker', LW: 'Left winger', RW: 'Right winger', CAM: 'Attacking midfielder', CM: 'Central midfielder', CDM: 'Defensive midfielder', LM: 'Left midfielder', RM: 'Right midfielder', LB: 'Left back', RB: 'Right back', CB: 'Centre back', 'שוער': 'Goalkeeper', 'חלוץ': 'Striker', 'כנף': 'Winger', 'קשר התקפי': 'Attacking midfielder', 'קשר מרכזי': 'Central midfielder', 'קשר אחורי': 'Defensive midfielder', 'בלם': 'Centre back', 'מגן': 'Full back' };
    return en[value] || value || 'Any position';
  }
  return labels[value] || value || 'כל עמדה';
}
function displayRegion(value: string, language: 'he' | 'en') {
  if (language === 'he') return value;
  const regions: Record<string, string> = {
    'צפון': 'North', 'שרון': 'Sharon', 'מרכז': 'Central',
    'ירושלים': 'Jerusalem', 'דרום': 'South', 'אונליין בלבד': 'Online only',
  };
  return regions[value] ?? value;
}
function displayPlatform(id: PlatformId, language: 'he' | 'en') {
  if (language === 'he') return platformLabel(id);
  const labels: Record<PlatformId, string> = { ps5: 'PlayStation 5', xbox: 'Xbox', pc: 'PC', switch2: 'Nintendo Switch 2' };
  return labels[id] || id;
}
function displayDivision(id: import('@/lib/types').DivisionId, language: 'he' | 'en') {
  if (language === 'he') return divisionLabel(id);
  const label = divisionLabel(id);
  if (label === 'אליט') return 'Elite';
  if (label.startsWith('חלוקה ')) return `Division ${label.slice('חלוקה '.length)}`;
  return label;
}
function displayIntent(intent: GroundsIntent, language: 'he' | 'en') {
  if (language === 'he') return intentLabel(intent);
  return intent === 'need_player' ? 'Need a player' : 'Looking for a club';
}
function displayArchetype(value: string, language: 'he' | 'en') {
  const parts = value.split('·').map((part) => part.trim());
  if (parts.length < 2) return value;
  return language === 'he' ? parts.slice(1).join(' · ') : parts[0];
}


function NavBar({ onNavigate, loggedIn }: { onNavigate: (href: string) => void; loggedIn: boolean }) {
  const { t, language, chooseLanguage } = useLanguage();
  return (
    <View style={s.navWrap}>
      <View style={[s.navInner, { direction: language === 'he' ? 'rtl' : 'ltr' }]}>
        <Pressable onPress={() => onNavigate('/')} style={s.brand}>
          <Image source={require('@/assets/images/brand-1club.png')} style={s.brandImage} />
          <View><Text style={s.brandName}>ONE CLUB</Text></View>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.navLinks}>
          {NAV.map((item) => (
            <Pressable key={item.href} onPress={() => onNavigate(item.href)} style={[s.navLink, item.href === '/grounds' && s.navLinkActive]}>
              <Text style={[s.navLinkText, item.href === '/grounds' && s.navLinkTextActive]}>{t(item.label, item.href === '/' ? 'Home' : item.href === '/career' ? 'Career' : item.href === '/ultimate' ? 'Ultimate Team' : item.href === '/grounds' ? 'The Grounds' : item.href === '/sbc' ? 'SBC' : item.href === '/games' ? 'Mini-games' : item.href === '/board' ? 'Community Board' : 'Players')}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={language === 'he' ? 'Switch language to English' : 'Switch language to Hebrew'}
          onPress={() => void chooseLanguage(language === 'he' ? 'en' : 'he')}
          style={[s.accountButton, { marginRight: 6 }]}
        >
          <Text style={s.accountText}>{language === 'he' ? 'EN' : 'עב'}</Text>
        </Pressable>
        <Pressable onPress={() => onNavigate(loggedIn ? '/profile' : '/register')} style={s.accountButton}>
          <Ionicons name={loggedIn ? 'person-circle-outline' : 'log-in-outline'} size={17} color={C.cyan} />
          <Text style={s.accountText}>{loggedIn ? t('הפרופיל שלי', 'My profile') : t('התחברות', 'Sign in')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
function Eyebrow({ children }: { children: string }) {
  return <View style={s.eyebrow}><View style={s.eyebrowDot} /><Text style={s.eyebrowText}>{children}</Text></View>;
}
function ActionButton({ label, icon, onPress, quiet = false }: {
  label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; quiet?: boolean;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.button, quiet && s.buttonQuiet, pressed && { opacity: 0.82 }]}>
      <Ionicons name={icon} size={17} color={quiet ? C.ink : '#041017'} />
      <Text style={[s.buttonText, quiet && { color: C.ink }]}>{label}</Text>
    </Pressable>
  );
}
function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.chip, active && s.chipActive, pressed && { opacity: 0.82 }]}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function PlayerCard({ post, profile, following, onOpen, onFollow, onMessage, onViewProfile }: {
  post: GroundsPost; profile?: Profile; following: boolean;
  onOpen: () => void; onFollow: () => void; onMessage: () => void; onViewProfile: () => void;
}) {
  const { t, language } = useLanguage();
  const tone = playerLevelTone(post.playerLevel);
  const avatar = post.avatarUri || profile?.avatarUrl || null;
  const name = profile?.displayName || post.gamertag || post.eaId || t('שחקן קהילה', 'Community player');
  const hasArchetype = Boolean(post.archetype && post.archetype !== 'לא צוין עדיין');
  const skillRating = post.skillRating;
  return (
    <View style={s.playerCard}>
      <Pressable onPress={onOpen} style={s.playerArt} accessibilityRole="button" accessibilityLabel={t('פתיחת פרופיל ', 'Open profile ') + name}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={FILL} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#103849', '#071522', '#030910']} style={FILL}>
            <View style={s.emptyAvatarMark}><Ionicons name="person-outline" size={56} color="rgba(57,219,232,0.72)" /></View>
            <View style={s.artGrid} />
          </LinearGradient>
        )}
        <LinearGradient colors={['rgba(2,9,15,0.03)', 'rgba(2,9,15,0.12)', 'rgba(2,9,15,0.94)']} locations={[0, 0.45, 1]} style={FILL} />
        <View style={s.cardTopLine}>
          <View style={s.livePill}><View style={s.greenDot} /><Text style={s.livePillText}>{displayIntent(post.intent, language)}</Text></View>
          {skillRating != null ? <View style={[s.ovrBadge, { borderColor: tone.bg, minWidth: 54 }]}><Text style={s.ovrTiny}>SKILL</Text><Text style={s.ovrValue}>{skillRating.toLocaleString()}</Text></View> : null}
        </View>
        <View style={s.cardPortraitBottom}>
          {hasArchetype ? <View style={[s.levelBadge, { borderColor: tone.bg, backgroundColor: tone.bg + '20' }]}>
            <Text style={s.levelNumber}>{String(post.playerLevel).padStart(2, '0')}</Text><Text style={s.levelLabel}>LEVEL</Text>
          </View> : null}
          <View style={s.playerNameWrap}><Text style={s.playerName} numberOfLines={1}>{name}</Text><Text style={s.playerHandle} numberOfLines={1}>{post.gamertag ? '@' + post.gamertag : '1 CLUB · ' + post.id.slice(0, 8).toUpperCase()}</Text></View>
        </View>
      </Pressable>
      <View style={s.cardBody}>
        <View style={s.cardHeadline}>
          <View style={s.platformBadge}><Ionicons name={post.platform === 'pc' ? 'desktop-outline' : 'game-controller-outline'} size={19} color={C.cyan} /></View>
          <View style={s.cardInfoMain}><Text style={s.cardPosition} numberOfLines={1}>{positionLabel(post.position, language)}</Text>{hasArchetype ? <Text style={s.cardMeta} numberOfLines={1}>{displayArchetype(post.archetype, language)}</Text> : null}</View>
        </View>
        <View style={s.cardTags}>
          <View style={s.smallTag}><Text style={s.smallTagText}>{displayDivision(post.division, language)}</Text></View>
          <View style={s.smallTag}><Text style={s.smallTagText}>{displayPlatform(post.platform, language)}</Text></View>
          {post.levelVerified ? <View style={[s.smallTag, s.verifiedTag]}><Ionicons name="shield-checkmark-outline" size={12} color={C.green} /><Text style={[s.smallTagText, { color: C.green }]}>{t('רמה מאומתת', 'Verified level')}</Text></View> : null}
        </View>
        <PlayStyleIcons selections={post.playStyles} />
        <View style={s.regionLine}><Ionicons name="location-outline" size={14} color={C.cyan} /><Text style={s.regionText}>{post.region ? displayRegion(post.region, language) : t('אזור לא צוין', 'Region not specified')}</Text></View>
        <View style={s.cardActions}>
          <Pressable onPress={onMessage} style={s.messageButton}><Ionicons name="chatbubble-ellipses-outline" size={15} color="#041017" /><Text style={s.messageButtonText}>{t('פנייה לשחקן', 'Message player')}</Text></Pressable>
          <Pressable onPress={onFollow} accessibilityLabel={following ? t('הפסק מעקב', 'Unfollow') : t('עקוב', 'Follow')} style={[s.followButton, following && s.followButtonOn]}><Ionicons name={following ? 'heart' : 'heart-outline'} size={17} color={following ? '#FF7396' : C.ink} /></Pressable>
          <Pressable onPress={onViewProfile} accessibilityRole="button" accessibilityLabel={t('פרופיל מלא', 'Full profile')} style={s.openButton}><Ionicons name="open-outline" size={17} color={C.ink} /></Pressable>
        </View>
      </View>
    </View>
  );
}

function PlayStyleIcons({ selections, labeled = false, limit = 5 }: {
  selections?: GroundsPost['playStyles']; labeled?: boolean; limit?: number;
}) {
  const selected = selections ?? [];
  if (!selected.length) return null;
  const visible = selected.slice(0, limit);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5, direction: 'rtl' }}>
      {visible.map((selection) => {
        const playStyle = GROUNDS_PLAYSTYLES.find((item) => item.id === selection.id);
        if (!playStyle) return null;
        const plus = selection.tier === 'plus';
        return (
          <View key={selection.id} accessibilityLabel={`${playStyle.name}${plus ? '+' : ''}`} style={{ minHeight: labeled ? 34 : 28, flexDirection: 'row', alignItems: 'center', gap: labeled ? 6 : 0, paddingHorizontal: labeled ? 7 : 3, borderWidth: 1, borderColor: plus ? 'rgba(237,198,110,0.58)' : 'rgba(177,199,210,0.35)', borderRadius: 5, backgroundColor: plus ? 'rgba(108,79,28,0.35)' : 'rgba(133,158,174,0.14)' }}>
            <Image source={playStyle.icon} resizeMode="contain" style={{ width: labeled ? 22 : 23, height: labeled ? 22 : 23, tintColor: C.gold }} />
            {labeled ? <Text style={{ color: plus ? C.gold : '#F0E7D0', fontSize: 10, fontWeight: '900' }}>{playStyle.name}{plus ? '+' : ''}</Text> : null}
            {!labeled && plus ? <Text style={{ color: C.gold, fontSize: 8, fontWeight: '900' }}>+</Text> : null}
          </View>
        );
      })}
      {selected.length > limit ? <Text style={{ color: C.muted, fontSize: 9, fontWeight: '800' }}>+{selected.length - limit}</Text> : null}
    </View>
  );
}

function InfoPanel({ title, icon, children, onTitlePress }: { title: string; icon: keyof typeof Ionicons.glyphMap; children: ReactNode; onTitlePress?: () => void }) {
  return (
    <View style={s.infoPanel}>
      <Pressable onPress={onTitlePress} disabled={!onTitlePress} accessibilityRole={onTitlePress ? "button" : undefined} style={s.panelTitleRow}><View style={s.panelIcon}><Ionicons name={icon} size={19} color={C.cyan} /></View><Text style={s.panelTitle}>{title}</Text>{onTitlePress ? <Ionicons name="chevron-back" size={15} color={C.cyan} /> : null}</Pressable>
      {children}
    </View>
  );
}

export default function GroundsV22Screen() {
  const app = useApp();
  const { t, language } = useLanguage();
  const rtl = language === 'he';
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [intent, setIntent] = useState<'all' | GroundsIntent>('all');
  const [platform, setPlatform] = useState<PlatformId | 'all'>('all');
  const [position, setPosition] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<GroundsPost | null>(null);
  const [notice, setNotice] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const searchInputRef = useRef<TextInput>(null);
  const filtersOffset = useRef(0);
  const compact = width < 760;

  // Local backend includes seeded demonstration entries. Do not display those as real community members.
  const posts = useMemo(() => app.mode === 'remote' ? [...app.grounds].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [], [app.mode, app.grounds]);
  const visiblePosts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return posts.filter((post) => {
      if (intent !== 'all' && post.intent !== intent) return false;
      if (platform !== 'all' && post.platform !== platform) return false;
      if (!matchesPosition(post.position, position)) return false;
      const profile = app.profiles.find((item) => item.id === post.userId);
      const haystack = [profile?.displayName, post.gamertag, post.eaId, post.position, post.archetype, post.region, platformLabel(post.platform), divisionLabel(post.division)]
        .filter(Boolean).join(' ').toLocaleLowerCase();
      return !query || haystack.includes(query);
    });
  }, [posts, intent, platform, position, search, app.profiles]);
  const recruiting = useMemo(() => posts.filter((post) => post.intent === 'need_player').slice(0, 3), [posts]);
  const profileFor = (post: GroundsPost) => app.profiles.find((profile) => profile.id === post.userId);
  const isFollowing = (userId: string) => app.follows.some((follow) => follow.followerId === app.user?.id && follow.followingId === userId);

  function navigate(href: string) { router.push(href as never); }
  function scrollToFilters() {
    setNotice('');
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Math.max(filtersOffset.current - 18, 0), animated: true }));
  }
  function searchPlayers() {
    setIntent('all');
    setNotice('');
    scrollToFilters();
    setTimeout(() => searchInputRef.current?.focus(), 350);
  }
  function findTeam() {
    setIntent('looking_for_club');
    setNotice('');
    scrollToFilters();
  }
  function showRecruiting() {
    setIntent('need_player');
    setNotice('');
    scrollToFilters();
  }
  async function toggleFollow(post: GroundsPost) {
    if (!app.user) { navigate('/register'); return; }
    if (post.userId === app.user.id) { setNotice(t('זה הפרופיל שלך — אי אפשר לעקוב אחרי עצמך.', 'This is your profile — you cannot follow yourself.')); return; }
    const wasFollowing = isFollowing(post.userId);
    try {
      await app.toggleFollow(post.userId);
      setNotice(wasFollowing ? t('המעקב הוסר.', 'Unfollowed.') : t('נוסף לרשימת המעקב.', 'Added to your following list.'));
    } catch {
      setNotice(t('לא הצלחנו לעדכן את המעקב. בדקו שאתם מחוברים ונסו שוב.', 'Could not update your follow list. Sign in and try again.'));
    }
  }
  function startMessage(post: GroundsPost) {
    if (!app.user) { navigate('/register'); return; }
    if (post.userId === app.user.id) { setNotice(t('זו המודעה שלך.', 'This is your own listing.')); return; }
    navigate('/grounds/chat/' + post.userId);
  }
  const selectedProfile = selected ? profileFor(selected) : undefined;
  const selectedAvatar = selected ? selected.avatarUri || selectedProfile?.avatarUrl || null : null;
  const selectedName = selected ? selectedProfile?.displayName || selected.gamertag || selected.eaId || t('שחקן קהילה', 'Community player') : '';

  return (
    <ImageBackground source={{ uri: GROUNDS_PREVIEW_BACKGROUND }} resizeMode="cover" imageStyle={s.pageBackgroundImage} style={[s.page, { direction: rtl ? 'rtl' : 'ltr' }, Platform.OS === 'web' ? { height, minHeight: height } : undefined]}>
      <LinearGradient colors={['rgba(2,8,15,0.02)', 'rgba(2,8,15,0.10)', 'rgba(2,8,15,0.26)']} locations={[0, 0.48, 1]} style={FILL} pointerEvents="none" />
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false, title: 'THE GROUNDS — ONE CLUB' }} />
      {Platform.OS !== 'web' || compact ? <SiteNav /> : <NavBar onNavigate={navigate} loggedIn={Boolean(app.user)} />}
      {notice ? <Pressable onPress={() => setNotice('')} style={s.noticeBar}><Ionicons name="information-circle-outline" size={18} color={C.cyan} /><Text style={s.noticeText}>{notice}</Text><Ionicons name="close" size={16} color={C.muted} /></Pressable> : null}

      <ScrollView ref={scrollRef} style={[s.scroll, Platform.OS === 'web' ? { minHeight: 0 } : undefined]} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={Platform.OS === 'web'} scrollEnabled={true}>
        <View style={s.shell}>
          <View style={[s.heroBackground, compact && s.heroBackgroundCompact]}>
            <LinearGradient colors={['rgba(2,8,15,0.00)', 'rgba(2,10,18,0.06)', 'rgba(2,8,15,0.24)']} locations={[0, 0.48, 1]} style={FILL} pointerEvents="none" />
            <View style={s.heroContent}>
              <View style={s.heroMetaRow}><View style={s.heroBadge}><View style={s.greenDot} /><Text style={s.heroBadgeText}>{t('קהילת שחקנים אמיתית', 'A real player community')}</Text></View><Text style={s.heroKicker}>FC 27 · ONE CLUB</Text></View>
              <View style={[s.heroMain, { flexDirection: 'column', alignItems: 'flex-start', gap: 14 }]}>
                <View style={[s.heroCopy, { width: '100%', maxWidth: 920, alignItems: 'flex-start', direction: rtl ? 'rtl' : 'ltr' }]}>
                  <Eyebrow>{t('FC 27 · קהילת מועדונים', 'FC 27 · Club community')}</Eyebrow>

                  <Text style={[s.heroHeadline, { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }, compact && { fontSize: 28, lineHeight: 36 }]}>{t('המגרש שלך. האנשים שלך.', 'Your pitch. Your people.')}</Text>
                  <Text style={[s.heroLead, { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }]}>{t('מוצאים שחקנים שמתאימים לסגנון שלכם, בונים קבוצה טובה יותר ונכנסים למשחק עם האנשים הנכונים.', 'Find players who match your style, build a stronger squad, and play with the right people.')}</Text>
                  <View style={[s.heroButtons, compact && { flexDirection: 'column', alignItems: 'stretch' }]}>
                    <ActionButton label={t('חפש שחקנים', 'Find players')} icon="search-outline" onPress={searchPlayers} />
                    <ActionButton label={t('פרסם פרופיל', 'Create profile')} icon="person-add-outline" onPress={() => navigate('/grounds/new')} quiet />
                  </View>
                </View>
              </View>
              <View style={[s.quickActions, compact && { flexDirection: 'column' }]}>
                <Pressable onPress={searchPlayers} style={s.quickCard}><View style={s.quickIcon}><Ionicons name="search-outline" size={21} color={C.cyan} /></View><View style={s.quickCopy}><Text style={[s.quickTitle, { textAlign: rtl ? 'right' : 'left' }]}>{t('חפש שחקנים', 'Find players')}</Text><Text style={[s.quickSub, { textAlign: rtl ? 'right' : 'left' }]}>{t('סנן לפי עמדה ופלטפורמה', 'Filter by position and platform')}</Text></View><Ionicons name="chevron-back" size={16} color={C.muted} /></Pressable>
                <Pressable onPress={findTeam} style={s.quickCard}><View style={s.quickIcon}><Ionicons name="people-outline" size={21} color={C.cyan} /></View><View style={s.quickCopy}><Text style={[s.quickTitle, { textAlign: rtl ? 'right' : 'left' }]}>{t('מצא קבוצה', 'Find a team')}</Text><Text style={[s.quickSub, { textAlign: rtl ? 'right' : 'left' }]}>{t('שחקנים שמחפשים מועדון', 'Players looking for a club')}</Text></View><Ionicons name="chevron-back" size={16} color={C.muted} /></Pressable>
                <Pressable onPress={() => navigate('/grounds/new')} style={s.quickCard}><View style={s.quickIcon}><Ionicons name="person-add-outline" size={21} color={C.cyan} /></View><View style={s.quickCopy}><Text style={[s.quickTitle, { textAlign: rtl ? 'right' : 'left' }]}>{t('פרסם גיוס', 'Post recruitment')}</Text><Text style={[s.quickSub, { textAlign: rtl ? 'right' : 'left' }]}>{t('הפרטים נשמרים במערכת', 'Your details are saved to the platform')}</Text></View><Ionicons name="chevron-back" size={16} color={C.muted} /></Pressable>
                <Pressable onPress={() => navigate('/grounds/challenges')} style={s.quickCard}><View style={s.quickIcon}><Ionicons name="trophy-outline" size={21} color={C.cyan} /></View><View style={s.quickCopy}><Text style={[s.quickTitle, { textAlign: rtl ? 'right' : 'left' }]}>{t('אתגרי הקהילה', 'Community challenges')}</Text><Text style={[s.quickSub, { textAlign: rtl ? 'right' : 'left' }]}>{t('אתגרי הקהילה בקרוב', 'Community challenges coming soon')}</Text></View><Ionicons name="chevron-back" size={16} color={C.muted} /></Pressable>
              </View>
            </View>
            <View style={s.heroFoot}><Text style={s.heroFootText}>{t('נבנה לקהילה', 'Built for the community')}</Text><View style={s.heroFootRule} /><Text style={s.heroFootText}>{t('לא שירות רשמי של EA', 'Not an official EA service')}</Text></View>
          </View>

          <View style={s.content}>
            <View style={[s.sectionHeader, compact && { alignItems: 'flex-start', flexDirection: 'column' }]}>
              <View style={[s.sectionCopy, { direction: rtl ? 'rtl' : 'ltr' }]}><Eyebrow>{t('רשת השחקנים', 'Player network')}</Eyebrow><Text style={[s.sectionTitle, { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }]}>{t('מצא את האנשים שלך.', 'Find your people.')}</Text><Text style={[s.sectionLead, { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }]}>{t('פרופילים שנשלחו על ידי שחקנים, התאמה לפי המשחק שאתם אוהבים ודרך פשוטה להתחיל לדבר.', 'Player-submitted profiles, matching by the game you love, and an easy way to start talking.')}</Text></View>
              <Pressable onPress={() => navigate('/grounds/new')} style={s.outlineButton}><Ionicons name="add" size={18} color={C.cyan} /><Text style={s.outlineButtonText}>{t('פרסם את פרופיל השחקן שלך', 'Publish your player profile')}</Text></Pressable>
            </View>

            <View style={s.filtersPanel} onLayout={(event) => { filtersOffset.current = event.nativeEvent.layout.y; }}>
              <View style={[s.filterHeading, compact && { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <View style={s.resultCounter}><View style={s.greenDot} /><Text style={s.resultCounterText}>{t('שחקנים מהקהילה', 'Community players')}</Text><Text style={s.resultCount}>{visiblePosts.length} {t('פרופילים', 'profiles')}</Text></View>
                <View style={s.searchBox}><Ionicons name="search-outline" size={18} color={C.muted} /><TextInput ref={searchInputRef} value={search} onChangeText={setSearch} placeholder={t('חיפוש שם, EA ID, אזור או סגנון...', 'Search name, EA ID, region or play style...')} placeholderTextColor="#7F93A0" style={[s.searchInput, { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }]} returnKeyType="search" accessibilityLabel={t('חיפוש פרופילים', 'Search profiles')} />{search ? <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={17} color={C.muted} /></Pressable> : null}</View>
              </View>
              <View style={s.filterGroup}><Text style={[s.filterLabel, { textAlign: rtl ? 'right' : 'left' }]}>{t('סוג מודעה', 'Listing type')}</Text><View style={s.chipRow}><Chip label={t('הכל', 'All')} active={intent === 'all'} onPress={() => setIntent('all')} /><Chip label={t('מחפש קבוצה', 'Looking for a club')} active={intent === 'looking_for_club'} onPress={() => setIntent('looking_for_club')} /><Chip label={t('גיוס שחקנים', 'Recruiting players')} active={intent === 'need_player'} onPress={() => setIntent('need_player')} /></View></View>
              <View style={s.filterGroup}><Text style={[s.filterLabel, { textAlign: rtl ? 'right' : 'left' }]}>{t('עמדה', 'Position')}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalChips}>{POSITIONS.map((item) => <Chip key={item.id} label={t(item.label, ({ all: 'All positions', 'שוער': 'Goalkeeper', 'חלוץ': 'Striker', 'כנף': 'Winger', 'קשר התקפי': 'Attacking midfielder', 'קשר': 'Central midfielder', 'קשר הגנתי': 'Defensive midfielder', 'בלם': 'Centre back', 'מגן': 'Full back' } as Record<string, string>)[item.id] || item.label)} active={position === item.id} onPress={() => setPosition(item.id)} />)}</ScrollView></View>
              <View style={s.filterGroup}><Text style={[s.filterLabel, { textAlign: rtl ? 'right' : 'left' }]}>{t('פלטפורמה', 'Platform')}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalChips}>{PLATFORMS.map((item) => <Chip key={item.id} label={t(item.label, item.id === 'all' ? 'All platforms' : displayPlatform(item.id, 'en'))} active={platform === item.id} onPress={() => setPlatform(item.id)} />)}</ScrollView></View>
            </View>

            <View style={s.playersSection}>
              <View style={[s.playersHeading, compact && { alignItems: 'flex-start', flexDirection: 'column' }]}><View style={s.playersHeadingCopy}><Text style={[s.playersTitle, { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }]}>{t('שחקנים מומלצים', 'Featured players')}</Text><Text style={[s.playersSubtitle, { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }]}>{t('מודעות אמיתיות בלבד · נתונים שלא נמסרו לא יוצגו', 'Real listings only · missing details are not displayed')}</Text></View><View style={s.sortPill}><Ionicons name="shield-checkmark-outline" size={14} color={C.green} /><Text style={s.sortPillText}>{t('פרופילים מהמערכת', 'Verified platform profiles')}</Text></View></View>
              {app.mode !== 'remote' ? (
                <View style={s.emptyState}><View style={s.emptyStateIcon}><Ionicons name="cloud-offline-outline" size={28} color={C.cyan} /></View><Text style={s.emptyStateTitle}>{t('הדגמות לא מוצגות כפרופילים אמיתיים', 'Demo data is not shown as real profiles')}</Text><Text style={s.emptyStateCopy}>{t('כשהחיבור למסד הנתונים פעיל, יוצגו כאן רק מודעות שנשמרו במערכת.', 'When the database connection is active, only saved community listings will appear here.')}</Text><ActionButton label={t('פרסם את הפרופיל שלך', 'Publish your profile')} icon="person-add-outline" onPress={() => navigate('/grounds/new')} /></View>
              ) : visiblePosts.length === 0 ? (
                <View style={s.emptyState}><View style={s.emptyStateIcon}><Ionicons name="people-outline" size={30} color={C.cyan} /></View><Text style={s.emptyStateTitle}>{posts.length ? t('לא נמצאו שחקנים לפי הסינון', 'No players match these filters') : t('עדיין אין פרופילים שפורסמו', 'No profiles have been published yet')}</Text><Text style={s.emptyStateCopy}>{posts.length ? t('שנו את החיפוש או את המסננים כדי לראות מודעות נוספות.', 'Change your search or filters to see more listings.') : t('היו הראשונים לפרסם את פרטי השחקן שלכם ולהופיע כאן בקהילה.', 'Be the first to publish your player details and appear in the community.')}</Text>{posts.length ? <ActionButton label={t('איפוס סינון', 'Reset filters')} icon="refresh-outline" onPress={() => { setIntent('all'); setPlatform('all'); setPosition('all'); setSearch(''); }} /> : <ActionButton label={t('פרסם את הפרופיל שלך', 'Publish your profile')} icon="person-add-outline" onPress={() => navigate('/grounds/new')} />}</View>
              ) : (
                <View style={[s.playerGrid, compact && { flexDirection: 'column' }]}>
                  {visiblePosts.map((post) => <View key={post.id} style={[s.playerGridItem, compact && { width: '100%' }, width >= 1100 && { width: '31.7%' }, width >= 1500 && { width: '23.8%' }]}><PlayerCard post={post} profile={profileFor(post)} following={isFollowing(post.userId)} onOpen={() => setSelected(post)} onFollow={() => void toggleFollow(post)} onMessage={() => startMessage(post)} onViewProfile={() => navigate('/player/' + post.userId)} /></View>)}
                </View>
              )}
            </View>

            <View style={[s.bottomGrid, compact && { flexDirection: 'column' }]}>
              <InfoPanel title={t('גיוס פעיל', 'Active recruitment')} icon="people-outline" onTitlePress={showRecruiting}>
                {recruiting.length ? recruiting.map((post) => {
                  const owner = profileFor(post);
                  return <Pressable key={post.id} onPress={() => setSelected(post)} style={s.recruitRow}><View style={s.recruitCrest}><Ionicons name="shield-outline" size={21} color={C.gold} /></View><View style={s.recruitCopy}><Text style={s.recruitName} numberOfLines={1}>{owner?.displayName || post.gamertag || t('שחקן מהקהילה', 'Community player')}</Text><Text style={s.recruitSub} numberOfLines={2}>{positionLabel(post.position, language)} · {displayDivision(post.division, language)} · {displayPlatform(post.platform, language)}</Text><Text style={s.recruitSub}>{post.region ? displayRegion(post.region, language) : t('אזור לא צוין', 'Region not specified')}</Text></View><Ionicons name="chevron-back" size={17} color={C.cyan} /></Pressable>;
                }) : <Text style={s.panelEmpty}>{t('אין כרגע מודעות גיוס אמיתיות. אפשר לפרסם מודעה חדשה.', 'There are no active recruitment listings yet. You can post one.')}</Text>}
                <Pressable onPress={showRecruiting} style={s.panelCta}><Text style={s.panelCtaText}>{t('צפה בכל הגיוסים', 'View all recruitment')}</Text><Ionicons name="open-outline" size={15} color={C.cyan} /></Pressable>
              </InfoPanel>
              <InfoPanel title={t('מועדונים מובילים', 'Top clubs')} icon="podium-outline"><View style={s.placeholderBox}><Ionicons name="stats-chart-outline" size={25} color={C.muted} /><Text style={s.placeholderTitle}>{t('הדירוג עדיין לא זמין', 'Rankings are not available yet')}</Text><Text style={s.panelEmpty}>{t('לא נציג נקודות או שמות מועדונים מדומים. הדירוג יופעל כשיהיו נתוני מועדונים אמיתיים.', 'We will not show fake scores or club names. Rankings will launch when real club data is available.')}</Text></View></InfoPanel>
              <InfoPanel title={t('האתגרים האחרונים', 'Latest challenges')} icon="trophy-outline"><View style={s.placeholderBox}><Ionicons name="flag-outline" size={25} color={C.muted} /><Text style={s.placeholderTitle}>{t('אתגרי הקהילה בדרך', 'Community challenges are coming')}</Text><Text style={s.panelEmpty}>{t('אתגרים ותגמולים יוצגו כאן רק אחרי חיבור למקור נתונים פעיל.', 'Challenges and rewards will appear here once a live data source is connected.')}</Text></View></InfoPanel>
              <InfoPanel title={t('הפרופיל שלי', 'My profile')} icon="person-circle-outline">
                {app.user ? <><Text style={s.myProfileName}>{app.user.displayName}</Text><View style={s.myStatsRow}><View style={s.myStat}><Text style={s.myStatValue}>{posts.filter((post) => post.userId === app.user?.id).length}</Text><Text style={s.myStatLabel}>{t('מודעות שלי', 'My listings')}</Text></View><View style={s.myStat}><Text style={s.myStatValue}>{app.user.approvedCount}</Text><Text style={s.myStatLabel}>{t('פרסומים מאושרים', 'Approved posts')}</Text></View><View style={s.myStat}><Text style={s.myStatValue}>{app.user.reputation}</Text><Text style={s.myStatLabel}>{t('מוניטין', 'Reputation')}</Text></View></View><Pressable onPress={() => navigate('/profile')} style={s.panelCta}><Text style={s.panelCtaText}>{t('ניהול הפרופיל', 'Manage profile')}</Text><Ionicons name="open-outline" size={15} color={C.cyan} /></Pressable></> : <><Text style={s.panelEmpty}>{t('התחברו כדי לפרסם מודעה, לעקוב אחרי שחקנים ולשלוח הודעות מתוך האפליקציה.', 'Sign in to post a listing, follow players, and send messages.')}</Text><Pressable onPress={() => navigate('/register')} style={s.panelCta}><Text style={s.panelCtaText}>{t('התחברות / הרשמה', 'Sign in / Register')}</Text><Ionicons name="open-outline" size={15} color={C.cyan} /></Pressable></>}
              </InfoPanel>
            </View>
            <View style={s.footerNote}><View style={s.greenDot} /><Text style={s.footerNoteText}>{t('THE GROUNDS · קהילה עצמאית לשחקני FC 27', 'THE GROUNDS · Independent FC 27 community')}</Text></View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={Boolean(selected)} animationType="fade" transparent onRequestClose={() => setSelected(null)}>
        <View style={s.modalBackdrop}>
          <View style={[s.profileModal, compact && { width: '100%', maxHeight: '94%' }]}>
            <View style={[s.modalTopbar, { direction: rtl ? 'rtl' : 'ltr' }]}><View><Text style={s.modalKicker}>ONE CLUB / THE GROUNDS</Text><Text style={s.modalTitle}>{t('פרופיל שחקן', 'Player profile')}</Text></View><Pressable onPress={() => setSelected(null)} style={s.closeButton} accessibilityLabel={t('סגירת הפרופיל', 'Close profile')}><Ionicons name="close" size={21} color={C.ink} /></Pressable></View>
            {selected ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.modalContent}>
              <View style={[s.modalHero, compact && { flexDirection: 'column' }]}>
                <View style={s.modalAvatar}>{selectedAvatar ? <Image source={{ uri: selectedAvatar }} style={FILL} resizeMode="cover" /> : <Ionicons name="person-outline" size={64} color={C.cyan} />}{selected.archetype && selected.archetype !== 'לא צוין עדיין' ? <View style={s.modalLevel}><Text style={s.modalLevelNumber}>{selected.playerLevel}</Text><Text style={s.modalLevelLabel}>LEVEL</Text></View> : null}</View>
                <View style={s.modalIntro}><Eyebrow>{displayIntent(selected.intent, language)}</Eyebrow><Text style={s.modalPlayerName}>{selectedName}</Text><Text style={s.modalHandle}>{selected.gamertag ? '@' + selected.gamertag : selected.eaId || t('שם משתמש לא נמסר', 'Username not provided')}</Text><Text style={s.modalDescription}>{selected.archetype && selected.archetype !== 'לא צוין עדיין' ? `${displayArchetype(selected.archetype, language)} · ` : ''}{positionLabel(selected.position, language)}</Text><Text style={s.modalDescription}>{displayPlatform(selected.platform, language)} · {displayDivision(selected.division, language)}</Text></View>
              </View>
              <View style={s.detailsGrid}>
                <View style={s.detailTile}><Text style={s.detailLabel}>{t('אזור', 'Region')}</Text><Text style={s.detailValue}>{selected.region ? displayRegion(selected.region, language) : t('לא נמסר', 'Not provided')}</Text></View>
                <View style={s.detailTile}><Text style={s.detailLabel}>EA ID</Text><Text style={s.detailValue}>{selected.eaId || t('לא נמסר', 'Not provided')}</Text></View>
                {selected.archetype && selected.archetype !== 'לא צוין עדיין' ? <View style={s.detailTile}><Text style={s.detailLabel}>{t('רמת ארכיטיפ', 'Archetype level')}</Text><Text style={s.detailValue}>{selected.playerLevel} / 50</Text></View> : null}
                <View style={s.detailTile}><Text style={s.detailLabel}>Skill Rating</Text><Text style={s.detailValue}>{selected.skillRating != null ? selected.skillRating.toLocaleString() : t('לא נמסר', 'Not provided')}</Text></View>
                <View style={s.detailTile}><Text style={s.detailLabel}>{t('אימות רמה', 'Level verification')}</Text><Text style={s.detailValue}>{selected.levelVerified ? t('מאומתת', 'Verified') : t('דיווח עצמי', 'Self-reported')}</Text></View>
              </View>
              <View style={{ gap: 8 }}><Text style={s.detailLabel}>PlayStyles</Text><PlayStyleIcons selections={selected.playStyles} labeled limit={36} /></View>
              <View style={s.modalActions}><ActionButton label={t('לפרופיל המלא', 'Full profile')} icon="person-circle-outline" onPress={() => { const userId = selected.userId; setSelected(null); navigate('/player/' + userId); }} /><ActionButton label={t('שליחת הודעה', 'Send message')} icon="chatbubble-ellipses-outline" onPress={() => { const post = selected; setSelected(null); startMessage(post); }} /><ActionButton label={isFollowing(selected.userId) ? t('הפסק מעקב', 'Unfollow') : t('עקוב אחרי השחקן', 'Follow player')} icon="heart-outline" quiet onPress={() => void toggleFollow(selected)} /></View>
              {!app.user ? <Text style={s.modalAuthNote}>{t('לשליחת הודעה או למעקב צריך להתחבר למערכת.', 'Sign in to message or follow players.')}</Text> : null}
            </ScrollView> : null}
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, minHeight: '100%', backgroundColor: C.deep, direction: 'rtl' },
  pageBackgroundImage: { opacity: 0.92 },
  scroll: { flex: 1 }, scrollContent: { flexGrow: 1, paddingBottom: 48 },
  navWrap: { zIndex: 20, backgroundColor: 'rgba(2,8,15,0.98)', borderBottomWidth: 1, borderBottomColor: C.line, paddingHorizontal: 18, paddingVertical: 10 },
  navInner: { width: '100%', maxWidth: 1536, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 14, direction: 'rtl' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  brandImage: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(57,219,232,0.45)' },
  brandName: { color: C.ink, fontSize: 14, fontWeight: '900', letterSpacing: 1, writingDirection: 'ltr' },
  brandSub: { color: C.cyan, fontSize: 8, fontWeight: '900', letterSpacing: 2 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 3, flexGrow: 1, flexShrink: 1, direction: 'rtl' },
  navLink: { borderRadius: 6, borderWidth: 1, borderColor: 'transparent', paddingHorizontal: 9, paddingVertical: 8 },
  navLinkActive: { borderColor: 'rgba(57,219,232,0.42)', backgroundColor: 'transparent' },
  navLinkText: { color: '#E4EBEF', fontSize: 12, fontWeight: '800' },
  navLinkTextActive: { color: '#FFFFFF', fontWeight: '900' },
  accountButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.line, borderRadius: 7, backgroundColor: 'rgba(5,23,33,0.94)', paddingHorizontal: 11, paddingVertical: 8, flexShrink: 0 },
  accountText: { color: C.ink, fontSize: 12, fontWeight: '800' },
  noticeBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: 'rgba(4,23,34,0.96)', borderBottomWidth: 1, borderBottomColor: C.line },
  noticeText: { color: C.ink, fontSize: 12, textAlign: 'center', flexShrink: 1 },
  shell: { width: '100%', maxWidth: 1536, alignSelf: 'center', paddingHorizontal: 0 },
  heroBackground: { minHeight: 500, borderRadius: 0, overflow: 'hidden', borderWidth: 0, marginTop: 0, backgroundColor: 'rgba(3,12,21,0.06)' },
  heroBackgroundCompact: { minHeight: 600 },
  heroContent: { paddingHorizontal: 30, paddingTop: 25, paddingBottom: 28, gap: 22 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, direction: 'rtl' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(132,242,154,0.34)', backgroundColor: 'rgba(2,21,23,0.83)', paddingHorizontal: 10, paddingVertical: 6 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green, shadowColor: C.green, shadowOpacity: 0.6, shadowRadius: 5 },
  heroBadgeText: { color: C.green, fontSize: 10, fontWeight: '800' }, heroKicker: { color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  heroMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 28, direction: 'rtl' },
  heroCopy: { flex: 1, maxWidth: 920, gap: 13, alignItems: 'flex-start', direction: 'rtl' },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, eyebrowDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.cyan },
  eyebrowText: { color: C.cyan, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  heroHeadline: { color: C.ink, fontSize: 30, lineHeight: 38, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  heroLead: { maxWidth: 550, color: '#E5EDF1', fontSize: 14, lineHeight: 23, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' },
  heroButtons: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5, flexWrap: 'wrap' },
  button: { minHeight: 43, borderRadius: 7, borderWidth: 1, borderColor: C.cyan, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.cyan },
  buttonQuiet: { backgroundColor: 'rgba(2,13,23,0.8)', borderColor: 'rgba(113,195,213,0.48)' },
  buttonText: { color: '#041017', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  heroWordmark: { flex: 1, alignItems: 'flex-end', justifyContent: 'center', gap: 8, minWidth: 230 },
  wordmarkOverline: { color: C.green, fontSize: 11, fontWeight: '900', letterSpacing: 3 },
  wordmark: { color: C.ink, fontSize: 78, lineHeight: 84, fontWeight: '900', letterSpacing: -2.6, textAlign: 'right', writingDirection: 'ltr', textShadowColor: 'rgba(0,0,0,0.50)', textShadowOffset: { width: 0, height: 5 }, textShadowRadius: 22 },
  wordmarkRule: { height: 2, width: 155, backgroundColor: C.cyan, shadowColor: C.cyan, shadowOpacity: 0.8, shadowRadius: 9 },
  wordmarkCaption: { color: C.muted, fontSize: 12, fontWeight: '700' },
  quickActions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  quickCard: { flex: 1, minWidth: 205, flexDirection: 'row', alignItems: 'center', gap: 10, direction: 'rtl', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(75,211,222,0.32)', backgroundColor: 'rgba(2,10,18,0.90)', paddingHorizontal: 12, paddingVertical: 12 },
  quickIcon: { width: 36, height: 36, borderWidth: 1, borderColor: 'rgba(57,219,232,0.36)', borderRadius: 7, backgroundColor: 'rgba(13,52,64,0.50)', alignItems: 'center', justifyContent: 'center' },
  quickCopy: { flex: 1, gap: 4 }, quickTitle: { color: C.ink, fontSize: 12, fontWeight: '900', textAlign: 'right' },
  quickSub: { color: C.muted, fontSize: 10, lineHeight: 14, textAlign: 'right' },
  heroFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'rgba(2,8,15,0.72)', paddingVertical: 9, borderTopWidth: 1, borderTopColor: 'rgba(75,211,222,0.22)' },
  heroFootText: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }, heroFootRule: { height: 12, width: 1, backgroundColor: C.line },
  content: { paddingHorizontal: 18, paddingTop: 34 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 19, direction: 'rtl' },
  sectionCopy: { flex: 1, gap: 8, alignItems: 'flex-start', direction: 'rtl' },
  sectionTitle: { width: '100%', color: C.ink, fontSize: 28, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', alignSelf: 'stretch' },
  sectionLead: { width: '100%', color: C.muted, fontSize: 12, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl', maxWidth: 740, alignSelf: 'stretch' },
  outlineButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: 'rgba(57,219,232,0.48)', backgroundColor: 'rgba(4,23,33,0.84)', borderRadius: 6, paddingHorizontal: 13, paddingVertical: 11 },
  outlineButtonText: { color: C.ink, fontSize: 11, fontWeight: '800' },
  filtersPanel: { borderWidth: 1, borderColor: 'rgba(75,211,222,0.32)', borderRadius: 9, backgroundColor: C.panel, padding: 15, gap: 15, marginBottom: 23 },
  filterHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, direction: 'rtl' },
  resultCounter: { flexDirection: 'row', alignItems: 'center', gap: 8 }, resultCounterText: { color: C.ink, fontSize: 12, fontWeight: '900' },
  resultCount: { color: C.cyan, fontSize: 10, fontWeight: '800', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, backgroundColor: 'rgba(57,219,232,0.10)' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 9, direction: 'rtl', width: '100%', maxWidth: 430, borderWidth: 1, borderColor: 'rgba(113,195,213,0.38)', borderRadius: 6, backgroundColor: 'rgba(1,9,16,0.94)', paddingHorizontal: 11, paddingVertical: 2, minHeight: 39 },
  searchInput: { flex: 1, color: C.ink, fontSize: 12, textAlign: 'right', writingDirection: 'rtl', paddingVertical: 8 },
  filterGroup: { gap: 8, alignItems: 'flex-start', direction: 'rtl' }, filterLabel: { color: C.muted, fontSize: 10, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', alignSelf: 'stretch' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, horizontalChips: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  chip: { borderWidth: 1, borderColor: 'rgba(104,160,182,0.32)', backgroundColor: 'rgba(6,18,28,0.88)', borderRadius: 5, paddingHorizontal: 10, paddingVertical: 7, alignItems: 'center', justifyContent: 'center' },
  chipActive: { borderColor: C.cyan, backgroundColor: 'rgba(17,66,76,0.75)' }, chipText: { color: '#E4EBEF', fontSize: 11, fontWeight: '800' }, chipTextActive: { color: '#FFFFFF', fontWeight: '900' },
  playersSection: { gap: 14 },
  playersHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, direction: 'rtl' },
  playersHeadingCopy: { flex: 1, alignItems: 'flex-start', direction: 'rtl' }, playersTitle: { width: '100%', color: C.ink, fontSize: 20, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', alignSelf: 'stretch' }, playersSubtitle: { width: '100%', color: C.muted, fontSize: 11, marginTop: 5, textAlign: 'right', writingDirection: 'rtl', alignSelf: 'stretch' },
  sortPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(132,242,154,0.26)', backgroundColor: 'rgba(8,38,30,0.6)', borderRadius: 5, paddingHorizontal: 9, paddingVertical: 6 },
  sortPillText: { color: C.green, fontSize: 9, fontWeight: '900' },
  playerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 13, direction: 'rtl' }, playerGridItem: { width: '48.8%', minWidth: 0, maxWidth: '100%' },
  playerCard: { minHeight: 390, borderWidth: 1, borderColor: 'rgba(72,187,211,0.45)', borderRadius: 9, overflow: 'hidden', backgroundColor: 'rgba(3,11,19,0.98)', shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12 },
  playerArt: { height: 225, position: 'relative', overflow: 'hidden', backgroundColor: '#05111B' }, emptyAvatarMark: { flex: 1, alignItems: 'center', justifyContent: 'center' }, artGrid: { ...StyleSheet.absoluteFill, borderTopWidth: 1, borderColor: 'rgba(57,219,232,0.12)' },
  cardTopLine: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(132,242,154,0.27)', paddingHorizontal: 7, paddingVertical: 5, backgroundColor: 'rgba(2,11,17,0.84)' },
  livePillText: { color: C.green, fontSize: 9, fontWeight: '800' },
  ovrBadge: { minWidth: 42, borderWidth: 1, borderRadius: 7, paddingHorizontal: 5, paddingVertical: 3, alignItems: 'center', backgroundColor: 'rgba(2,9,15,0.86)' },
  ovrTiny: { color: C.muted, fontSize: 8, fontWeight: '900' }, ovrValue: { color: C.ink, fontSize: 15, fontWeight: '900' },
  cardPortraitBottom: { position: 'absolute', bottom: 11, left: 11, right: 11, flexDirection: 'row', alignItems: 'flex-end', gap: 9, direction: 'rtl' },
  levelBadge: { minWidth: 48, paddingHorizontal: 7, paddingVertical: 6, borderWidth: 1, borderRadius: 6, alignItems: 'center' },
  levelNumber: { color: C.ink, fontSize: 20, fontWeight: '900' }, levelLabel: { color: C.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  playerNameWrap: { flex: 1, alignItems: 'flex-start', gap: 3 }, playerName: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' }, playerHandle: { color: '#E1E8EC', fontSize: 10, fontWeight: '800' },
  cardBody: { padding: 12, gap: 10, flex: 1 }, cardHeadline: { flexDirection: 'row', alignItems: 'center', gap: 9, direction: 'rtl' },
  platformBadge: { width: 36, height: 36, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(57,219,232,0.36)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,47,59,0.4)' },
  cardInfoMain: { flex: 1, alignItems: 'flex-end', gap: 4, direction: 'rtl' }, cardPosition: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', textAlign: 'right' }, cardMeta: { color: '#E0E8EC', fontSize: 11, fontWeight: '800', textAlign: 'right' },
  cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 }, smallTag: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(151,177,190,0.34)', borderRadius: 4, backgroundColor: 'rgba(5,13,20,0.95)', paddingHorizontal: 7, paddingVertical: 5 },
  verifiedTag: { borderColor: 'rgba(132,242,154,0.4)', backgroundColor: 'rgba(10,38,28,0.72)' }, smallTagText: { color: '#F0F4F6', fontSize: 10, fontWeight: '800' },
  regionLine: { flexDirection: 'row', alignItems: 'center', gap: 5 }, regionText: { color: '#E1E8EC', fontSize: 11, fontWeight: '700', textAlign: 'right' },
  cardActions: { marginTop: 'auto', flexDirection: 'row', gap: 6, paddingTop: 3 },
  messageButton: { flex: 1, minHeight: 34, borderRadius: 5, backgroundColor: C.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 7 },
  messageButtonText: { color: '#041017', fontSize: 10, fontWeight: '900' },
  followButton: { width: 35, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1, borderColor: 'rgba(115,160,183,0.4)', backgroundColor: 'rgba(2,11,18,0.9)' },
  followButtonOn: { borderColor: '#FF7396', backgroundColor: 'rgba(90,15,40,0.3)' }, openButton: { width: 35, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1, borderColor: 'rgba(115,160,183,0.4)', backgroundColor: 'rgba(2,11,18,0.9)' },
  emptyState: { alignItems: 'center', justifyContent: 'center', gap: 11, paddingHorizontal: 24, paddingVertical: 42, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(75,211,222,0.40)', borderRadius: 10, backgroundColor: 'rgba(4,13,22,0.90)' },
  emptyStateIcon: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: C.line, backgroundColor: 'rgba(14,52,65,0.5)', alignItems: 'center', justifyContent: 'center' },
  emptyStateTitle: { color: C.ink, fontSize: 16, fontWeight: '900', textAlign: 'center' }, emptyStateCopy: { color: C.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', maxWidth: 520 },
  bottomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 13, marginTop: 30, alignItems: 'stretch' },
  infoPanel: { flex: 1, minWidth: 250, borderWidth: 1, borderColor: 'rgba(70,165,203,0.4)', borderRadius: 9, padding: 13, backgroundColor: 'rgba(3,12,20,0.985)', gap: 12 },
  panelTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 9, borderBottomWidth: 1, borderBottomColor: 'rgba(80,165,192,0.2)', direction: 'rtl' },
  panelIcon: { width: 32, height: 32, borderRadius: 6, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11,48,62,0.48)' },
  panelTitle: { flex: 1, color: C.ink, fontSize: 13, fontWeight: '900', textAlign: 'right' },
  recruitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7, direction: 'rtl', borderBottomWidth: 1, borderBottomColor: 'rgba(80,165,192,0.12)' },
  recruitCrest: { width: 37, height: 40, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(237,198,110,0.5)', backgroundColor: 'rgba(78,58,18,0.28)', alignItems: 'center', justifyContent: 'center' },
  recruitCopy: { flex: 1, gap: 4 }, recruitName: { color: C.ink, fontSize: 11, fontWeight: '900', textAlign: 'right' }, recruitSub: { color: C.muted, fontSize: 9, textAlign: 'right' },
  panelEmpty: { color: C.muted, fontSize: 11, lineHeight: 18, textAlign: 'right' },
  panelCta: { minHeight: 31, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(57,219,232,0.38)', backgroundColor: 'rgba(7,28,40,0.86)', paddingHorizontal: 9, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto' },
  panelCtaText: { color: '#AEEEF4', fontSize: 10, fontWeight: '900' },
  placeholderBox: { flex: 1, minHeight: 125, alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10 }, placeholderTitle: { color: C.ink, fontSize: 11, fontWeight: '900', textAlign: 'center' },
  myProfileName: { color: C.ink, fontSize: 16, fontWeight: '900', textAlign: 'right' }, myStatsRow: { flexDirection: 'row', gap: 6, marginVertical: 4 },
  myStat: { flex: 1, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(75,211,222,0.2)', backgroundColor: 'rgba(10,32,43,0.66)', paddingVertical: 9, alignItems: 'center', gap: 4 },
  myStatValue: { color: C.cyan, fontSize: 16, fontWeight: '900' }, myStatLabel: { color: C.muted, fontSize: 8, textAlign: 'center' },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 24, paddingVertical: 14, borderTopWidth: 1, borderTopColor: 'rgba(75,211,222,0.18)' }, footerNoteText: { color: C.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,5,10,0.82)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  profileModal: { width: '100%', maxWidth: 900, maxHeight: '90%', borderWidth: 1, borderColor: 'rgba(68,205,221,0.47)', borderRadius: 13, backgroundColor: '#04111C', overflow: 'hidden' },
  modalTopbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 18, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: 'rgba(83,172,202,0.2)', backgroundColor: 'rgba(31,86,109,0.13)' },
  modalKicker: { color: C.cyan, fontSize: 9, fontWeight: '900', letterSpacing: 1 }, modalTitle: { color: C.ink, fontSize: 16, fontWeight: '900', marginTop: 3 },
  closeButton: { width: 35, height: 35, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(140,187,207,0.28)', backgroundColor: 'rgba(9,27,39,0.9)', alignItems: 'center', justifyContent: 'center' },
  modalContent: { padding: 18, gap: 16 }, modalHero: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  modalAvatar: { width: 150, height: 175, borderRadius: 8, borderWidth: 1, borderColor: C.line, backgroundColor: 'rgba(14,52,65,0.5)', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  modalLevel: { position: 'absolute', bottom: 8, left: 8, borderWidth: 1, borderColor: C.cyan, borderRadius: 5, backgroundColor: 'rgba(2,9,15,0.90)', paddingHorizontal: 8, paddingVertical: 5, alignItems: 'center' },
  modalLevelNumber: { color: C.cyan, fontSize: 19, fontWeight: '900' }, modalLevelLabel: { color: C.muted, fontSize: 8, fontWeight: '900' },
  modalIntro: { flex: 1, gap: 9, alignItems: 'flex-start' }, modalPlayerName: { color: C.ink, fontSize: 25, fontWeight: '900', textAlign: 'right' },
  modalHandle: { color: C.cyan, fontSize: 13, fontWeight: '800' }, modalDescription: { color: C.muted, fontSize: 12, textAlign: 'right' },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, detailTile: { flexBasis: '48%', flexGrow: 1, minWidth: 140, borderWidth: 1, borderColor: 'rgba(103,170,198,0.23)', backgroundColor: 'rgba(14,34,47,0.62)', borderRadius: 7, padding: 11, gap: 6 },
  detailLabel: { color: C.muted, fontSize: 10, fontWeight: '800', textAlign: 'right' }, detailValue: { color: C.ink, fontSize: 13, fontWeight: '800', textAlign: 'right' },
  modalActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, modalAuthNote: { color: C.muted, fontSize: 10, textAlign: 'right' },
});
