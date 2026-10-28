import { useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { PortraitCard } from '@/components/PortraitCard';
import { ItemScore } from '@/components/ItemScore';
import { Button, Field } from '@/components/ui';
import { SbcChoices, SbcSurface, SbcText } from '@/components/SbcSurface';
import { SbcPlayerSelection } from '@/components/SbcPlayerSelection';
import { pointsEligibilityLabel } from '@/lib/sbcEligibility';
import { pointsPlans, pointsSegments, type PointsSegment } from '@/lib/sbcVerified';
import { selectedItems, selectedScore, type ItemBasket } from '@/lib/sbcItemScore';
import { uniquePointsPlan } from '@/lib/sbcPointOptions';
import { pricePointsItems } from '@/lib/sbcPlanPrices';
import { marketQuote, useMarketPrices } from '@/lib/marketPrices';
import { useLanguage } from '@/lib/language';
import { playerDisplayName } from '@/lib/playerDisplayName';

function Coins({ value }: { value: number }) {
  return <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 7 }}>
    <Image source={require('@/assets/images/market-coin.png')} accessibilityLabel="Coins" style={{ width: 20, height: 20 }} resizeMode="contain" />
    <Text style={{ color: '#F5E2B7', fontSize: 20, lineHeight: 27, fontWeight: '700', fontVariant: ['tabular-nums'] }}>≈ {value.toLocaleString('en-US')}</Text>
  </View>;
}
function SegmentSolution({ segment }: { segment: PointsSegment }) {
  const { t, language } = useLanguage();
  useMarketPrices();
  const [platform, setPlatform] = useState<'ps5' | 'pc'>('ps5');
  const [submitted, setSubmitted] = useState('0');
  const [showProgress, setShowProgress] = useState(false);
  const [selected, setSelected] = useState('value');
  const [mode, setMode] = useState('my-items');
  const [basket, setBasket] = useState<ItemBasket>({});
  const [alternatives, setAlternatives] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState(12);
  const number = Number(submitted);
  const validInput = Number.isSafeInteger(number) && number >= 0 && number <= segment.target;
  const items = useMemo(() => selectedItems(segment, basket), [segment, basket]);
  const ownScore = selectedScore(items);
  const remaining = validInput ? Math.max(0, segment.target - number - ownScore) : segment.target;
  // Suggestions are previews only. They never change or assume ownership of a manual item.
  const plans = useMemo(() => {
    if (mode !== 'suggestions' || !validInput || number >= segment.target) return [];
    const suggestions = pointsPlans(segment, platform, number);
    const unique = uniquePointsPlan(segment, platform, number, {});
    return unique ? [...suggestions, unique] : suggestions;
  }, [segment, platform, number, validInput, mode]);
  const plan = plans.find((p) => p.key === selected) ?? plans[0];
  const planLines = plan?.lines.map((line) => {
    const key = `${segment.eaId}-${platform}-${plan.key}-${line.player.id}`;
    const player = line.alternatives.find((p) => p.id === alternatives[key]) ?? line.player;
    return { ...line, key, player };
  }) ?? [];
  const prices = pricePointsItems(planLines.map((line) => ({ id: line.player.id, count: line.count })), (id) => {
    const quote = marketQuote(id);
    return platform === 'pc' ? quote?.pc : quote?.console;
  });
  const completion = validInput ? Math.min(100, ((number + ownScore) / segment.target) * 100) : 0;
  const row = language === 'he' ? 'row-reverse' : 'row';
  function reset() { setBasket({}); setSubmitted('0'); setShowProgress(false); }
  return <SbcSurface>
    <View style={{ gap: 6 }}><SbcText tone="title" testID="sbc-points-heading">{segment.name}</SbcText><SbcText tone="caption">{pointsEligibilityLabel(segment.requirements, language)}</SbcText></View>
    <SbcChoices label={t('איך תרצו להשלים?', 'How would you like to complete it?')} value={mode} options={[{ id: 'my-items', label: t('בנייה עצמית', 'Build my own') }, { id: 'suggestions', label: t('פתרונות מוכנים', 'Ready-made options') }]} onChange={setMode} />
    {mode === 'my-items' ? <>
      <View testID="sbc-manual-summary" style={{ flexDirection: row, flexWrap: 'wrap', gap: 18, paddingVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#536078' }}>
        <View style={{ flexGrow: 1, gap: 7, alignItems: language === 'he' ? 'flex-end' : 'flex-start' }}><SbcText tone="caption">{t('יעד האתגר', 'Challenge target')}</SbcText><ItemScore value={segment.target} size={24} /></View>
        <View testID="sbc-selected-score" style={{ flexGrow: 1, gap: 7, alignItems: language === 'he' ? 'flex-end' : 'flex-start' }}><SbcText tone="caption">{t('הניקוד שלך', 'Your selected points')}</SbcText><ItemScore value={ownScore} size={24} /></View>
        <View testID="sbc-score-remaining" style={{ flexGrow: 1, gap: 7, alignItems: language === 'he' ? 'flex-end' : 'flex-start' }}><SbcText tone="caption">{t('נותר להשלמה', 'Still needed')}</SbcText><ItemScore value={remaining} size={24} /></View>
      </View>
      <View accessibilityRole="progressbar" accessibilityLabel={t('התקדמות בתכנון ההשלמה', 'Planned completion progress')} accessibilityValue={{ min: 0, max: segment.target, now: validInput ? Math.min(segment.target, number + ownScore) : 0 }} style={{ height: 5, width: '100%', borderRadius: 3, overflow: 'hidden', backgroundColor: '#3D4556', direction: 'ltr' }}><View style={{ height: 5, width: `${completion}%`, backgroundColor: '#D1B77C' }} /></View>
      <SbcPlayerSelection segment={segment} basket={basket} onChange={setBasket} onReset={reset} />
      {validInput && remaining === 0 ? <SbcText tone="label">{ownScore > 0 ? t('הבחירה שלך מכסה את הניקוד הדרוש. בדקו והגישו במשחק.', 'Your selection covers the required points. Review and submit in-game.') : t('לפי הניקוד שהזנתם, הגעתם ליעד.', 'Your entered progress reaches the target.')}</SbcText> : null}
    </> : <View style={{ gap: 20 }}>
      <SbcText>{t('אלו הצעות לצפייה. שום קלף לא נוסף לבחירה העצמית שלך.', 'These are suggestions to browse. No items are added to your own selection.')}</SbcText>
      <SbcChoices label={t('פלטפורמה למחירים', 'Price platform')} value={platform} options={[{ id: 'ps5', label: 'PS / Xbox' }, { id: 'pc', label: 'PC' }]} onChange={(id) => setPlatform(id as 'ps5' | 'pc')} />
      {plans.length > 1 ? <SbcChoices label={t('אפשרויות פתרון', 'Solution options')} value={plan?.key ?? 'value'} options={plans.map((p) => ({ id: p.key, label: p.key === 'value' ? t('שילוב קלפים', 'Item combination') : p.key === 'balanced' ? t('שילוב חלופי', 'Alternative combination') : p.key === 'unique' ? t('שחקנים שונים ללא כפילויות', 'Different players, no duplicates') : p.key.startsWith('verified-') ? `${p.count} ${t('קלפים', 'items')}` : t('פחות קלפים', 'Fewer cards') }))} onChange={(key) => { setSelected(key); setVisible(12); }} /> : null}
      {[80, 81, 82, 90, 910, 911, 920, 921].includes(segment.eaId) ? <SbcText tone="caption">{t('מקסימום 30 קלפים בכל הגשה. פתרונות ארוכים מגישים בכמה שלבים. סדר ההצעות מבוסס על מחירי 26 באוקטובר; המחירים המוצגים הם הערכות שעשויות להשתנות.', 'Submit at most 30 items at a time; longer options need multiple submissions. Suggestion ordering uses prices from October 26; displayed prices are estimates and may change.')}</SbcText> : null}
      {plan ? <View testID="sbc-verified-points-plan" style={{ gap: 20 }}>
        <View style={{ flexDirection: row, flexWrap: 'wrap', gap: 20, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#536078' }}>
          <View style={{ gap: 6 }}><SbcText tone="caption">{t('ניקוד הפתרון', 'Option points')}</SbcText><ItemScore value={plan.total} size={24} /></View>
          <View style={{ gap: 6 }}><SbcText tone="caption">{t('כמות קלפים', 'Player items')}</SbcText><SbcText tone="heading">{plan.count}</SbcText></View>
          <View testID="sbc-plan-price" style={{ gap: 6 }}><SbcText tone="caption">{t('עלות השחקנים המשוערת', 'Estimated player cost')}</SbcText>{prices.total !== null ? <Coins value={prices.total} /> : <SbcText>{t('חסרים מחירים לחישוב מלא', 'Some prices are unavailable')}</SbcText>}</View>
        </View>
        <SbcText tone="label">{t('הקלפים והניקוד עומדים בדרישות החלק', 'Items and points meet this segment’s requirements')}</SbcText>
        <View style={{ flexDirection: row, flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {planLines.slice(0, visible).map((line, index) => {
            const price = prices.lines[index];
            return <View key={line.key} testID="sbc-option-card" style={{ flexBasis: '46%', flexGrow: 1, minWidth: 128, maxWidth: 210, alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#536078', backgroundColor: '#152030' }}>
              <View style={{ direction: 'ltr' }}><PortraitCard player={line.player} edition="base" width={118} /></View>
              <SbcText tone="label" center>{playerDisplayName(line.player, language)}</SbcText>
              <SbcText tone="caption" center>{t('גרסה רגילה', 'Base version')} · {line.player.rating} OVR · × {line.count}</SbcText>
              <ItemScore value={line.scoreEach} size={20} />
              <SbcText tone="caption" center>{t('נקודות לכל קלף', 'Points per item')}</SbcText>
              <View testID="sbc-option-unit-price" style={{ alignItems: 'center', gap: 5, alignSelf: 'stretch', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#46546B' }}>
                <SbcText tone="caption" center>{t('מחיר משוער לשחקן', 'Estimated price per item')}</SbcText>
                {price.unit !== null ? <Coins value={price.unit} /> : <SbcText center>{t('מחיר לא זמין', 'Price unavailable')}</SbcText>}
                {line.count > 1 && price.total !== null ? <SbcText tone="caption" center>{t(`לכל ${line.count} העותקים: ≈ ${price.total.toLocaleString('en-US')}`, `All ${line.count} copies: ≈ ${price.total.toLocaleString('en-US')}`)}</SbcText> : null}
              </View>
              {line.alternatives.length > 1 ? <Pressable accessibilityRole="button" accessibilityLabel={t('שחקן חלופי באותו ניקוד', 'Alternative player with the same score')} onPress={() => { const i = line.alternatives.findIndex((p) => p.id === line.player.id); setAlternatives((v) => ({ ...v, [line.key]: line.alternatives[(i + 1) % line.alternatives.length].id })); }} style={{ minHeight: 44, padding: 10, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#F5E2B7', fontSize: 15, fontWeight: '700' }}>{t('החלפת שחקן', 'Swap player')} ↔</Text></Pressable> : null}
            </View>;
          })}
        </View>
        {plan.lines.length > visible ? <Button label={t(`הצגת עוד קלפים · ${plan.lines.length - visible} נותרו`, `Show more items · ${plan.lines.length - visible} remaining`)} variant="ghost" onPress={() => setVisible((n) => n + 12)} /> : null}
        <SbcText tone="caption">{t(`עודף מעל היעד: ${plan.total - (segment.target - number)} נקודות.`, `Above target: ${plan.total - (segment.target - number)} points.`)}</SbcText>
        {plan.lines.some((l) => l.count > 1) ? <SbcText>{t('× מציין מספר עותקים. לחלופה בלי כפילויות בחרו בשחקנים שונים.', '× means copies. For an option without duplicates, choose different players.')}</SbcText> : null}
        <SbcText tone="caption">{t('העלות היא סכום מחירי השחקנים שמוצגים, לפי הפלטפורמה שבחרתם. זו הערכה שעשויה להשתנות בשוק. קלפים שכבר יש לכם אינם מחייבים קנייה.', 'Cost is the sum of the displayed player prices for your chosen platform. Market estimates can change. Items you already own do not require a purchase.')}</SbcText>
      </View> : validInput && number >= segment.target ? <SbcText>{t('לפי הניקוד שהזנתם, הגעתם ליעד.', 'Your entered progress reaches the target.')}</SbcText> : null}
    </View>}
    <View style={{ gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#536078' }}>
      <Button label={showProgress ? t('סגירת הניקוד שכבר הוגש', 'Hide submitted progress') : t('כבר הגשת נקודות במשחק?', 'Already submitted points in-game?')} variant="ghost" onPress={() => setShowProgress((v) => !v)} />
      {showProgress ? <Field tone="sbc" label={t('נקודות שכבר הגשת במשחק', 'Points already submitted in-game')} value={submitted} onChangeText={setSubmitted} keyboardType="number-pad" /> : null}
      {number > 0 && validInput ? <SbcText>{t(`הוגשו במשחק: ${number.toLocaleString('en-US')} נקודות.`, `Submitted in-game: ${number.toLocaleString('en-US')} points.`)}</SbcText> : null}
      {!validInput ? <SbcText>{t('הכניסו מספר שלם בין 0 ליעד האתגר.', 'Enter a whole number between zero and the target.')}</SbcText> : null}
    </View>
  </SbcSurface>;
}
export function SbcPointsSolution({ challengeId }: { challengeId: string }) {
  const segments = pointsSegments(challengeId);
  return <View style={{ gap: 16 }}>{segments.map((segment) => <SegmentSolution key={segment.eaId} segment={segment} />)}</View>;
}
