import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { PortraitCard } from '@/components/PortraitCard';
import { ItemScore } from '@/components/ItemScore';
import { Card, ChoiceGroup, colors, Field, Muted } from '@/components/ui';
import { pointsPlans, pointsSegments, SBC_SOLUTION_CHECKED_AT, type PointsSegment } from '@/lib/sbcVerified';
import { useLanguage } from '@/lib/language';

function SegmentSolution({ segment }: { segment: PointsSegment }) {
  const { t, language } = useLanguage();
  const [platform, setPlatform] = useState<'ps5' | 'pc'>('ps5');
  const [submitted, setSubmitted] = useState('0');
  const [selected, setSelected] = useState('value');
  const [alternatives, setAlternatives] = useState<Record<string, number>>({});
  const number = Number(submitted);
  const validInput = Number.isSafeInteger(number) && number >= 0 && number <= segment.target;
  const plans = useMemo(() => pointsPlans(segment, platform, number), [segment, platform, number]);
  const plan = plans.find((p) => p.key === selected) ?? plans[0];
  const remaining = validInput ? Math.max(0, segment.target - number) : segment.target;
  return <Card>
    <Text style={{ color: colors.text, fontSize: 21, fontWeight: '900' }}>{segment.name}</Text>
    <View style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
      <View style={{ gap: 5 }}><Muted>{t('יעד האתגר', 'Challenge target')}</Muted><ItemScore value={segment.target} size={26} /></View>
      <View style={{ gap: 5 }}><Muted>{t('נותר להשלמה', 'Still needed')}</Muted><ItemScore value={remaining} size={26} /></View>
    </View>
    <Field label={t('נקודות שכבר הגשת במשחק', 'Points already submitted in-game')} value={submitted} onChangeText={setSubmitted} keyboardType="number-pad" />
    {!validInput ? <Muted>{t('הכניסו מספר שלם בין 0 ליעד האתגר.', 'Enter a whole number between zero and the target.')}</Muted> : null}
    <ChoiceGroup label={t('פלטפורמה', 'Platform')} value={platform} options={[{ id: 'ps5', label: 'PS / Xbox' }, { id: 'pc', label: 'PC' }]} onChange={(id) => setPlatform(id as 'ps5' | 'pc')} />
    {plans.length > 1 ? <ChoiceGroup label={t('דרך להשלמה', 'Completion route')} value={plan?.key ?? 'value'} options={plans.map((p) => ({ id: p.key, label: p.key === 'value' ? t('עלות נמוכה מהאפשרויות שנבדקו', 'Lower cost among checked options') : p.key === 'balanced' ? t('איזון בין עלות לכמות', 'Balance cost and item count') : t('פחות קלפים', 'Fewer cards') }))} onChange={setSelected} /> : null}
    {plan ? <View testID="sbc-verified-points-plan" style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }}>
        <View><Muted>{t('סך הניקוד', 'Total points')}</Muted><ItemScore value={plan.total} /></View>
        <View><Muted>{t('כמות קלפים', 'Player items')}</Muted><Text style={{ color: colors.text, fontSize: 20, fontWeight: '900' }}>{plan.count}</Text></View>
        <View><Muted>{t('עלות משוערת במטבעות', 'Estimated coins')}</Muted><Text style={{ color: colors.gold, fontSize: 20, fontWeight: '900' }}>{plan.cost.toLocaleString('en-US')}</Text></View>
      </View>
      <Text style={{ color: colors.green, fontWeight: '800' }}>✓ {t('הקלפים והניקוד נבדקו מול דרישות החלק', 'Items and points checked against this segment’s requirements')}</Text>
      <View style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
        {plan.lines.map((line) => {
          const key = `${segment.eaId}-${platform}-${line.player.rating}`;
          const player = line.alternatives[(alternatives[key] ?? 0) % line.alternatives.length];
          return <View key={key} style={{ width: 148, alignItems: 'center', gap: 7, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: colors.green }}>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>× {line.count}</Text>
            <PortraitCard player={player} edition="base" width={116} />
            <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '800' }}>{language === 'en' ? player.en ?? player.name : player.name}</Text>
            <Muted>{t('גרסה רגילה', 'Base version')} · {player.rating} OVR</Muted>
            <ItemScore value={line.scoreEach} size={16} />
            <Muted>{t('לכל קלף', 'per item')} · ≈ {line.priceEach.toLocaleString('en-US')} {t('מטבעות', 'coins')}</Muted>
            {line.alternatives.length > 1 ? <Pressable accessibilityRole="button" accessibilityLabel={t('שחקן חלופי באותו ניקוד', 'Alternative player with the same score')} onPress={() => setAlternatives((v) => ({ ...v, [key]: (v[key] ?? 0) + 1 }))} style={{ padding: 10 }}><Text style={{ color: colors.link, fontWeight: '800' }}>{t('החלפת שחקן', 'Swap player')} ↔</Text></Pressable> : null}
          </View>;
        })}
      </View>
      <Muted>{t(`עודף מעל היעד: ${plan.total - remaining} נקודות.`, `Above target: ${plan.total - remaining} points.`)}</Muted>
      {plan.lines.some((l) => l.count > 1) ? <Muted>{t('× מציין מספר עותקים של אותה גרסה. מגישים עותקים בשלבים; אין צורך להחזיק את כולם יחד במועדון.', '× means copies of the same version. Submit copies in stages; they do not all need to be in your club at once.')}</Muted> : null}
      <Muted>{t('תכנון השלמה בלבד: סמנו והגישו במשחק. המחירים הם הערכה מתאריך הבדיקה ועשויים להשתנות.', 'Completion plan: select and submit in-game. Prices are estimates from the check date and may change.')}</Muted>
    </View> : <Muted>{validInput && remaining === 0 ? t('לפי הניקוד שהזנתם, הגעתם ליעד.', 'Your entered progress reaches the target.') : t('אין כרגע צירוף שניתן לאמת לחלק הזה.', 'No verifiable combination is available for this segment yet.')}</Muted>}
    <Muted>{t('נבדק: ', 'Checked: ')}{new Date(SBC_SOLUTION_CHECKED_AT).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-GB')}</Muted>
  </Card>;
}
export function SbcPointsSolution({ challengeId }: { challengeId: string }) {
  const segments = pointsSegments(challengeId);
  return <View style={{ gap: 16 }}>{segments.map((segment) => <SegmentSolution key={segment.eaId} segment={segment} />)}</View>;
}
