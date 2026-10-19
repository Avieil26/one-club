import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { PortraitCard } from '@/components/PortraitCard';
import { hasAcceptedTerms } from '@/lib/legal';
import { getSupabase } from '@/lib/supabase';
import { FUTURE_STARS_PLAYERS, futureStarsFor } from '@/lib/futureStars';
import { useApp } from '@/lib/store';

const CAMPAIGN_ID = 'future-stars-launch-2026-10-v1';
const LOCAL_SEEN_PREFIX = 'fc27-future-stars-announcement-seen';
const AUTH_SEEN_KEY = 'fc27_future_stars_announcement_seen';

// Campaign cutoff: October 15, 2026 at 00:00 Israel time.
// Recheck this cutoff if the Production release is delayed beyond the launch window.
const CAMPAIGN_END_AT = Date.parse('2026-10-15T00:00:00+03:00');

function isProductionWebsite(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname === 'fc27-israel.vercel.app';
}

function campaignIsActive(): boolean {
  return Date.now() < CAMPAIGN_END_AT;
}

async function hasSeenCampaign(userId: string): Promise<boolean> {
  const localKey = `${LOCAL_SEEN_PREFIX}:${CAMPAIGN_ID}:${userId}`;
  try {
    if ((await AsyncStorage.getItem(localKey)) === CAMPAIGN_ID) return true;
  } catch {}

  // Preview dismissals stay local to Preview and never suppress the Production announcement.
  if (!isProductionWebsite()) return false;

  try {
    const { data, error } = await getSupabase().auth.getUser();
    if (!error && data.user?.id === userId) {
      return data.user.user_metadata?.[AUTH_SEEN_KEY] === CAMPAIGN_ID;
    }
  } catch {}
  return false;
}

async function saveCampaignSeen(userId: string): Promise<void> {
  const localKey = `${LOCAL_SEEN_PREFIX}:${CAMPAIGN_ID}:${userId}`;
  try {
    await AsyncStorage.setItem(localKey, CAMPAIGN_ID);
  } catch {}

  // On Production, save to the signed-in Supabase account to prevent repeat display across devices.
  if (!isProductionWebsite()) return;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user || data.user.id !== userId) return;
    await supabase.auth.updateUser({
      data: {
        ...(data.user.user_metadata ?? {}),
        [AUTH_SEEN_KEY]: CAMPAIGN_ID,
      },
    });
  } catch {}
}

