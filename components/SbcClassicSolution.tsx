import { useState } from 'react';
import { Text, View } from 'react-native';
import { Card, ChoiceGroup, colors, Muted } from '@/components/ui';
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
    {segments.length > 1 ? <ChoiceGroup label={t('חלק באתגר', 'Challenge segment')} value={index} options={segments.map((s, i) => ({ id: String(i), label: s.name }))} onChange={setIndex} /> : null}
    <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>{segment.name}</Text>
    <Text style={{ color: colors.green, fontWeight: '800' }}>✓ {t('ההרכב עומד בכל הדרישות שנבדקו', 'Squad meets all checked requirements')}</Text>
    <Muted>{t('הרכב לדוגמה עם גרסאות רגילות. יש לבחור את אותו חלק ואת אותן גרסאות במשחק. זה אינו אישור הגשה מ־EA או הבטחה למחיר הנמוך ביותר.', 'Example squad using base versions. Select the same segment and versions in-game. This is not an EA submission confirmation or a lowest-price guarantee.')}</Muted>
    <SquadPitch formation={formationById(segment.formation)} placed={placedPreview(segment.squad)} playerChem={report.playerChem} showChemHud={false} />
    <Card>{report.checks.map((check) => <Text key={check.label} style={{ color: colors.green, textAlign: language === 'he' ? 'right' : 'left' }}>✓ {sbcCheckText(check.label, language)}</Text>)}</Card>
  </View>;
}
