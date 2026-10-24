import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PortraitCard } from '@/components/PortraitCard';
import type { FcPlayer } from '@/lib/fcPlayers';
import { useLanguage } from '@/lib/language';
import { playerEditionsFor } from '@/lib/playerEditions';
import { recentCardFor } from '@/lib/recentCards';

export function PlayerEditionLinks({ player, width }: { player: FcPlayer; width: number }) {
  const router = useRouter();
  const { t } = useLanguage();
  const alternatives = playerEditionsFor(player).filter(card => card.id !== player.id);
  if (!alternatives.length) return null;
  return (
    <View testID="player-edition-links" style={{ width, gap: 6, alignItems: 'center' }}>
      <Text style={{ color: '#BAC6C0', fontSize: 10, textAlign: 'center' }}>{t('גרסאות נוספות', 'Other versions')}</Text>
      <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, direction: 'ltr' }}>
        {alternatives.map(card => {
          const recent = recentCardFor(card.id);
          const label = recent
            ? recent.holographicType === 'pristine' ? 'Pristine' : recent.holographicType === 'holographic' ? 'Holo' : recent.family.includes('Hero') ? 'Scream Hero' : recent.family.includes('Scream') ? 'Scream' : 'Star Performer'
            : card.edition ? { hero: 'Hero', totw: 'TOTW', destined: 'Destined', otw: 'OTW', 'future-stars': 'Future Stars', 'star-performer': 'Star Performer', season2: t('עונה 2', 'Season 2'), recent: t('חדש', 'New') }[card.edition] : t('רגיל', 'Base');
          const description = recent ? `${recent.family}${recent.holographicType ? ` · ${recent.holographicType}` : ''}` : label;
          return (
            <Pressable key={card.id} testID={`edition-link-${card.id}`} accessibilityRole="button"
              accessibilityLabel={`${t('פתיחת גרסה', 'Open edition')}: ${card.en ?? card.name} · ${card.rating} · ${description}`}
              onPress={() => router.replace(`/market/${card.id}`)}
              style={({ pressed }) => ({ width: 62, alignItems: 'center', gap: 3, opacity: pressed ? 0.7 : 1 })}>
              <PortraitCard player={card} width={62} />
              <Text numberOfLines={2} style={{ color: '#D8D1BC', fontSize: 9, textAlign: 'center' }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
