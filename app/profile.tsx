import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AvatarCropModal } from '@/components/AvatarCropModal';
import { LevelChip } from '@/components/OwnerLevelPlate';
import { ProfileFace } from '@/components/ProfileFace';
import { ProfileSquadBoard } from '@/components/ProfileSquadBoard';
import { Badge, Button, colors, Muted, Screen, Title } from '@/components/ui';
import { communityXp, xpProgress } from '@/lib/communityBoard';
import { errorMessage } from '@/lib/format';
import { pickImages } from '@/lib/images';
import { badgesFor, pendingCount } from '@/lib/selectors';
import { useApp } from '@/lib/store';

export default function ProfileScreen() {
  const app = useApp();
  const router = useRouter();
  const badges = app.user ? badgesFor(app.user, app.grounds) : [];
  const userId = app.user?.id;
  const followers = userId ? app.follows.filter((item) => item.followingId === userId).length : 0;
  const following = userId ? app.follows.filter((item) => item.followerId === userId).length : 0;
  const progress = xpProgress(app.user ? communityXp(app.user.id, app) : 0);
  const [rawUri, setRawUri] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  async function run(work: () => Promise<void>) {
    try {
      await work();
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  async function changePhoto() {
    try {
      const [uri] = await pickImages(1, {
        permission: 'צריך אישור לגלריה כדי לבחור תמונת פרופיל.',
      });
      if (!uri) return;
      setRawUri(uri);
      setCropOpen(true);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  async function saveCropped(cropped: string) {
    setCropOpen(false);
    try {
      await app.setAvatar(cropped);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <Screen scene="home">
      <Stack.Screen options={{ title: 'פרופיל' }} />
      {app.user ? (
        <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 14 }}>
          <LevelChip progress={progress} />
          <View style={{ flex: 1, gap: 8 }}>
            <Title>{app.user.displayName}</Title>
            <Button label="החלפת תמונת פרופיל" onPress={changePhoto} disabled={app.busy} />
          </View>
          <ProfileFace name={app.user.displayName} uri={app.user.avatarUrl} size={76} />
        </View>
      ) : (
        <Title>פרופיל</Title>
      )}
      <Muted>{app.mode === 'local' ? 'מצב הדגמה על המכשיר' : 'מחוברים לשרת'}</Muted>
      {app.user ? (
        <View style={{ flexDirection: 'row', direction: 'rtl', gap: 8 }}>
          <View
            style={{
              flex: 1,
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: 'rgba(253,101,2,0.45)',
              backgroundColor: 'rgba(253,101,2,0.12)',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#F7F4EA', fontSize: 22, fontWeight: '900' }}>{followers}</Text>
            <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '700' }}>עוקבים</Text>
          </View>
          <View
            style={{
              flex: 1,
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: 'rgba(180,200,220,0.28)',
              backgroundColor: 'rgba(16,22,28,0.9)',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#F7F4EA', fontSize: 22, fontWeight: '900' }}>{following}</Text>
            <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '700' }}>עוקב</Text>
          </View>
        </View>
      ) : null}
      <Text style={{ color: colors.gold, fontSize: 32, fontWeight: '700', textAlign: 'right' }}>{app.user?.reputation ?? 0}</Text>
      <Muted>נקודות מוניטין. זה לא מטבע ולא פרס שאפשר למשוך.</Muted>
      <Muted>הגשות שאושרו: {app.user?.approvedCount ?? 0}</Muted>
      {app.user ? (
        <>
          <Button
            label={app.user.squad ? 'עריכת הקבוצה' : 'בניית הקבוצה'}
            onPress={() => router.push('/squad')}
          />
          {app.user.squad ? (
            <ProfileSquadBoard squad={app.user.squad} />
          ) : (
            <Muted>בנו סגל משחקנים ומחליפים. מי שנכנס לפרופיל יראה את הקבוצה על המגרש.</Muted>
          )}
        </>
      ) : null}
      {badges.length ? (
        <>
          {badges.map((badge) => (
            <Badge key={badge} text={badge} tone="gold" />
          ))}
        </>
      ) : (
        <Muted>תגים מגיעים מאישורי קריירה וממודעות בגראונדס.</Muted>
      )}
      {app.user?.isAdmin ? (
        <Button label={`תור אישור · ${pendingCount(app)}`} onPress={() => router.push('/admin/queue')} />
      ) : null}
      {app.mode === 'local' ? <Button label="איפוס נתוני הדגמה" variant="ghost" onPress={() => run(app.resetDemo)} /> : null}
      <Button label="יציאה" variant="danger" onPress={() => run(app.signOut)} />
      {rawUri ? (
        <AvatarCropModal uri={rawUri} visible={cropOpen} onCancel={() => setCropOpen(false)} onConfirm={saveCropped} />
      ) : null}
    </Screen>
  );
}

