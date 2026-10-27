import { SbcChoices, SbcSurface, SbcText } from '@/components/SbcSurface';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { colors, Muted } from '@/components/ui';
import { PortraitCard } from '@/components/PortraitCard';
import { SquadPitch } from '@/components/SquadPitch';
import { formationById } from '@/lib/chemistry';
import { classicSegments, checkClassicSquad } from '@/lib/sbcClassic';
import { placedPreview } from '@/lib/sbcCatalog';
import { sbcCheckText } from '@/lib/sbcLocalization';
import { useLanguage } from '@/lib/language';

export function SbcClassicSolution({ challengeId }: { challengeId: string }) {
  const { t, language, locale, isRTL } = useLanguage();
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
    <SbcText tone="label">✓ {t('ההרכב עומד בדרישות האתגר', 'Squad meets challenge requirements')}</SbcText>
    <Muted>{t('השתמשו בגרסאות הרגילות ובמיקומים המוצגים.', 'Use the base versions and positions shown.')}</Muted>
    {(segment.rules.playerCount ?? 11) < 11 && !segment.activeSlots ? <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>{Object.values(placedPreview(segment.squad)).map((player) => player ? <View key={player.id} style={{ width: 126, alignItems: 'center', gap: 6 }}><PortraitCard player={player} edition="base" width={116} /><Text style={{ color: colors.text, textAlign: 'center' }}>{language === 'en' ? player.en ?? player.name : player.name}</Text></View> : null)}</View> : <SquadPitch activeSlots={segment.activeSlots} appearance="sbc" formation={formationById(segment.formation)} placed={placedPreview(segment.squad)} playerChem={report.playerChem} showChemHud={false} />}
    <SbcSurface>{report.checks.map((check) => <Text key={check.label} style={{ color: colors.green, textAlign: isRTL ? 'right' : 'left' }}>✓ {sbcCheckText(check.label, locale)}</Text>)}</SbcSurface>
  </View>;
}
