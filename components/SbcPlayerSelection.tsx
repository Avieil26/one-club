import { useDeferredValue, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { PortraitCard } from '@/components/PortraitCard';
import { ItemScore } from '@/components/ItemScore';
import { Button, colors, Field, Muted } from '@/components/ui';
import { itemScore, searchPointPlayers, selectedItems, selectedScore, type ItemBasket } from '@/lib/sbcItemScore';
import type { PointsSegment } from '@/lib/sbcVerified';
import { useLanguage } from '@/lib/language';
import { playerDisplayName } from '@/lib/playerDisplayName';

export function SbcPlayerSelection({ segment, basket, onChange }: { segment: PointsSegment; basket: ItemBasket; onChange: (next: ItemBasket) => void }) {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => deferredQuery.trim() ? searchPointPlayers(segment, deferredQuery, 8) : [], [segment, deferredQuery]);
  const items = useMemo(() => selectedItems(segment, basket), [segment, basket]);
  const [visible, setVisible] = useState(12);
  function quantity(id: string, change: number) {
    const next = { ...basket }, count = Math.min(10000, Math.max(0, (next[id] ?? 0) + change));
    if (count) next[id] = count; else delete next[id];
    onChange(next);
  }
  return <View style={{ gap: 14 }}>
    <Muted>{t('חפשו ובחרו את הקלפים שיש לכם. הניקוד מחושב לגרסה הרגילה שמוצגת כאן.', 'Search and select items you own. Points are calculated for the base version shown here.')}</Muted>
    <Field label={t('חיפוש שחקן להשלמה', 'Find a player for this SBC')} value={query} onChangeText={setQuery} placeholder={t('שם בעברית, באנגלית או דירוג', 'Player name or rating')} />
    <View style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}><Text style={{ color: colors.text, fontWeight: '800' }}>{t('הניקוד שבחרת', 'Selected points')}</Text><ItemScore value={selectedScore(items)} size={20} /></View>
    <View testID="sbc-player-search-results" style={{ gap: 8 }}>
      {results.map((player) => {
        const name = playerDisplayName(player, language);
        return <Pressable key={player.id} accessibilityRole="button" accessibilityLabel={t(`הוספת ${name}`, `Add ${name}`)} onPress={() => quantity(player.id, 1)} style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, minHeight: 96, padding: 10, backgroundColor: '#101724', borderWidth: 1, borderColor: '#384359', borderRadius: 7 }}>
          <PortraitCard player={player} edition="base" width={54} />
          <View style={{ flex: 1, minWidth: 0, gap: 5 }}><Text style={{ color: colors.text, fontWeight: '800', textAlign: language === 'he' ? 'right' : 'left' }}>{name}</Text><Muted>{player.rating} OVR · {t('גרסה רגילה', 'Base version')}</Muted><ItemScore value={itemScore(player)!} size={16} /></View>
          <Text style={{ color: '#F4D997', fontWeight: '900', fontSize: 19 }}>＋{basket[player.id] ? ` ${basket[player.id]}` : ''}</Text>
        </Pressable>;
      })}
      {deferredQuery.trim() && !results.length ? <Muted>{t('לא נמצאו קלפים רגילים שמתאימים לדרישות החלק.', 'No matching base items meet this segment’s requirements.')}</Muted> : null}
    </View>
    <Text style={{ color: colors.text, fontWeight: '900', fontSize: 20 }}>{t('הקלפים שבחרת', 'Your selected items')} · {items.length}</Text>
    {!items.length ? <Muted>{t('הוסיפו שחקנים מהחיפוש כדי לראות את הניקוד המצטבר.', 'Add players from search to see their combined points.')}</Muted> : null}
    <View testID="sbc-selected-items" style={{ gap: 10 }}>
      {items.slice(0, visible).map((item) => {
        const name = playerDisplayName(item.player, language);
        return <View key={item.player.id} style={{ gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#465168' }}>
          <Text style={{ color: colors.text, fontWeight: '800' }}>{name} · {item.player.rating} OVR</Text>
          <View style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <ItemScore value={item.scoreEach} size={16} />
            <Muted>{t('לכל קלף', 'per item')} × {item.count}</Muted>
            <ItemScore value={item.scoreEach * item.count} size={18} />
            <Pressable accessibilityRole="button" accessibilityLabel={t(`הפחתת ${name}`, `Remove one ${name}`)} onPress={() => quantity(item.player.id, -1)} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#222B3C', borderRadius: 5 }}><Text style={{ color: colors.text, fontSize: 22 }}>−</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={t(`הגדלת כמות ${name}`, `Increase quantity of ${name}`)} onPress={() => quantity(item.player.id, 1)} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#222B3C', borderRadius: 5 }}><Text style={{ color: colors.text, fontSize: 22 }}>＋</Text></Pressable>
          </View>
        </View>;
      })}
    </View>
    {items.length > visible ? <Button label={t('הצגת עוד קלפים שנבחרו', 'Show more selected items')} variant="ghost" onPress={() => setVisible((n) => n + 12)} /> : null}
    {items.length ? <Button label={t('ניקוי הבחירה', 'Clear selected items')} variant="ghost" onPress={() => onChange({})} /> : null}
  </View>;
}
