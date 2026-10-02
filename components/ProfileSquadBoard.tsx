import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { PortraitCard } from '@/components/PortraitCard';
import { SquadPitch } from '@/components/SquadPitch';
import { colors } from '@/components/ui';
import { formationById, placedFromSquad, playerById } from '@/lib/profileSquad';
import type { ProfileSquad } from '@/lib/types';

export function ProfileSquadBoard({ squad }: { squad: ProfileSquad }) {
  const formation = formationById(squad.formation);
  const bench = squad.bench.map((id) => playerById(id)).filter((player) => player != null);

  return (
    <View style={{ gap: 12 }}>
      <LinearGradient
        colors={['rgba(227,179,65,0.22)', 'rgba(14,28,22,0.4)', 'rgba(12,40,32,0.15)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          borderRadius: 16,
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderWidth: 1,
          borderColor: 'rgba(227,179,65,0.35)',
          alignSelf: 'flex-end',
        }}
      >
        <Text style={{ color: colors.gold, fontWeight: '800', textAlign: 'right' }}>הסגל · {formation.label}</Text>
      </LinearGradient>
      <SquadPitch formation={formation} placed={placedFromSquad(squad)} playerChem={{}} />
      {bench.length ? (
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '800', textAlign: 'right' }}>מחליפים</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: 'row' }}>
            {bench.map((player) => (
              <PortraitCard key={player.id} player={player} width={78} variant="pitch" />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
