import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ClubBadge } from '@/components/ClubBadge';
import { NationFlag } from '@/components/NationFlag';
import { SceneAtmosphere } from '@/components/MarketAtmosphere';
import { PortraitCard } from '@/components/PortraitCard';
import { colors } from '@/components/ui';
import type { FcPlayer } from '@/lib/fcPlayers';
import { playerMedia, type FaceStats } from '@/lib/playerMedia';

const GROUPS: { key: keyof FaceStats; en: string; he: string }[] = [
  { key: 'pac', en: 'PAC', he: 'מהירות' },
  { key: 'sho', en: 'SHO', he: 'בעיטה' },
  { key: 'pas', en: 'PAS', he: 'מסירה' },
  { key: 'dri', en: 'DRI', he: 'כדרור' },
  { key: 'def', en: 'DEF', he: 'הגנה' },
  { key: 'phy', en: 'PHY', he: 'פיזי' },
];

const POS_HE: Record<string, string> = {
  GK: 'שוער',
  CB: 'בלם',
  LB: 'מגן שמאלי',
  RB: 'מגן ימני',
  LWB: 'מגן כנף שמאלי',
  RWB: 'מגן כנף ימני',
  CDM: 'קשר אחורי',
  CM: 'קשר מרכזי',
  CAM: 'קשר התקפי',
  LM: 'קשר שמאלי',
  RM: 'קשר ימני',
  LW: 'כנף שמאל',
  RW: 'כנף ימין',
  CF: 'חלוץ מדומה',
  ST: 'חלוץ',
};

function PositionBoard({ primary, alts }: { primary: string; alts: string[] }) {
  const others = alts.filter((pos) => pos !== primary);
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: '#9AA3B5', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textAlign: 'right' }}>
        POSITIONS · עמדות
      </Text>
      <View style={{ flexDirection: 'row-reverse', alignItems: 'stretch', gap: 10 }}>
        <LinearGradient
          colors={['#F0D060', '#C9A227', '#8A6A18']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            minWidth: 86,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,236,170,0.45)',
          }}
        >
          <Text style={{ color: '#1A1408', fontSize: 28, fontWeight: '900', lineHeight: 30 }}>{primary}</Text>
          <Text style={{ color: '#2A1C08', fontSize: 10, fontWeight: '800', marginTop: 2, textAlign: 'center' }}>
            {POS_HE[primary] ?? 'ראשית'}
          </Text>
          <Text style={{ color: '#3A2A10', fontSize: 9, fontWeight: '800', marginTop: 4, letterSpacing: 0.8 }}>PRIMARY</Text>
        </LinearGradient>
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={{ color: '#7E8798', fontSize: 11, fontWeight: '700', textAlign: 'right' }}>עמדות חלופיות</Text>
          <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 }}>
            {others.length ? (
              others.map((pos) => (
                <View
                  key={pos}
                  style={{
                    minWidth: 54,
                    borderRadius: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    backgroundColor: '#141A24',
                    borderWidth: 1,
                    borderColor: '#2C3648',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#E8EEF8', fontSize: 16, fontWeight: '900' }}>{pos}</Text>
                  <Text style={{ color: '#8B95A8', fontSize: 9, fontWeight: '700', marginTop: 2 }}>{POS_HE[pos] ?? 'ALT'}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: '#6B7384', fontSize: 13, textAlign: 'right' }}>אין עמדות חלופיות</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export function FutCard({ player, onClose }: { player: FcPlayer; onClose: () => void }) {
  const media = playerMedia(player.id);
  const groups = GROUPS;
  const insets = useSafeAreaInsets();
  const alts = player.positions?.length ? player.positions : [player.position];

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#07090F' }}>
        <SceneAtmosphere scene="modal" />
        <Pressable accessibilityRole="button" onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: Math.max(18, insets.top + 12),
            paddingBottom: Math.max(28, insets.bottom + 18),
            paddingHorizontal: 18,
            alignItems: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          <View
            style={{
              width: '100%',
              maxWidth: 420,
              alignItems: 'center',
              gap: 14,
              backgroundColor: 'rgba(12, 16, 24, 0.92)',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(201, 162, 39, 0.28)',
              padding: 16,
              shadowColor: '#000',
              shadowOpacity: 0.55,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
            }}
          >
            <PortraitCard player={player} width={220} />
            <View style={{ width: '100%', gap: 12 }}>
              <View style={{ gap: 4 }}>
                <Text style={{ color: '#F4F7FB', fontSize: 22, fontWeight: '900', textAlign: 'right' }}>{media.en}</Text>
                <Text style={{ color: '#9AA3B5', fontSize: 15, textAlign: 'right' }}>{player.name}</Text>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <NationFlag nation={player.nation} size={16} />
                  <Text style={{ color: '#6E788C', fontSize: 13, fontWeight: '700' }}>{player.nation}</Text>
                  <Text style={{ color: '#6E788C', fontSize: 13, fontWeight: '700' }}>·</Text>
                  <ClubBadge club={player.club} size={20} />
                  <Text style={{ color: '#6E788C', fontSize: 13, fontWeight: '700' }}>{player.club}</Text>
                  <Text style={{ color: '#6E788C', fontSize: 13, fontWeight: '700' }}>·</Text>
                  <Text style={{ color: '#6E788C', fontSize: 13, fontWeight: '700' }}>{player.league}</Text>
                </View>
              </View>

              <PositionBoard primary={player.position} alts={alts} />

              {player.playstyles?.length ? (
                <View style={{ gap: 8 }}>
                  <Text style={{ color: '#9AA3B5', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textAlign: 'right' }}>
                    PLAYSTYLES · סגנונות
                  </Text>
                  <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 }}>
                    {player.playstyles.map((style) => {
                      const plus = style.plus || /\+$/.test(style.name);
                      const label = plus && !/\+$/.test(style.name) ? `${style.name}+` : style.name;
                      return (
                        <View
                          key={style.name}
                          style={{
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            backgroundColor: plus ? '#C9A227' : '#151C28',
                            borderWidth: 1,
                            borderColor: plus ? '#E3B341' : '#2A3344',
                          }}
                        >
                          <Text style={{ color: plus ? '#1A1408' : '#D5DCE8', fontWeight: '800', fontSize: 12 }}>{label}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              <View style={{ gap: 8 }}>
                <Text style={{ color: '#9AA3B5', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textAlign: 'right' }}>
                  FACE STATS · נתונים
                </Text>
                {groups.map((group) => {
                  const value = media.face?.[group.key];
                  return (
                    <View key={group.en} style={{ gap: 4 }}>
                      <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: '#E8EEF8', fontWeight: '800' }}>
                          {group.en} · {group.he}
                        </Text>
                        <Text style={{ color: colors.gold, fontWeight: '900', fontSize: 18 }}>{value ?? '—'}</Text>
                      </View>
                      <View style={{ height: 6, borderRadius: 3, backgroundColor: '#1A2230', overflow: 'hidden' }}>
                        <View style={{ width: `${value ?? 0}%`, height: 6, backgroundColor: value ? colors.gold : 'transparent' }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
            <Text
              accessibilityRole="button"
              onPress={onClose}
              style={{ color: '#C5DEFF', fontWeight: '700', fontSize: 16, paddingVertical: 10, paddingHorizontal: 28 }}
            >
              סגירה
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
