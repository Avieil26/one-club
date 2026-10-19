import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/components/ui';
import { acceptCookieNotice, hasCookieNotice } from '@/lib/legal';
import { useLanguage } from '@/lib/language';

export function CookieNotice() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const rtl = language === 'he';
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    void hasCookieNotice().then((accepted) => {
      if (live && !accepted) setOpen(true);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!open) return null;

  return (
    <View
      accessibilityRole="summary"
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: Math.max(insets.bottom, 12),
        zIndex: 200,
        gap: 10,
        padding: 14,
        borderRadius: 16,
        backgroundColor: 'rgba(8, 14, 12, 0.96)',
        borderWidth: 1,
        borderColor: 'rgba(227, 179, 65, 0.55)',
      }}
    >
      <Text accessibilityRole="header" style={{ color: colors.text, fontWeight: '900', fontSize: 16, textAlign: rtl ? 'right' : 'left' }}>
        {Platform.OS === 'web' ? t('עוגיות ואחסון בדפדפן', 'Cookies & browser storage') : t('אחסון במכשיר', 'Device storage')}
      </Text>
      <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'right', writingDirection: rtl ? 'rtl' : 'ltr', alignSelf: 'stretch' }}>
        {t('1 CLUB שומר במכשיר רק מה שצריך כדי להישאר מחוברים ולזכור שקראתם את ההודעה הזו. אין עוגיות פרסום ואין מעקב אנליטי. אפשר להמשיך לגלוש גם בלי ללחוץ, וההתחברות תמשיך לעבוד.', '1 CLUB stores only what is needed on your device to keep you signed in and remember that you have seen this notice. We do not use advertising cookies or analytics tracking. You can keep browsing without dismissing the notice, and sign-in will continue to work.')}
      </Text>
      <View style={{ flexDirection: 'row', direction: rtl ? 'rtl' : 'ltr', gap: 8, justifyContent: 'flex-start' }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void acceptCookieNotice().then(() => setOpen(false));
          }}
          style={{ minHeight: 44, paddingHorizontal: 16, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: colors.goldInk, fontWeight: '900' }}>{t('הבנתי', 'Got it')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/legal/cookies')}
          style={{ minHeight: 44, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: colors.gold, fontWeight: '800', textDecorationLine: 'underline' }}>{t('פירוט העוגיות', 'Cookie details')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
