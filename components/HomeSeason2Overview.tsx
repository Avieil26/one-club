import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { PortraitCard } from '@/components/PortraitCard';
import { useLanguage } from '@/lib/language';
import { SEASON2_CARDS } from '@/lib/season2';

const featured = [50563325, 84095411, 50539776, 67289794].map((id) => SEASON2_CARDS.find((card) => card.itemId === id)!);

export function HomeSeason2Overview() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const narrow = width < 650;
  const textAlign = language === 'he' ? 'right' as const : 'left' as const;
  return (
    <LinearGradient testID="home-season2" colors={['#382619', '#171D27', '#0B111A']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={{ borderRadius: 18, borderWidth: 1, borderColor: '#6F5236', padding: narrow ? 16 : 24, gap: 16 }}>
      <View style={{ flexDirection: narrow ? 'column' : language === 'he' ? 'row-reverse' : 'row', gap: 18, alignItems: narrow ? 'stretch' : 'center' }}>
        <View style={{ flex: 1, minWidth: 0, gap: 9 }}>
          <Text style={{ color: '#FFB577', fontWeight: '800', fontSize: 12, letterSpacing: 1, textAlign }}>{t('חדש בקטלוג · 22.10.2026', 'NEW IN THE CATALOGUE · 22 OCT 2026')}</Text>
          <Text accessibilityRole="header" style={{ color: '#FFF4E6', fontSize: narrow ? 26 : 32, fontWeight: '900', textAlign }}>Season 2 · FC Heritage</Text>
          <Text style={{ color: '#DDDFE5', fontSize: 15, lineHeight: 23, textAlign }}>{t('29 קלפים בארבעה עיצובים מקוריים, עם נתונים מלאים. 20 פרסי עונה ומשימות, לצד 9 גרסאות רטרו.', '29 cards in four original designs, with full attributes. 20 season and objective rewards, plus nine retro versions.')}</Text>
          <Text style={{ color: '#C9AB8B', fontSize: 13, lineHeight: 21, textAlign }}>{t('גלו מה דורש נקודות עונה, מה שייך ל־Premium ואילו קלפים משיגים במשחק. דרך ההשגה של גרסאות הרטרו עדיין בבדיקה.', 'See the Season Point requirements, Premium rewards and gameplay objectives. Acquisition routes for the retro versions are still being checked.')}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: narrow ? 4 : 8 }}>
          {featured.map((card) => <PortraitCard key={card.id} player={card} width={narrow ? 64 : 90} />)}
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/market?kind=season2')} style={{ alignSelf: language === 'he' ? 'flex-end' : 'flex-start', borderRadius: 10, backgroundColor: '#F8832E', paddingVertical: 12, paddingHorizontal: 20 }}>
        <Text style={{ color: '#1E1007', fontSize: 15, fontWeight: '900' }}>{t('לכל קלפי עונה 2 ודרכי ההשגה', 'Explore Season 2 cards and requirements')}</Text>
      </Pressable>
    </LinearGradient>
  );
}
