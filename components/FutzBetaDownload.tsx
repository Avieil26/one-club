import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Linking, Platform, Pressable, Text, View } from 'react-native';

import { colors, Muted } from '@/components/ui';
import { apkDownloadUrl, isApkAvailable } from '@/lib/apkDownload';
import { useLanguage } from '@/lib/language';

/** Hero download card for Futz BETA APK — web + mobile. */
export function FutzBetaDownload() {
  const { t, language, isRTL: rtl } = useLanguage();
  
  const [ready, setReady] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    setReady(await isApkAvailable());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function download() {
    const url = apkDownloadUrl();
    const available = ready ?? (await isApkAvailable());
    if (!available) {
      Alert.alert(t('בקרוב', 'Coming soon'), t('קובץ ה־APK של 1 CLUB עדיין לא הועלה. נסו שוב אחרי עדכון הבטא.', 'The 1 CLUB APK has not been uploaded yet. Please try again after the next beta update.'));
      return;
    }
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const a = document.createElement('a');
        a.href = url;
        a.download = '1-CLUB.apk';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('רגע', 'Please try again'), t('ההורדה נכשלה. נסו שוב בעוד רגע.', 'The download failed. Please try again in a moment.'));
    }
  }

  if (Platform.OS !== 'web') return null;

  const ios =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  return (
    <LinearGradient
      colors={['#101820', '#0B1218', '#162028']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(227,179,65,0.35)',
        padding: 16,
        gap: 14,
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr', alignItems: 'center', gap: 14 }}>
        <Image
          source={require('@/assets/images/brand-1club.png')}
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: 'rgba(227,179,65,0.45)',
          }}
          resizeMode="cover"
        />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '800', textAlign: rtl ? 'right' : 'left', letterSpacing: 1.2 }}>
            {ios ? t('באתר', 'WEB VERSION') : 'ANDROID · BETA'}
          </Text>
          <Text style={{ color: '#F7F4EA', fontSize: 22, fontWeight: '900', textAlign: 'right' }}>1 CLUB</Text>
          <Muted>
            {ios
              ? t('באייפון נכנסים דרך האתר. הורדת האפליקציה היא לאנדרואיד.', 'On iPhone, use the website. The installable app is available for Android.')
              : ready === false
                ? t('הכפתור מוכן — קובץ ה־APK יעלה מיד אחרי בילד הבטא.', 'The button is ready. The APK will be uploaded after the next beta build.')
                : t('גרסת בטא להתקנה ישירה בטלפון — לא בחנות.', 'A beta version for direct phone installation — not an app store release.')}
          </Muted>
        </View>
      </View>

      {ios ? null : <Pressable
        accessibilityRole="button"
        onPress={download}
        style={({ pressed }) => ({
          opacity: pressed ? 0.9 : ready === false ? 0.7 : 1,
          borderRadius: 14,
          overflow: 'hidden',
        })}
      >
        <LinearGradient
          colors={ready === false ? ['#6B7280', '#4B5563', '#374151'] : ['#F5D56A', '#E3B341', '#A67C1A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingVertical: 14, alignItems: 'center' }}
        >
          <Text style={{ color: ready === false ? '#E5E7EB' : '#1A1208', fontSize: 16, fontWeight: '900' }}>
            {ready === false ? t('APK בבנייה · 1 CLUB', 'APK in progress · 1 CLUB') : t('הורדת APK · 1 CLUB', 'Download APK · 1 CLUB')}
          </Text>
        </LinearGradient>
      </Pressable>}
    </LinearGradient>
  );
}
