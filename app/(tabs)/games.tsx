import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Platform, Pressable, Text, View, type ImageStyle } from 'react-native';

import { Screen } from '@/components/ui';
import { careerFont } from '@/lib/careerCardTheme';
import { portraitByEnglish } from '@/lib/clubQuiz';

const CREAM = '#F6F1E4';
const GOLD = '#E8C46A';
const INK = '#2A0A12';

function face(position: string): ImageStyle | null {
  if (Platform.OS !== 'web') return null;
  return { objectFit: 'cover', objectPosition: position } as ImageStyle;
}

export default function GamesScreen() {
  const router = useRouter();
  const saka = portraitByEnglish('Bukayo Saka');
  const faces = ['Lamine Yamal', 'Erling Haaland', 'Bukayo Saka', 'Pedri']
    .map((name) => portraitByEnglish(name))
    .filter((photo): photo is string => Boolean(photo));

  return (
    <Screen scene="games" maxWidth={460}>
      <View style={styles.stack}>
      <Text style={styles.eyebrow}>משחקים קצרים</Text>
      <Text style={styles.title}>משחקונים</Text>
      <Text style={styles.lead}>ארבעה משחקים על הקלפים שבמאגר.</Text>

      <Pressable accessibilityRole="button" onPress={() => router.push('/games/who')}>
        <LinearGradient colors={['#ff8a1e', '#ff2f78', '#6a22d6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.who}>
          <Text style={styles.whoKicker}>סימון</Text>
          <Text style={styles.whoTitle}>נחש מי</Text>
          <Text style={styles.whoBody}>משבצות בשחור־לבן. לוחצים רק על מי שמתאים לשאלה.</Text>
          <View style={styles.playLight}>
            <Text style={styles.playLightText}>שחק</Text>
          </View>
        </LinearGradient>
      </Pressable>

      <Pressable accessibilityRole="button" onPress={() => router.push('/games/grid')}>
        <LinearGradient colors={['#5a2430', '#2a1418']} style={styles.netCard}>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Football_goal_net.jpg/1280px-Football_goal_net.jpg' }}
            style={styles.netShot}
          />
          <View style={styles.netVeil} />
          <View style={styles.netCopy}>
            <Text style={styles.netKicker}>לוח</Text>
            <Text style={styles.whoTitle}>הרשת</Text>
            <Text style={styles.whoBody}>שורה וטור. שם אחד לכל משבצת, מהגברים שבמאגר.</Text>
            <View style={styles.playLight}>
              <Text style={styles.playLightText}>שחק</Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>

      <Pressable accessibilityRole="button" onPress={() => router.push('/games/club')}>
        <LinearGradient colors={['rgba(92,22,40,0.94)', 'rgba(28,8,14,0.92)']} style={styles.club}>
          {saka ? <Image source={{ uri: saka }} style={[styles.heroPhoto, face('center 12%')]} /> : <View style={styles.heroPhoto} />}
          <View style={styles.clubCopy}>
            <Text style={styles.kicker}>מועדון</Text>
            <Text style={styles.clubTitle}>איזה מועדון</Text>
            <Text style={styles.clubBody}>מזהים את השחקן ובוחרים איפה הוא משחק.</Text>
            <View style={styles.play}>
              <View style={styles.inset} />
              <View style={styles.pip} />
              <Text style={styles.playText}>שחק</Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>

      <Pressable accessibilityRole="button" onPress={() => router.push('/games/draft')}>
        <LinearGradient colors={['rgba(16,48,36,0.94)', 'rgba(8,16,12,0.92)']} style={styles.draft}>
          <View style={styles.draftCopy}>
            <Text style={styles.goldKicker}>כמו ב־FC 27</Text>
            <Text style={styles.draftTitle}>דראפט</Text>
            <Text style={styles.draftBody}>מערך, קפטן, וחמישה קלפים לכל עמדה.</Text>
          </View>
          <View style={styles.mini}>
            {faces.slice(0, 3).map((photo, index) => (
              <Image key={photo} source={{ uri: photo }} style={[styles.miniFace, face('center 16%'), { left: 10 + index * 34 }]} />
            ))}
            {faces[3] ? <Image source={{ uri: faces[3] }} style={[styles.miniFace, face('center 16%'), styles.miniLower]} /> : null}
          </View>
        </LinearGradient>
      </Pressable>
      </View>
    </Screen>
  );
}

const styles = {
  stack: {
    gap: 14,
  },
  eyebrow: {
    fontFamily: careerFont,
    color: GOLD,
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1.4,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  title: {
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 36,
    fontWeight: '800' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  lead: {
    fontFamily: careerFont,
    color: 'rgba(246,241,228,0.78)',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  club: {
    minHeight: 228,
    borderRadius: 22,
    overflow: 'hidden' as const,
    flexDirection: 'row' as const,
    borderWidth: 1,
    borderColor: 'rgba(255,143,163,0.45)',
  },
  heroPhoto: {
    width: 148,
    height: 228,
    backgroundColor: '#2A1218',
  },
  clubCopy: {
    flex: 1,
    padding: 16,
    alignItems: 'flex-end' as const,
    gap: 8,
  },
  kicker: {
    fontFamily: careerFont,
    color: '#FFB3C2',
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
  },
  clubTitle: {
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 28,
    fontWeight: '800' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  clubBody: {
    fontFamily: careerFont,
    color: 'rgba(246,241,228,0.78)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  play: {
    marginTop: 8,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F4F1E6',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 14,
  },
  inset: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    right: 0,
    width: 4,
    backgroundColor: GOLD,
  },
  pip: {
    width: 8,
    height: 8,
    backgroundColor: '#E23B57',
  },
  playText: {
    fontFamily: careerFont,
    color: INK,
    fontSize: 16,
    fontWeight: '800' as const,
    writingDirection: 'rtl' as const,
  },
  draft: {
    borderRadius: 22,
    overflow: 'hidden' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,196,106,0.45)',
  },
  draftCopy: {
    flex: 1,
    alignItems: 'flex-end' as const,
    gap: 4,
  },
  goldKicker: {
    fontFamily: careerFont,
    color: GOLD,
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  draftTitle: {
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 26,
    fontWeight: '800' as const,
    writingDirection: 'rtl' as const,
  },
  draftBody: {
    fontFamily: careerFont,
    color: 'rgba(246,241,228,0.75)',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  mini: {
    width: 132,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#12382A',
    borderWidth: 1,
    borderColor: 'rgba(190,235,205,0.35)',
    position: 'relative' as const,
  },
  miniFace: {
    position: 'absolute' as const,
    top: 10,
    width: 28,
    height: 36,
    borderRadius: 5,
    backgroundColor: '#0C2418',
  },
  miniLower: {
    top: 52,
    left: 52,
  },
  who: {
    borderRadius: 22,
    overflow: 'hidden' as const,
    padding: 16,
    gap: 6,
    alignItems: 'flex-end' as const,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  whoKicker: {
    fontFamily: careerFont,
    color: '#ffe8c8',
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
  },
  whoTitle: {
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 28,
    fontWeight: '800' as const,
    writingDirection: 'rtl' as const,
  },
  whoBody: {
    fontFamily: careerFont,
    color: 'rgba(255,250,246,0.9)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  playLight: {
    marginTop: 8,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#fffaf4',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  playLightText: {
    fontFamily: careerFont,
    color: '#3a1248',
    fontSize: 16,
    fontWeight: '800' as const,
    writingDirection: 'rtl' as const,
  },
  netCard: {
    borderRadius: 22,
    overflow: 'hidden' as const,
    minHeight: 168,
    borderWidth: 1,
    borderColor: 'rgba(245,215,220,0.4)',
    position: 'relative' as const,
  },
  netShot: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.35,
  },
  netVeil: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(42,20,24,0.55)',
  },
  netCopy: {
    padding: 16,
    gap: 6,
    alignItems: 'flex-end' as const,
  },
  netKicker: {
    fontFamily: careerFont,
    color: '#f5d7dc',
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
  },
};
