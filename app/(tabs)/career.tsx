import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { Button, Muted, Screen, Title } from '@/components/ui';
import { TileGrid } from '@/components/TileGrid';
import { formatDate } from '@/lib/format';
import { modeLabel } from '@/lib/labels';
import { isOpen } from '@/lib/selectors';
import { useApp } from '@/lib/store';

export default function CareerScreen() {
  const app = useApp();
  const router = useRouter();

  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="career">
      <Title>קריירה</Title>
      <Muted>אתגר, צילום, וקרדיט אחרי אישור. אחרי 5 אישורים ההגשה עולה מיד.</Muted>
      {app.user?.isAdmin ? <Button label="אתגר חדש" onPress={() => router.push('/career/new')} /> : null}
      <TileGrid
        items={app.challenges}
        render={(challenge) => (
          <Pressable accessibilityRole="button" onPress={() => router.push(`/career/${challenge.id}`)} style={{ borderRadius: 18, overflow: 'hidden' }}>
            <LinearGradient
              colors={challenge.mode === 'manager' ? ['#1E4D8C', '#10243F'] : ['#0E6B45', '#12382A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ minHeight: 150, padding: 16, justifyContent: 'space-between' }}>
              <Text style={{ color: 'rgba(255,255,255,0.78)', fontWeight: '700', textAlign: 'right' }}>{modeLabel(challenge.mode)}</Text>
              <Text style={{ color: '#F7F4EA', fontSize: 18, fontWeight: '800', textAlign: 'right' }}>{challenge.title}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.82)', textAlign: 'right' }}>{isOpen(challenge) ? `פתוח עד ${formatDate(challenge.endsAt)}` : 'האתגר נסגר'}</Text>
            </LinearGradient>
          </Pressable>
        )}
      />
    </Screen>
  );
}
