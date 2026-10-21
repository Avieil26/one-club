import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { PortraitCard } from '@/components/PortraitCard';
import { ItemScore } from '@/components/ItemScore';
import { Button, colors, Field, Muted } from '@/components/ui';
import { SbcChoices, SbcSurface } from '@/components/SbcSurface';
import { SbcPlayerSelection } from '@/components/SbcPlayerSelection';
import { pointsPlans, pointsSegments, SBC_SOLUTION_CHECKED_AT, type PointsSegment } from '@/lib/sbcVerified';
import { selectedItems, selectedScore, type ItemBasket } from '@/lib/sbcItemScore';
import { uniquePointsPlan } from '@/lib/sbcPointOptions';
import { useLanguage } from '@/lib/language';
import { playerDisplayName } from '@/lib/playerDisplayName';

function SegmentSolution({ segment }: { segment: PointsSegment }) {
  const { t, language } = useLanguage();
  const [platform, setPlatform] = useState<'ps5' | 'pc'>('ps5');
  const [submitted, setSubmitted] = useState('0');
  const [selected, setSelected] = useState('value');
  const [mode, setMode] = useState('suggestions');
  const [basket, setBasket] = useState<ItemBasket>({});
  const [alternatives, setAlternatives] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState(12);
  const number = Number(submitted);
  const validInput = Number.isSafeInteger(number) && number >= 0 && number <= segment.target;
  const items = useMemo(() => selectedItems(segment, basket), [segment, basket]);
  const ownScore = selectedScore(items);
  const remaining = validInput ? Math.max(0, segment.target - number - ownScore) : segment.target;
  const plans = useMemo(() => {
    if (!validInput || remaining === 0) return [];
    const submittedAndSelected = number + ownScore;
    const suggestions = pointsPlans(segment, platform, submittedAndSelected);
    const unique = uniquePointsPlan(segment, platform, submittedAndSelected, basket);
    return unique ? [...suggestions, unique] : suggestions;
  }, [segment, platform, number, ownScore, validInput, remaining, basket]);
  const plan = plans.find((p) => p.key === selected) ?? plans[0];
  const completion = validInput ? Math.min(100, ((number + ownScore) / segment.target) * 100) : 0;
  return <SbcSurface>
    <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>{segment.name}</Text>
    <View style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
      <View style={{ gap: 5 }}><Muted>{t('יעד האתגר', 'Challenge target')}</Muted><ItemScore value={segment.target} size={24} /></View>
      <View testID="sbc-selected-score" style={{ gap: 5 }}><Muted>{t('נקודות מהבחירה שלך', 'Points from your items')}</Muted><ItemScore value={ownScore} size={24} /></View>
      <View testID="sbc-score-remaining" style={{ gap: 5 }}><Muted>{t('נותר להשלמה', 'Still needed')}</Muted><ItemScore value={remaining} size={24} /></View>
    </View>
    <View accessibilityRole="progressbar" accessibilityLabel={t('התקדמות בתכנון ההשלמה', 'Planned completion progress')} accessibilityValue={{ min: 0, max: segment.target, now: validInput ? Math.min(segment.target, number + ownScore) : 0 }} style={{ height: 5, width: '100%', borderRadius: 3, overflow: 'hidden', backgroundColor: '#3D4556', direction: 'ltr' }}><View style={{ height: 5, width: `${completion}%`, backgroundColor: '#D1B77C' }} /></View>
    <Field label={t('נקודות שכבר הגשת במשחק', 'Points already submitted in-game')} value={submitted} onChangeText={setSubmitted} keyboardType="number-pad" />
    {!validInput ? <Muted>{t('הכניסו מספר שלם בין 0 ליעד האתגר.', 'Enter a whole number between zero and the target.')}</Muted> : null}
    <SbcChoices label={t('פלטפורמה', 'Platform')} value={platform} options={[{ id: 'ps5', label: 'PS / Xbox' }, { id: 'pc', label: 'PC' }]} onChange={(id) => setPlatform(id as 'ps5' | 'pc')} />
    <SbcChoices label={t('איך תרצו להשלים?', 'How would you like to complete it?')} value={mode} options={[{ id: 'suggestions', label: t('פתרונות להשלמה', 'Completion options') }, { id: 'my-items', label: t('בחירת שחקנים שיש לי', 'Choose players I own') }]} onChange={setMode} />
    {mode === 'my-items' ? <SbcPlayerSelection segment={segment} basket={basket} onChange={setBasket} /> : <View style={{ gap: 16 }}>
      {ownScore > 0 ? <Muted>{t('הפתרונות משלימים את היתרה אחרי הקלפים שכבר בחרת.', 'Options cover what remains after your selected items.')}</Muted> : null}
      {plans.length > 1 ? <SbcChoices label={t('דרך להשלמה', 'Completion route')} value={plan?.key ?? 'value'} options={plans.map((p) => ({ id: p.key, label: p.key === 'value' ? t('עלות נמוכה מהאפשרויות שנבדקו', 'Lower cost among checked options') : p.key === 'balanced' ? t('איזון בין עלות לכמות', 'Balance cost and item count') : p.key === 'unique' ? t('שחקנים שונים ללא כפילויות', 'Different players, no duplicates') : t('פחות קלפים', 'Fewer cards') }))} onChange={(key) => { setSelected(key); setVisible(12); }} /> : null}
      {plan ? <View testID="sbc-verified-points-plan" style={{ gap: 16 }}>
        <View style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 18, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#455167' }}>
          <View><Muted>{t('ניקוד הפתרון', 'Option points')}</Muted><ItemScore value={plan.total} /></View>
          <View><Muted>{t('כמות קלפים', 'Player items')}</Muted><Text style={{ color: colors.text, fontSize: 20, fontWeight: '900' }}>{plan.count}</Text></View>
          {plan.priceKnown !== false ? <View><Muted>{t('עלות משוערת במטבעות', 'Estimated coins')}</Muted><Text style={{ color: colors.gold, fontSize: 20, fontWeight: '900' }}>{plan.cost.toLocaleString('en-US')}</Text></View> : null}
        </View>
        <Text style={{ color: colors.green, fontWeight: '800' }}>✓ {t('הקלפים והניקוד נבדקו מול דרישות החלק', 'Items and points checked against this segment’s requirements')}</Text>
        {plan.priceKnown === false ? <Muted>{t('אפשרות עם שחקנים שונים. העלות תלויה בקלפים שכבר יש לכם ובמחירי השוק שלהם.', 'A distinct-player option. Cost depends on which items you own and their market prices.')}</Muted> : null}
        <View style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
          {plan.lines.slice(0, visible).map((line) => {
            const key = `${segment.eaId}-${platform}-${plan.key}-${line.player.id}`;
            const player = line.alternatives.find((p) => p.id === alternatives[key]) ?? line.player;
            return <View key={key} style={{ width: 136, alignItems: 'center', gap: 7, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#786A4B' }}>
              <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>× {line.count}</Text>
              <PortraitCard player={player} edition="base" width={108} />
              <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '800' }}>{playerDisplayName(player, language)}</Text>
              <Muted>{t('גרסה רגילה', 'Base version')} · {player.rating} OVR</Muted>
              <ItemScore value={line.scoreEach} size={16} />
              <Muted>{t('לכל קלף', 'per item')}{line.priceEach > 0 ? ` · ≈ ${line.priceEach.toLocaleString('en-US')} ${t('מטבעות', 'coins')}` : ''}</Muted>
              {line.alternatives.length > 1 ? <Pressable accessibilityRole="button" accessibilityLabel={t('שחקן חלופי באותו ניקוד', 'Alternative player with the same score')} onPress={() => { const index = line.alternatives.findIndex((p) => p.id === player.id); setAlternatives((v) => ({ ...v, [key]: line.alternatives[(index + 1) % line.alternatives.length].id })); }} style={{ padding: 10 }}><Text style={{ color: colors.link, fontWeight: '800' }}>{t('החלפת שחקן', 'Swap player')} ↔</Text></Pressable> : null}
            </View>;
          })}
        </View>
        {plan.lines.length > visible ? <Button label={t(`הצגת עוד קלפים · ${plan.lines.length - visible} נותרו`, `Show more items · ${plan.lines.length - visible} remaining`)} variant="ghost" onPress={() => setVisible((n) => n + 12)} /> : null}
        <Muted>{t(`עודף מעל היעד: ${plan.total - remaining} נקודות.`, `Above target: ${plan.total - remaining} points.`)}</Muted>
        <Button label={t('בחירת הפתרון ועריכת הקלפים', 'Use this option and edit items')} variant="gold" onPress={() => {
          const next = { ...basket };
          for (const line of plan.lines) {
            const key = `${segment.eaId}-${platform}-${plan.key}-${line.player.id}`;
            const player = line.alternatives.find((p) => p.id === alternatives[key]) ?? line.player;
            next[player.id] = (next[player.id] ?? 0) + line.count;
          }
          setBasket(next); setMode('my-items');
        }} />
        {plan.lines.some((l) => l.count > 1) ? <Muted>{t('× מציין מספר עותקים. אפשר לבחור בדרך ללא כפילויות או להוסיף שחקנים שיש לכם בחיפוש.', '× means copies. Choose the distinct-player option or add items you own using search.')}</Muted> : null}
        <Muted>{t('בחרו והגישו את הקלפים במשחק. מחירים מוצגים כהערכה מתאריך הבדיקה ועשויים להשתנות.', 'Select and submit the items in-game. Displayed prices are estimates from the check date and may change.')}</Muted>
      </View> : null}
    </View>}
    {validInput && remaining === 0 ? <Text style={{ color: colors.green, fontWeight: '800' }}>{ownScore > 0 ? t('הבחירה מכסה את הניקוד שנותר. בדקו והגישו במשחק.', 'Your selection covers the remaining score. Review and submit in-game.') : t('לפי הניקוד שהזנתם, הגעתם ליעד.', 'Your entered progress reaches the target.')}</Text> : null}
    <Muted>{t('נבדק: ', 'Checked: ')}{new Date(SBC_SOLUTION_CHECKED_AT).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-GB')}</Muted>
  </SbcSurface>;
}
export function SbcPointsSolution({ challengeId }: { challengeId: string }) {
  const segments = pointsSegments(challengeId);
  return <View style={{ gap: 16 }}>{segments.map((segment) => <SegmentSolution key={segment.eaId} segment={segment} />)}</View>;
}
