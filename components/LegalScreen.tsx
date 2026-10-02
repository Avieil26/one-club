import { Stack } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { I18nManager, Platform, ScrollView, Text, View, type TextStyle } from 'react-native';

import { LegalLinks } from '@/components/LegalLinks';
import { SiteNav } from '@/components/SiteNav';
import { colors } from '@/components/ui';
import { inlineLatin, latinParts } from '@/lib/legalBidi';

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
  const parts = latinParts(text);

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
      {/* BADGE */}
      <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: 'rgba(227, 179, 65, 0.16)',
            borderColor: 'rgba(227, 179, 65, 0.5)',
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 9,
            paddingVertical: 4,
            flexDirection: 'row',
            direction: 'rtl',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 13 }}>⚖️</Text>
          <Bidi text="הבהרה משפטית רשמית • LEGAL DISCLAIMER" style={{ color: colors.gold, fontSize: 11.5, fontWeight: '900', width: undefined }} />
        </View>
      </View>

      <Bidi
        text='אתר זה הינו אתר מעריצים עצמאי ואינו קשור, ממומן, מאושר או נתמך על ידי Electronic Arts Inc. או שותפיה. כל שמות המשחקים, הלוגואים, המותגים ותמונות השחקנים המוצגים באתר הם קניינם הרוחני של בעליהם החוקיים ומשמשים כאן תחת הגדרת "שימוש הוגן" למטרות מידע וקהילה בלבד.'
        style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', lineHeight: 25 }}
      />

      {/* DIVIDER */}
      <View style={{ height: 1, backgroundColor: 'rgba(227, 179, 65, 0.25)', marginVertical: 2 }} />

      {/* ENGLISH DISCLAIMER */}
      <View nativeID="legal-en" style={{ gap: 4, direction: 'ltr', width: '100%' }}>
        <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 0.5, ...ltr }}>
          NON-AFFILIATION & FAIR USE NOTICE (ENGLISH)
        </Text>
        <Text style={{ color: '#D1D5DB', fontSize: 13, fontWeight: '500', lineHeight: 21, ...ltr }}>
          This website and application is an independent fan site and is not affiliated with, endorsed, sponsored, or specifically approved by Electronic Arts Inc. or its affiliates. All game titles, logos, brands, and player images displayed on this site are the intellectual property of their respective owners and are used here under 'fair use' for informational, educational, and community purposes only.
        </Text>
      </View>
    </View>
  );
}

export function LegalBulletItem({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'flex-start', gap: 8, width: '100%' }}>
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
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    if (document.getElementById('fc27-legal-rtl')) return;
    const style = document.createElement('style');
    style.id = 'fc27-legal-rtl';
    style.textContent = `
      #legal-doc { direction: rtl; text-align: right; }
      #legal-en, #legal-en * { direction: ltr; text-align: left; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <View nativeID="legal-doc" style={{ flex: 1, backgroundColor: '#050A08', direction: 'rtl' }}>
      <Stack.Screen options={{ headerShown: false, title }} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 64,
          width: '100%',
          maxWidth: 840,
          alignSelf: 'center',
          alignItems: 'stretch',
          direction: 'rtl',
          gap: 16,
        }}
      >
        <SiteNav />
        <Bidi text={title} header style={{ color: colors.text, fontSize: 34, fontWeight: '900' }} />
        <Bidi text={`עודכן: ${updated}`} style={{ color: colors.muted, fontWeight: '700' }} />
        {children}
        <LegalLinks />
      </ScrollView>
    </View>
  );
}
