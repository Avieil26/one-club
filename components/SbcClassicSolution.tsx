import { SbcSurface } from '@/components/SbcSurface';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { ChoiceGroup, colors, Muted } from '@/components/ui';
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
    {segments.length > 1 ? <ChoiceGroup label={t('חלק באתגר', 'Challenge segment')} value={index} options={segments.map((s, i) => ({ id: String(i), label: s.name }))} onChange={setIndex} /> : null}
    <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>{segment.name}</Text>
    {(segment.rules.playerCount ?? 11) === 11 ? <Muted>{t('מערך האתגר: ', 'Challenge formation: ')}{formationById(segment.formation).label}</Muted> : null}
    <Text style={{ color: colors.green, fontWeight: '800' }}>✓ {t('ההרכב עומד בכל הדרישות שנבדקו', 'Squad meets all checked requirements')}</Text>
    <Muted>{t('בחרו את אותו חלק ואת הגרסאות הרגילות שמוצגות כאן. הבדיקה מבוססת על דרישות האתגר; האישור הסופי מופיע במסך ההגשה במשחק.', 'Use the same segment and base versions shown here. Checks follow the challenge requirements; final confirmation appears on the in-game submission screen.')}</Muted>
    {(segment.rules.playerCount ?? 11) < 11 ? <View style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>{Object.values(placedPreview(segment.squad)).map((player) => player ? <View key={player.id} style={{ width: 126, alignItems: 'center', gap: 6 }}><PortraitCard player={player} edition="base" width={116} /><Text style={{ color: colors.text, textAlign: 'center' }}>{language === 'en' ? player.en ?? player.name : player.name}</Text></View> : null)}</View> : <SquadPitch appearance="sbc" formation={formationById(segment.formation)} placed={placedPreview(segment.squad)} playerChem={report.playerChem} showChemHud={false} />}
    <SbcSurface>{report.checks.map((check) => <Text key={check.label} style={{ color: colors.green, textAlign: language === 'he' ? 'right' : 'left' }}>✓ {sbcCheckText(check.label, language)}</Text>)}</SbcSurface>
  </View>;
}
