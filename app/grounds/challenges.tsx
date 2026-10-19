import { useRouter } from 'expo-router';
import { useLanguage } from '@/lib/language';

import { Button, Muted, Screen, Title } from '@/components/ui';

export default function GroundsCommunityChallengesScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen scene="grounds">
      <Title>{t('אתגרי הקהילה', 'Community challenges')}</Title>
      <Muted>{t('אתגרי הקהילה עדיין בהכנה. כשיהיו זמינים, הם יופיעו כאן.', 'Community challenges are being prepared. They will appear here when available.')}</Muted>
      <Button label={t('חזרה ל־THE GROUNDS', 'Back to THE GROUNDS')} variant="ghost" onPress={() => router.replace('/grounds')} />
    </Screen>
  );
}