export function FutureStarsAnnouncement() {
  const app = useApp();
  const router = useRouter();
  const userId = app.user?.id;
  const { width, height: windowHeight } = useWindowDimensions();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    setVisible(false);
    if (!app.ready || !userId || !campaignIsActive()) return;

    let completed = false;
    const stopPolling = () => {
      completed = true;
      if (interval) clearInterval(interval);
    };

    const check = async () => {
      if (cancelled || completed) return;
      // Wait for the existing legal-consent modal and post-login welcome screen to finish.
      const acceptedTerms = await hasAcceptedTerms(userId);
      if (cancelled || completed || !acceptedTerms) return;

      const seen = await hasSeenCampaign(userId);
      if (cancelled || completed) return;
      stopPolling();
      if (!seen) setVisible(true);
    };

    const initialDelay = setTimeout(() => {
      void check();
      interval = setInterval(() => void check(), 900);
    }, 1400);

    return () => {
      cancelled = true;
      clearTimeout(initialDelay);
      if (interval) clearInterval(interval);
    };
  }, [app.ready, userId]);

  const dismiss = () => {
    setVisible(false);
    if (userId) void saveCampaignSeen(userId);
  };

  const goToFutureStars = () => {
    dismiss();
    router.push({ pathname: '/market', params: { kind: 'future-stars' } });
  };

  if (!visible || !app.user) return null;

  const modalWidth = Math.min(width - 24, 940);
  const columns = width < 440 ? 3 : width < 650 ? 4 : width < 960 ? 5 : 6;
  const cardWidth = Math.max(68, Math.min(112, (modalWidth - 40 - (columns - 1) * 8) / columns));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss} statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(3, 4, 10, 0.88)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 940,
            maxHeight: Math.min(windowHeight * 0.9, 900),
            backgroundColor: '#0A0C12',
            borderWidth: 1.5,
            borderColor: 'rgba(174, 111, 255, 0.78)',
            borderRadius: 22,
            overflow: 'hidden',
            shadowColor: '#8F48FF',
            shadowOpacity: 0.32,
            shadowRadius: 26,
            shadowOffset: { width: 0, height: 10 },
            elevation: 20,
          }}
        >
          <View
            style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
              paddingTop: 13,
              paddingBottom: 10,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(174, 111, 255, 0.25)',
              backgroundColor: 'rgba(137, 77, 217, 0.12)',
            }}
          >
            <View style={{ flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 33, height: 33, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(174, 111, 255, 0.16)', borderWidth: 1, borderColor: 'rgba(210, 179, 255, 0.45)' }}>
                <Text style={{ color: '#F1D8FF', fontSize: 20, fontWeight: '900' }}>✦</Text>
              </View>
              <View style={{ gap: 2 }}>
                <Text style={{ color: '#D9B6FF', fontSize: 10, fontWeight: '900', letterSpacing: 1.1, textAlign: 'right' }}>FC27 ISRAEL · UPDATE</Text>
                <Text style={{ color: '#FFF4D7', fontSize: 15, fontWeight: '900', textAlign: 'right' }}>עדכון חדש באתר</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="סגירת הודעת העדכון"
              onPress={dismiss}
              hitSlop={10}
              style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', marginLeft: 10 }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 25, fontWeight: '500', lineHeight: 28 }}>×</Text>
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 16, paddingTop: 15, paddingBottom: 12, gap: 8 }}>
            <Text style={{ color: '#F8E7FF', fontSize: width < 440 ? 23 : 28, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' }}>
              כוכבי העתיד הגיעו! ✨
            </Text>
            <Text style={{ color: '#D8D4E3', fontSize: 13, lineHeight: 21, textAlign: 'right', writingDirection: 'rtl' }}>
              הכירו את הדור הבא של הכדורגל: כל 15 קלפי Future Stars החדשים מחכים לכם עם דירוגים, נתונים וסטטיסטיקות — וגם חיבור למחירי השוק.
            </Text>
            <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 7, marginTop: 1 }}>
              {['15 קלפים מיוחדים', 'נתוני שחקנים מלאים', 'מחירי שוק'].map((label) => (
                <View key={label} style={{ borderRadius: 999, borderWidth: 1, borderColor: 'rgba(196, 151, 255, 0.32)', backgroundColor: 'rgba(133, 79, 204, 0.12)', paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: '#E8D6FF', fontSize: 10, fontWeight: '800' }}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <ScrollView
            style={{ flexGrow: 1, flexShrink: 1 }}
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 10, paddingTop: 2, alignItems: 'center' }}
            showsVerticalScrollIndicator
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: 8, maxWidth: modalWidth - 20 }}>
              {FUTURE_STARS_PLAYERS.map((player) => (
                <View key={player.id} style={{ width: cardWidth, alignItems: 'center', overflow: 'visible' }}>
                  <PortraitCard player={player} width={cardWidth} edition="future-stars" photoOverride={futureStarsFor(player.baseId ?? player.id)?.photoUrl} />
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={{ paddingHorizontal: 15, paddingTop: 10, paddingBottom: 13, borderTopWidth: 1, borderTopColor: 'rgba(174, 111, 255, 0.22)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <Pressable
              accessibilityRole="button"
              onPress={goToFutureStars}
              style={{ minHeight: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B786F5', borderWidth: 1, borderColor: '#D9B6FF', paddingHorizontal: 16 }}
            >
              <Text style={{ color: '#170C25', fontSize: 14, fontWeight: '900' }}>יאללה, בואו לראות את הכוכבים ✦</Text>
            </Pressable>
            <Text style={{ marginTop: 7, color: '#7C788B', fontSize: 10, textAlign: 'center' }}>
              ההודעה תופיע פעם אחת בלבד בתקופת ההשקה
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
