import { Text, View } from 'react-native';
import { useLanguage } from '@/lib/language';
import type { Season2Card } from '@/lib/season2';

export function Season2Acquisition({ card }: { card: Season2Card }) {
  const { language, t } = useLanguage();
  const rtl = language === 'he';
  const a = card.acquisition;
  const pass = a.kind === 'standard-pass' || a.kind === 'premium-pass';
  const textAlign = rtl ? 'right' as const : 'left' as const;
  return (
    <View testID="season2-acquisition" style={{ gap: 10, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#8D633C', backgroundColor: '#211B17' }}>
      <Text style={{ color: '#C9C3BC', lineHeight: 22, textAlign }}>{[card.position, ...(card.positions ?? [])].join(' / ')} · {card.heightCm} {t('ס״מ', 'cm')} · {card.weightKg} {t('ק״ג', 'kg')} · {t(`גיל ${card.age}`, `Age ${card.age}`)}</Text>
      <Text style={{ color: '#C9C3BC', textAlign }}>{t('סוג האצה', 'Acceleration type')}: {card.accelerate}</Text>
      <Text accessibilityRole="header" style={{ color: '#FFD1A1', fontWeight: '900', fontSize: 20, textAlign }}>{t('איך משיגים את הקלף?', 'How to earn this card')}</Text>
      {pass ? <>
        <Text style={{ color: '#F5F1E9', fontSize: 16, fontWeight: '800', textAlign }}>{a.premium ? 'Season 2 · Premium Pass' : t('עונה 2 · המסלול החינמי', 'Season 2 · Free Standard Pass')}</Text>
        <Text style={{ color: '#FFBB77', fontSize: 22, fontWeight: '900', textAlign }}>{t(`רמה ${a.level} · ${a.seasonPoints!.toLocaleString('en-US')} נקודות עונה (SP)`, `Level ${a.level} · ${a.seasonPoints!.toLocaleString('en-US')} Season Points (SP)`)}</Text>
        <Text style={{ color: '#C9C3BC', lineHeight: 21, textAlign }}>{a.premium ? t('נדרשת גם גישת Premium Pass לעונה 2. נקודות העונה אינן מחיר במטבעות.', 'Season 2 Premium Pass access is also required. Season Points are not a coin price.') : t('פתחו את הרמה באמצעות נקודות עונה וקבלו את הפרס במסלול החינמי.', 'Reach the level with Season Points and claim the reward on the free track.')}</Text>
      </> : a.kind === 'objective' ? <>
        <Text style={{ color: '#F5F1E9', fontWeight: '800', textAlign }}>{a.objectiveName}</Text>
        <Text style={{ color: '#FFD1A1', fontSize: 16, lineHeight: 23, textAlign }}>{t(a.summaryHe!, a.summaryEn!)}</Text>
        <Text style={{ color: '#C9C3BC', textAlign }}>{t('פרס משימות לא סחיר · ללא קנייה במרקט', 'Untradeable objective reward · Earned through gameplay')}</Text>
        {a.tasks?.map((task) => <Text key={task.name} style={{ color: '#E6E1DB', lineHeight: 22, textAlign }}>• {t(task.he, task.en)}</Text>)}
        {a.dependencies?.map((group) => <View key={group.name} style={{ gap: 8, marginTop: 8 }}>
          <Text style={{ color: '#FFD1A1', fontWeight: '800', textAlign }}>{group.name}</Text>
          {group.tasks.map((task) => <Text key={task.name} style={{ color: '#C9C3BC', lineHeight: 22, textAlign }}>• {t(task.he, task.en)}</Text>)}
        </View>)}
      </> : <Text style={{ color: '#E6E1DB', lineHeight: 22, textAlign }}>{t('דרך ההשגה של גרסת הרטרו הזו עדיין לא אומתה. זמינותה במשחק טרם אושרה; אין מחיר שוק מאומת.', 'The acquisition route for this retro version has not yet been verified. In-game availability is unconfirmed; no verified market price is available.')}</Text>}
      {a.kind !== 'unverified' && a.endsAt ? <Text style={{ color: '#AFA69E', fontSize: 12, textAlign }}>{t('זמין עד', 'Available until')} {new Date(a.endsAt).toLocaleString(language === 'he' ? 'he-IL' : 'en-GB', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' })} · {t('שעון ישראל', 'Israel time')}</Text> : null}
    </View>
  );
}
