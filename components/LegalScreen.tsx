import { Stack } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { I18nManager, Platform, ScrollView, Text, View, type TextStyle } from 'react-native';

import { LegalLinks } from '@/components/LegalLinks';
import { SiteNav } from '@/components/SiteNav';
import { colors } from '@/components/ui';
import { inlineLatin, latinParts } from '@/lib/legalBidi';
import { useLanguage } from '@/lib/language';
import { localizedLegal, localizedLegalDate } from '@/lib/legalLocalization';

export { inlineLatin };

/**
 * Native RTL swaps left and right, so "left" is the visual right edge.
 * On the web the document is already RTL and left/right stay physical.
 */
const edge = I18nManager.isRTL && Platform.OS !== 'web' ? 'left' : 'right';

export const rtl: TextStyle = {
  textAlign: edge,
  writingDirection: 'rtl',
  alignSelf: 'stretch',
};
export const ltr: TextStyle = { textAlign: 'left', writingDirection: 'ltr' };

function Bidi({
  text,
  style,
  header = false,
}: {
  text: string;
  style?: TextStyle;
  header?: boolean;
}) {
  const { locale, isRTL } = useLanguage();
  const localized = localizedLegal(text, locale);
  if (!isRTL) {
    return (
      <Text accessibilityRole={header ? 'header' : undefined} style={[ltr, style]}>
        {localized}
      </Text>
    );
  }
  const parts = latinParts(localized);
  return (
    <Text accessibilityRole={header ? 'header' : undefined} style={[rtl, style]}>
      {parts.map((part, index) =>
        part.latin ? (
          <Text key={index} style={{ writingDirection: 'ltr' }}>
            {`\u2066${part.value}\u2069`}
          </Text>
        ) : (
          <Text key={index}>{part.value}</Text>
        ),
      )}
    </Text>
  );
}

/**
 * Prominent Dual-Language Legal Notice Card required to sit at the very top of
 * both Privacy Policy and Terms of Service to prevent copyright issues with EA.
 */
export function PrimaryLegalNotice() {
  const { language, isRTL } = useLanguage();
  const he = language === 'he';
  return (
    <View
      style={{
        backgroundColor: 'rgba(22, 30, 24, 0.88)',
        borderColor: 'rgba(227, 179, 65, 0.45)',
        borderTopColor: 'rgba(227, 179, 65, 0.9)',
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      }}
    >
      <View style={{ flexDirection: 'row', direction: isRTL ? 'rtl' : 'ltr', alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: 'rgba(227, 179, 65, 0.16)',
            borderColor: 'rgba(227, 179, 65, 0.5)',
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 9,
            paddingVertical: 4,
            flexDirection: 'row',
            direction: isRTL ? 'rtl' : 'ltr',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 13 }}>⚖️</Text>
          <Bidi text={he ? 'הבהרה משפטית רשמית • LEGAL DISCLAIMER' : 'Official Legal Notice • LEGAL DISCLAIMER'} style={{ color: colors.gold, fontSize: 11.5, fontWeight: '900', width: undefined }} />
        </View>
      </View>
      <Bidi
        text={he
          ? 'אתר זה הינו אתר מעריצים עצמאי ואינו קשור, ממומן, מאושר או נתמך על ידי Electronic Arts Inc. או שותפיה. כל שמות המשחקים, הלוגואים, המותגים ותמונות השחקנים המוצגים באתר הם קניינם הרוחני של בעליהם החוקיים ומשמשים כאן תחת הגדרת "שימוש הוגן" למטרות מידע וקהילה בלבד.'
          : 'This website and application are an independent fan site. They are not affiliated with, endorsed, sponsored, or specifically approved by Electronic Arts Inc. or its affiliates. All game titles, logos, brands, and player images remain the intellectual property of their respective owners and are used for informational and community purposes under applicable fair-use principles.'}
        style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', lineHeight: 25 }}
      />
    </View>
  );
}

export function LegalBulletItem({ text }: { text: string }) {
  const { isRTL: he } = useLanguage();
  return (
    <View style={{ flexDirection: 'row', direction: he ? 'rtl' : 'ltr', alignItems: 'flex-start', gap: 8, width: '100%' }}>
      <Text style={{ color: colors.gold, fontSize: 15, lineHeight: 25, fontWeight: '800' }}>•</Text>
      <Bidi text={text} style={{ flex: 1, color: colors.text, fontSize: 15, lineHeight: 25, width: undefined }} />
    </View>
  );
}

export function LegalSection({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <Bidi text={title} header style={{ color: colors.gold, fontSize: 18, fontWeight: '900' }} />
      {body ? <Bidi text={body} style={{ color: colors.text, fontSize: 15.5, lineHeight: 26 }} /> : null}
      {children}
    </View>
  );
}

export function LegalScreen({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  const { locale, isRTL: he } = useLanguage();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    let style = document.getElementById('fc27-legal-rtl') as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = 'fc27-legal-rtl';
      document.head.appendChild(style);
    }
    style.textContent = `
      #legal-doc { direction: ${he ? 'rtl' : 'ltr'}; text-align: ${he ? 'right' : 'left'}; }
      #legal-en, #legal-en * { direction: ltr; text-align: left; }
    `;
    document.documentElement.lang = locale;
    document.documentElement.dir = he ? 'rtl' : 'ltr';
  }, [he, locale]);

  return (
    <View nativeID="legal-doc" style={{ flex: 1, backgroundColor: '#050A08', direction: he ? 'rtl' : 'ltr' }}>
      <Stack.Screen options={{ headerShown: false, title: localizedLegal(title, locale) }} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 64,
          width: '100%',
          maxWidth: 840,
          alignSelf: 'center',
          alignItems: 'stretch',
          direction: he ? 'rtl' : 'ltr',
          gap: 16,
        }}
      >
        <SiteNav />
        <Bidi text={title} header style={{ color: colors.text, fontSize: 34, fontWeight: '900' }} />
        <Text style={[he ? rtl : ltr, { color: colors.muted, fontWeight: '700' }]}>{localizedLegalDate(updated, locale)}</Text>
        {children}
        <LegalLinks />
      </ScrollView>
    </View>
  );
}
