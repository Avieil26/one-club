import { useDeferredValue, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { PortraitCard } from '@/components/PortraitCard';
import { ItemScore } from '@/components/ItemScore';
import { Button, Field } from '@/components/ui';
import { SbcText } from '@/components/SbcSurface';
import { itemScore, searchPointPlayers, selectedItems, type ItemBasket } from '@/lib/sbcItemScore';
import type { PointsSegment } from '@/lib/sbcVerified';
import { useLanguage } from '@/lib/language';
import { playerDisplayName } from '@/lib/playerDisplayName';

export function SbcPlayerSelection({ segment, basket, onChange, onReset }: { segment: PointsSegment; basket: ItemBasket; onChange: (next: ItemBasket) => void; onReset: () => void }) {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => deferredQuery.trim() ? searchPointPlayers(segment, deferredQuery, 8) : [], [segment, deferredQuery]);
  const items = useMemo(() => selectedItems(segment, basket), [segment, basket]);
  const [visible, setVisible] = useState(12);
  const row = language === 'he' ? 'row-reverse' : 'row';
  function quantity(id: string, change: number) {
    const next = { ...basket }, count = Math.min(10000, Math.max(0, (next[id] ?? 0) + change));
    if (count) next[id] = count; else delete next[id];
    onChange(next);
  }
  return <View style={{ gap: 20, direction: 'ltr' }}>
    <View style={{ gap: 5 }}>
      <SbcText tone="heading">{t('בונים את הפתרון שלך', 'Build your own solution')}</SbcText>
      <SbcText>{t('מתחילים בלי קלפים ועם 0 נקודות. חפשו שחקן והוסיפו רק את הקלפים שבחרתם בעצמכם.', 'Start with no items and 0 points. Search for a player and add only the items you choose.')}</SbcText>
    </View>
    <Field tone="sbc" label={t('חיפוש שחקן להשלמה', 'Find a player for this SBC')} value={query} onChangeText={setQuery} placeholder={t('שם שחקן בעברית, באנגלית או דירוג', 'Player name or rating')} />
    <SbcText tone="caption">{t('מוצגות גרסאות רגילות שעומדות בדרישות החלק. הניקוד שייך לגרסת הקלף שמוצגת.', 'Results show base versions that meet this segment’s requirements. Points belong to the version shown.')}</SbcText>
    <View testID="sbc-player-search-results" style={{ flexDirection: row, flexWrap: 'wrap', gap: 12 }}>
      {results.map((player) => {
        const name = playerDisplayName(player, language);
        return <View key={player.id} testID="sbc-search-card" style={{ flexBasis: '46%', flexGrow: 1, maxWidth: 210, minWidth: 128, alignItems: 'center', gap: 10, padding: 10, backgroundColor: '#141E2D', borderWidth: 1, borderColor: '#536078', borderRadius: 10 }}>
          <View style={{ direction: 'ltr' }}><PortraitCard player={player} edition="base" width={118} /></View>
          <SbcText tone="label" center>{name}</SbcText>
          <SbcText tone="caption" center>{player.rating} OVR · {t('גרסה רגילה', 'Base version')}</SbcText>
          <ItemScore value={itemScore(player)!} size={20} />
          <Pressable accessibilityRole="button" accessibilityLabel={t(`הוספת ${name}`, `Add ${name}`)} onPress={() => quantity(player.id, 1)} style={{ alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', minHeight: 46, borderRadius: 6, borderWidth: 1, borderColor: '#CBB581', backgroundColor: '#333746' }}><Text style={{ color: '#F5E2B7', fontSize: 15, fontWeight: '700' }}>{t('הוספה לבחירה', 'Add item')} ＋</Text></Pressable>
          {basket[player.id] ? <SbcText tone="caption" center>{t(`בבחירה: ${basket[player.id]}`, `Selected: ${basket[player.id]}`)}</SbcText> : null}
        </View>;
      })}
    </View>
    {deferredQuery.trim() && !results.length ? <SbcText>{t('לא נמצאו קלפים רגילים שמתאימים לדרישות החלק.', 'No matching base items meet this segment’s requirements.')}</SbcText> : null}
    <View style={{ gap: 16, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#536078' }}>
      <SbcText tone="heading" testID="sbc-selection-heading">{t('הקלפים שבחרת', 'Your selected items')} · {items.reduce((sum, item) => sum + item.count, 0)}</SbcText>
      {!items.length ? <View testID="sbc-empty-selection" style={{ gap: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: '#68768D', borderRadius: 10, padding: 24, alignItems: 'center', backgroundColor: '#121B29' }}><ItemScore value={0} size={26} /><SbcText center>{t('הבחירה שלך ריקה', 'Your selection is empty')}</SbcText><SbcText tone="caption" center>{t('חפשו למעלה שחקן. כל קלף שתוסיפו יופיע כאן עם הניקוד שלו.', 'Search above for a player. Each item you add will appear here with its points.')}</SbcText></View> : null}
      <View testID="sbc-selected-items" style={{ flexDirection: row, flexWrap: 'wrap', gap: 12 }}>
        {items.slice(0, visible).map((item) => {
          const name = playerDisplayName(item.player, language);
          return <View key={item.player.id} testID="sbc-selected-card" style={{ flexBasis: '46%', flexGrow: 1, minWidth: 128, maxWidth: 210, alignItems: 'center', padding: 10, gap: 10, backgroundColor: '#1A2434', borderRadius: 10, borderWidth: 1, borderColor: '#7A705B' }}>
            <View style={{ direction: 'ltr' }}><PortraitCard player={item.player} edition="base" width={118} /></View>
            <SbcText tone="label" center>{name}</SbcText>
            <SbcText tone="caption" center>{item.player.rating} OVR · {t('גרסה רגילה', 'Base version')}</SbcText>
            <ItemScore value={item.scoreEach} size={20} />
            <SbcText tone="caption" center>{t('נקודות לכל קלף', 'Points per item')}</SbcText>
            <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', gap: 4 }}>
              <Pressable accessibilityRole="button" accessibilityLabel={t(`הפחתת ${name}`, `Remove one ${name}`)} onPress={() => quantity(item.player.id, -1)} style={{ width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#303C51', borderRadius: 6 }}><Text style={{ color: '#F3F5FA', fontSize: 24 }}>−</Text></Pressable>
              <Text style={{ color: '#F3F5FA', fontSize: 18, fontWeight: '700' }}>{item.count}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={t(`הגדלת כמות ${name}`, `Increase quantity of ${name}`)} onPress={() => quantity(item.player.id, 1)} style={{ width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#303C51', borderRadius: 6 }}><Text style={{ color: '#F3F5FA', fontSize: 24 }}>＋</Text></Pressable>
            </View>
            <SbcText tone="caption" center>{t('תרומה לבחירה', 'Points contributed')}</SbcText>
            <ItemScore value={item.scoreEach * item.count} size={21} />
          </View>;
        })}
      </View>
      {items.length > visible ? <Button label={t('הצגת עוד קלפים שנבחרו', 'Show more selected items')} variant="ghost" onPress={() => setVisible((n) => n + 12)} /> : null}
      <Button label={t('התחלה מחדש מאפס', 'Start again from zero')} variant="ghost" onPress={() => { onReset(); setQuery(''); setVisible(12); }} />
    </View>
  </View>;
}
