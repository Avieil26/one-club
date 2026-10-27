import { Link, Stack } from 'expo-router';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Constants from 'expo-constants';

import { allowDailyMeasurement, useDailyMeasurementPreference } from '@/lib/dailyActivity';
import { SiteNav } from '@/components/SiteNav';
import { colors } from '@/components/ui';
import { AVAILABLE_LANGUAGES, useLanguage, type AppLocale } from '@/lib/language';

export default function SettingsScreen() {
  const { locale, isRTL: rtl, chooseLanguage, t } = useLanguage();
  const measurement = useDailyMeasurementPreference();

  const option = (value: AppLocale, flag: string, title: string, subtitle: string) => {
    const selected = locale === value;
    return (
      <Pressable
        key={value}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => void chooseLanguage(value)}
        style={{
          width: '100%',
          flexDirection: 'row',
          direction: rtl ? 'rtl' : 'ltr',
          alignItems: 'center',
          gap: 14,
          padding: 18,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: selected ? colors.gold : 'rgba(255,255,255,0.12)',
          backgroundColor: selected ? 'rgba(227,179,65,0.12)' : 'rgba(255,255,255,0.025)',
        }}
      >
        <Text style={{ fontSize: 28 }}>{flag}</Text>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '900', textAlign: rtl ? 'right' : 'left' }}>{title}</Text>
          <Text style={{ color: colors.muted, fontSize: 13, textAlign: rtl ? 'right' : 'left' }}>{subtitle}</Text>
        </View>
        <Text style={{ color: selected ? colors.gold : colors.muted, fontWeight: '900' }}>{selected ? '✓' : ''}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ headerShown: false, title: t('הגדרות', 'Settings') }} />
      <SiteNav />
      <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 920, alignSelf: 'center', padding: 20, paddingBottom: 64, gap: 18 }}>
        <Text style={{ color: colors.text, fontSize: 32, fontWeight: '900', textAlign: rtl ? 'right' : 'left' }}>{t('הגדרות', 'Settings')}</Text>
        {Platform.OS !== 'web' ? <Text style={{ color: colors.muted, fontSize: 13, textAlign: rtl ? 'right' : 'left' }}>{t('גרסת אפליקציה', 'App version')} {Constants.expoConfig?.version}</Text> : null}
        <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 24, textAlign: rtl ? 'right' : 'left' }}>
          {t('כאן אפשר לשנות את שפת האתר בכל עת. הבחירה נשמרת גם לביקורים הבאים.', 'Change the site language at any time. Your choice is saved for future visits.')}
        </Text>
        <View style={{ gap: 10 }}>
          {AVAILABLE_LANGUAGES.map(item => option(item.value, item.flag, item.name, item.continuation))}
        </View>
        <View style={{ gap: 12, marginTop: 16 }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', textAlign: rtl ? 'right' : 'left' }}>{t('חשבון ופרטיות', 'Account and privacy')}</Text>
          <Link href="/legal/delete-account" asChild><Pressable accessibilityRole="link" style={{ minHeight: 48, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.gold }}><Text style={{ color: colors.gold, fontSize: 16, fontWeight: '800', textAlign: rtl ? 'right' : 'left' }}>{t('בקשת מחיקת חשבון ונתונים', 'Request account and data deletion')}</Text></Pressable></Link>
        </View>
        <View style={{gap:10,marginTop:16,paddingTop:20,borderTopWidth:1,borderTopColor:'#30404D'}}>
          <Text style={{color:colors.text,fontSize:20,fontWeight:'800',textAlign:rtl?'right':'left'}}>{t('שיפור האתר','Improve the site')}</Text>
          <Text style={{color:colors.muted,lineHeight:23,textAlign:rtl?'right':'left'}}>{t('אפשר לשתף יום שימוש אחד לחשבון מחובר, בלי היסטוריית עמודים ובלי פרסום. כיבוי מפסיק את המדידה במכשיר הזה.','Optionally share one active day per signed-in account, without page history or advertising. Turning this off stops measurement on this device.')}</Text>
          <Pressable accessibilityRole="switch" aria-checked={measurement} accessibilityState={{checked:measurement}} accessibilityLabel={t('מדידת שימוש יומית','Daily usage measurement')} onPress={()=>void allowDailyMeasurement(!measurement)} style={{minHeight:48,borderWidth:1,borderColor:'#50616D',padding:12,borderRadius:6}}><Text style={{color:colors.text,fontWeight:'800',textAlign:rtl?'right':'left'}}>{measurement?t('פעיל · לחצו לכיבוי','On · tap to turn off'):t('כבוי · לחצו להפעלה','Off · tap to turn on')}</Text></Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
