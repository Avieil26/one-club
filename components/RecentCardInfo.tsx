import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '@/lib/language';
import type { RecentCard } from '@/lib/recentCards';
export function RecentCardInfo({ card }: { card: RecentCard }) {
  const { t, language } = useLanguage();
  const { price } = card;
  const variant = card.holographicType === 'pristine' ? 'Pristine' : card.holographicType === 'holographic' ? 'Holographic' : '';
  const align = { textAlign: language === 'he' ? 'right' as const : 'left' as const };
  return (
    <LinearGradient testID="recent-card-info" colors={['#1D2333', '#11151F']} style={styles.panel}>
      <Text style={[styles.title, align]}>{card.family}{variant ? ` · ${variant}` : ''}</Text>
      {price.kind === 'sbc' ? (
        <View style={styles.rows}>
          <Text style={[styles.text, align]}>{t('עלות השלמת SBC משוערת', 'Estimated SBC completion cost')}</Text>
          <Text style={[styles.price, align]}>{t('קונסולות', 'Consoles')}: {price.console?.toLocaleString('en-US') ?? '—'} · PC: {price.pc?.toLocaleString('en-US') ?? '—'}</Text>
          <Text style={[styles.muted, align]}>{t('מטבעות להשלמת האתגר; זה אינו מחיר שוק של הקלף.', 'Coins to complete the challenge; this is not a market price for the card.')} {t('נבדק:', 'Checked:')} {new Date(price.checkedAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-GB')}</Text>
        </View>
      ) : price.kind === 'unavailable' || (!price.console && !price.pc) ? (
        <Text style={[styles.text, align]}>{t('אין מחיר שוק זמין לגרסה הזאת כרגע.', 'No market price is currently available for this edition.')}</Text>
      ) : null}
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  panel: { padding: 18, gap: 10, borderRadius: 16, borderWidth: 1, borderColor: '#353D50' },
  rows: { gap: 8 }, title: { color: '#F4F3EF', fontSize: 16, fontWeight: '800' },
  text: { color: '#D9DEE8', fontSize: 14, lineHeight: 21 },
  price: { color: '#F1CEA2', fontSize: 16, fontWeight: '700' }, muted: { color: '#A5B0C3', fontSize: 12, lineHeight: 18 },
});
