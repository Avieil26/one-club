import { SbcChoices, SbcSurface, SbcText } from '@/components/SbcSurface';
import { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { colors, Muted } from '@/components/ui';
import { PortraitCard } from '@/components/PortraitCard';
import { SquadPitch } from '@/components/SquadPitch';
import { formationById } from '@/lib/chemistry';
import { classicSegments, checkClassicSquad } from '@/lib/sbcClassic';
import { placedPreview } from '@/lib/sbcCatalog';
import { sbcCheckText } from '@/lib/sbcLocalization';
import { useLanguage } from '@/lib/language';

export function SbcClassicSolution({ challengeId }: { challengeId: string }) {
  const { t, language } = useLanguage();
  const [index, setIndex] = useState('0');
  const segments = classicSegments(challengeId);
  const segment = segments[Number(index)] ?? segments[0];
  if (!segment?.squad) return null;
  const report = checkClassicSquad(segment, segment.formation, segment.squad);
  if (!report.ready) return null;
  return <View testID="sbc-checked-classic" style={{ gap: 14 }}>
    {segments.length > 1 ? <SbcChoices label={t('חלק באתגר', 'Challenge segment')} value={index} options={segments.map((s, i) => ({ id: String(i), label: s.name }))} onChange={setIndex} /> : null}
    <SbcText tone="heading">{segment.name}</SbcText>
    {(segment.rules.playerCount ?? 11) === 11 || segment.activeSlots ? <Muted>{t('מערך האתגר: ', 'Challenge formation: ')}{formationById(segment.formation).label}</Muted> : null}
    <SbcText tone="label">✓ {t('ההרכב עומד בכל הדרישות שנבדקו', 'Squad meets all checked requirements')}</SbcText>
    <Muted>{t('בחרו את אותו חלק ואת הגרסאות הרגילות שמוצגות כאן. הבדיקה מבוססת על דרישות האתגר; האישור הסופי מופיע במסך ההגשה במשחק.', 'Use the same segment and base versions shown here. Checks follow the challenge requirements; final confirmation appears on the in-game submission screen.')}</Muted>
    {(segment.rules.playerCount ?? 11) < 11 && !segment.activeSlots ? <View style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>{Object.values(placedPreview(segment.squad)).map((player) => player ? <View key={player.id} style={{ width: 126, alignItems: 'center', gap: 6 }}><PortraitCard player={player} edition="base" width={116} /><Text style={{ color: colors.text, textAlign: 'center' }}>{language === 'en' ? player.en ?? player.name : player.name}</Text></View> : null)}</View> : <SquadPitch activeSlots={segment.activeSlots} appearance="sbc" formation={formationById(segment.formation)} placed={placedPreview(segment.squad)} playerChem={report.playerChem} showChemHud={false} />}
    {segment.provenance === 'local-validated-example' ? <Muted>{t('דוגמה שנבנתה באתר לפי דרישות FUTBIN ו־FUT.GG ונבדקה מול כל הכללים. אינה הבטחה למחיר הנמוך ביותר.', 'Example assembled here against FUTBIN and FUT.GG requirements and checked against every rule. No lowest-price claim.')}</Muted> : null}
    {segment.sourceUrl ? <Text accessibilityRole="link" onPress={() => void Linking.openURL(segment.solutionUrl ?? segment.sourceUrl!)} style={{ color: colors.green }}>{t('מקור הדרישות והפתרון', 'Requirements and solution source')} · FUT.GG</Text> : null}
    {segment.checkedAt ? <Muted>{t('נבדק: ', 'Checked: ')}{new Date(segment.checkedAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-GB')}</Muted> : null}
    <SbcSurface>{report.checks.map((check) => <Text key={check.label} style={{ color: colors.green, textAlign: language === 'he' ? 'right' : 'left' }}>✓ {sbcCheckText(check.label, language)}</Text>)}</SbcSurface>
  </View>;
}
