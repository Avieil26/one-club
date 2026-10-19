import { Stack } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { I18nManager, Platform, ScrollView, Text, View, type TextStyle } from 'react-native';

import { LegalLinks } from '@/components/LegalLinks';
import { SiteNav } from '@/components/SiteNav';
import { colors } from '@/components/ui';
import { useLanguage } from '@/lib/language';
import { legalText } from '@/lib/legalEnglish';
import { inlineLatin, latinParts } from '@/lib/legalBidi';

export { inlineLatin };

const edge = I18nManager.isRTL && Platform.OS !== 'web' ? 'left' : 'right';
export const rtl: TextStyle = { textAlign: edge, writingDirection: 'rtl', alignSelf: 'stretch' };
export const ltr: TextStyle = { textAlign: 'left', writingDirection: 'ltr' };

function Bidi({ text, style, header = false }: { text: string; style?: TextStyle; header?: boolean }) {
  const parts = latinParts(text);
  return (
    <Text accessibilityRole={header ? 'header' : undefined} style={[rtl, style]}>
      {parts.map((part, index) => part.latin
        ? <Text key={index} style={{ writingDirection: 'ltr' }}>{`\u2066${part.value}\u2069`}</Text>
        : <Text key={index}>{part.value}</Text>)}
    </Text>
  );
}

function LegalText({ text, style, header = false }: { text: string; style?: TextStyle; header?: boolean }) {
  const { language } = useLanguage();
  const copy = legalText(text, language);
  if (language === 'en') {
    return <Text accessibilityRole={header ? 'header' : undefined} style={[ltr, style]}>{copy}</Text>;
  }
  return <Bidi text={copy} header={header} style={style} />;
}

export function PrimaryLegalNotice() {
  const { language } = useLanguage();
  const english = language === 'en';
  return (
    <View style={{
      backgroundColor: 'rgba(22, 30, 24, 0.88)', borderColor: 'rgba(227, 179, 65, 0.45)',
      borderTopColor: 'rgba(227, 179, 65, 0.9)', borderWidth: 1, borderRadius: 16, padding: 16,
      gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12,
    }}>
      <View style={{ flexDirection: 'row', direction: english ? 'ltr' : 'rtl', alignItems: 'center' }}>
        <View style={{
          backgroundColor: 'rgba(227, 179, 65, 0.16)', borderColor: 'rgba(227, 179, 65, 0.5)',
          borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4,
          flexDirection: 'row', direction: english ? 'ltr' : 'rtl', alignItems: 'center', gap: 6,
        }}>
          <Text style={{ fontSize: 13 }}>⚖️</Text>
          <Text style={{ color: colors.gold, fontSize: 11.5, fontWeight: '900', width: undefined, writingDirection: english ? 'ltr' : 'rtl' }}>
            {english ? 'LEGAL DISCLAIMER • NON-AFFILIATION' : 'הבהרה משפטית רשמית • LEGAL DISCLAIMER'}
          </Text>
        </View>
      </View>
      {english ? (
        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', lineHeight: 25, ...ltr }}>
          This website and application is an independent fan site and is not affiliated with, endorsed, sponsored, or specifically approved by Electronic Arts Inc. or its affiliates. All game titles, logos, brands, and player images displayed on this site are the intellectual property of their respective owners and are used here under fair use for informational, educational, and community purposes only.
        </Text>
      ) : (
        <>
          <Bidi
            text='אתר זה הינו אתר מעריצים עצמאי ואינו קשור, ממומן, מאושר או נתמך על ידי Electronic Arts Inc. או שותפיה. כל שמות המשחקים, הלוגואים, המותגים ותמונות השחקנים המוצגים באתר הם קניינם הרוחני של בעליהם החוקיים ומשמשים כאן תחת הגדרת "שימוש הוגן" למטרות מידע וקהילה בלבד.'
            style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', lineHeight: 25 }}
          />
          <View style={{ height: 1, backgroundColor: 'rgba(227, 179, 65, 0.25)', marginVertical: 2 }} />
          <View nativeID="legal-en" style={{ gap: 4, direction: 'ltr', width: '100%' }}>
            <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 0.5, ...ltr }}>
              NON-AFFILIATION & FAIR USE NOTICE (ENGLISH)
            </Text>
            <Text style={{ color: '#D1D5DB', fontSize: 13, fontWeight: '500', lineHeight: 21, ...ltr }}>
              This website and application is an independent fan site and is not affiliated with, endorsed, sponsored, or specifically approved by Electronic Arts Inc. or its affiliates. All game titles, logos, brands, and player images displayed on this site are the intellectual property of their respective owners and are used here under fair use for informational, educational, and community purposes only.
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

export function LegalBulletItem({ text }: { text: string }) {
  const { language } = useLanguage();
  const english = language === 'en';
  return (
    <View style={{ flexDirection: 'row', direction: english ? 'ltr' : 'rtl', alignItems: 'flex-start', gap: 8, width: '100%' }}>
      <Text style={{ color: colors.gold, fontSize: 15, lineHeight: 25, fontWeight: '800' }}>•</Text>
      <View style={{ flex: 1 }}>
        <LegalText text={text} style={{ color: colors.text, fontSize: 15, lineHeight: 25, width: undefined }} />
      </View>
    </View>
  );
}

export function LegalSection({ title, body, children }: { title: string; body?: string; children?: ReactNode }) {
  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <LegalText text={title} header style={{ color: colors.gold, fontSize: 18, fontWeight: '900' }} />
      {body ? <LegalText text={body} style={{ color: colors.text, fontSize: 15.5, lineHeight: 26 }} /> : null}
      {children}
    </View>
  );
}

export function LegalScreen({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  const { language } = useLanguage();
  const english = language === 'en';
  const displayTitle = legalText(title, language);
  const displayDate = legalText(updated, language);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const styleId = 'fc27-legal-direction';
    const old = document.getElementById(styleId);
    if (old) old.remove();
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = english
      ? '#legal-doc, #legal-doc * { direction: ltr; text-align: left; } #legal-en, #legal-en * { direction: ltr; text-align: left; }'
      : '#legal-doc { direction: rtl; text-align: right; } #legal-en, #legal-en * { direction: ltr; text-align: left; }';
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, [english]);

  return (
    <View nativeID="legal-doc" style={{ flex: 1, backgroundColor: '#050A08', direction: english ? 'ltr' : 'rtl' }}>
      <Stack.Screen options={{ headerShown: false, title: displayTitle }} />
      <ScrollView contentContainerStyle={{
        paddingHorizontal: 16, paddingBottom: 64, width: '100%', maxWidth: 840, alignSelf: 'center',
        alignItems: 'stretch', direction: english ? 'ltr' : 'rtl', gap: 16,
      }}>
        <SiteNav />
        <LegalText text={title} header style={{ color: colors.text, fontSize: 34, fontWeight: '900' }} />
        <Text style={[english ? ltr : rtl, { color: colors.muted, fontWeight: '700' }]}>
          {english ? `Updated: ${displayDate}` : `עודכן: ${updated}`}
        </Text>
        {children}
        <LegalLinks />
      </ScrollView>
    </View>
  );
}
