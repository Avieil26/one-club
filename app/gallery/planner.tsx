import { Stack, useRouter } from 'expo-router';
import { Screen } from '@/components/ui';
import { GalleryButton } from '@/components/GalleryUI';
import { GalleryTokenPlanner } from '@/components/GalleryTokenPlanner';
import { useLanguage } from '@/lib/language';
import { useApp } from '@/lib/store';
export default function GalleryPlannerScreen() {
 const { t } = useLanguage(), router = useRouter(), app = useApp();
 return <Screen scene="gallery" maxWidth={1100}>
  <Stack.Screen options={{ headerShown: false, title: t('מתכנן הטוקנים', 'Token planner') }} />
  <GalleryButton label={t('חזרה לגלריה', 'Back to Gallery')} onPress={() => router.push('/gallery')} />
  <GalleryTokenPlanner key={app.user?.id || 'guest'} userId={app.user?.id} />
 </Screen>;
}
