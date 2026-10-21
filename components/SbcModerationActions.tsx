import { Alert, View } from 'react-native';
import { Button, Muted } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { useLanguage } from '@/lib/language';
import { useApp } from '@/lib/store';
import type { SbcSolution } from '@/lib/types';

export function SbcModerationActions({ solution }: { solution: SbcSolution }) {
  const app = useApp();
  const { t, language } = useLanguage();
  if (!app.user?.isAdmin) return null;
  async function review(status: 'approved' | 'rejected') {
    try { await app.moderateSolution(solution.id, status); }
    catch (error) { Alert.alert(t('לא ניתן לעדכן את האישור', 'Could not update review'), errorMessage(error, language)); }
  }
  return <View testID="sbc-moderation-actions" style={{ gap: 10 }}>
    <Muted>{t('בדקו את חלק האתגר, גרסת הקלפים וכל הדרישות בצילום או בסגל לפני אישור.', 'Review the challenge segment, item versions and every requirement in the screenshot or squad before approving.')}</Muted>
    {solution.status !== 'approved' ? <Button label={t('אישור ופרסום הפתרון', 'Approve and publish solution')} variant="gold" disabled={app.busy} onPress={() => { void review('approved'); }} /> : null}
    {solution.status !== 'rejected' ? <Button label={solution.status === 'approved' ? t('ביטול האישור', 'Revoke approval') : t('דחיית הפתרון', 'Reject solution')} variant="danger" disabled={app.busy} onPress={() => { void review('rejected'); }} /> : null}
  </View>;
}
