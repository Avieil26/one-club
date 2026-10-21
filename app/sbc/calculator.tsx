import { useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ChoiceGroup, Muted, Screen, Title } from '@/components/ui';
import { SbcPointsSolution } from '@/components/SbcPointsSolution';
import { useLanguage } from '@/lib/language';
import { officialChallenges } from '@/lib/sbcCatalog';
import { pointsSegments } from '@/lib/sbcVerified';
import { sbcFace } from '@/lib/sbcTileTheme';
import { isOpen } from '@/lib/selectors';

export default function CalculatorScreen() {
  const { t, language } = useLanguage();
  const params = useLocalSearchParams<{ challenge?: string }>();
  const options = officialChallenges.filter((c) => isOpen(c) && pointsSegments(c.id).length);
  const [id, setId] = useState(params.challenge ?? options[0]?.id ?? '');
  return <Screen scene="sbc">
    <Stack.Screen options={{ title: t('תכנון SBC', 'SBC planner') }} />
    <Title>{t('תכנון השלמת נקודות', 'Plan your remaining points')}</Title>
    <Muted>{t('בחרו את האתגר כדי להתאים את השחקנים והניקוד לדרישות שלו.', 'Choose a challenge to match its player eligibility and item scores.')}</Muted>
    <ChoiceGroup label={t('אתגר', 'Challenge')} options={options.map((c) => ({ id: c.id, label: language === 'en' ? sbcFace(c).en : sbcFace(c).he }))} value={id} onChange={setId} />
    <SbcPointsSolution key={id} challengeId={id} />
  </Screen>;
}
