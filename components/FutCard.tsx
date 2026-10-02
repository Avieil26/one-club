import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SceneAtmosphere } from '@/components/MarketAtmosphere';
import { PlayerDossier } from '@/components/PlayerDossier';
import type { FcPlayer } from '@/lib/fcPlayers';

export function FutCard({ player, onClose }: { player: FcPlayer; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#050A08' }}>
      <SceneAtmosphere scene="market" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: Math.max(16, insets.top + 8),
          paddingBottom: Math.max(24, insets.bottom + 12),
          paddingHorizontal: 12,
          gap: 10,
        }}
      >
        <Pressable onPress={onClose} hitSlop={8}>
          <Text style={{ color: '#E3B341', fontWeight: '800', textAlign: 'right' }}>סגירה</Text>
        </Pressable>
        <PlayerDossier player={player} />
      </ScrollView>
      </View>
    </Modal>
  );
}
