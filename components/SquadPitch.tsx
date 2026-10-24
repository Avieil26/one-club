import { useLanguage } from '@/lib/language';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { FutCard } from '@/components/FutCard';
import { PortraitCard } from '@/components/PortraitCard';
import type { Formation } from '@/lib/chemistry';
import type { FcPlayer } from '@/lib/fcPlayers';
import { pitchCardPosition, spotsFor, squadPitchMetrics } from '@/lib/mobileLayout';
import { playerDisplayName } from '@/lib/playerDisplayName';

function ChemDiamonds({ chem, size = 7 }: { chem: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: size * 0.35, alignItems: 'center' }}>
      {[0, 1, 2].map((index) => {
        const on = index < chem;
        return (
          <View
            key={index}
            style={{
              width: size,
              height: size,
              transform: [{ rotate: '45deg' }],
              borderRadius: 1.5,
              backgroundColor: on ? '#3DDC97' : 'rgba(12, 24, 20, 0.75)',
              borderWidth: 1,
              borderColor: on ? '#9AF5C8' : 'rgba(180, 220, 200, 0.35)',
              shadowColor: on ? '#3DDC97' : 'transparent',
              shadowOpacity: on ? 0.9 : 0,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 0 },
            }}
          />
        );
      })}
    </View>
  );
}

export function SquadPitch({
  formation,
  placed,
  playerChem,
  activeSlot,
  onSlot,
  showChemHud = false,
  appearance = 'pitch',
  activeSlots,
}: {
  formation: Formation;
  placed: Record<string, FcPlayer | null>;
  playerChem: Record<string, number>;
  activeSlot?: string | null;
  onSlot?: (slotId: string) => void;
  showChemHud?: boolean;
  appearance?: 'pitch' | 'sbc';
  activeSlots?: string[];
}) {
  const { t, language } = useLanguage();
  const [width, setWidth] = useState(0);
  const [opened, setOpened] = useState<FcPlayer | null>(null);
  const widest = Math.max(...formation.lines.map((line) => line.length));
  const { height, cardWidth: cardW, cardHeight: cardH } = squadPitchMetrics(width || 320, widest, formation.lines.length);
  const spots = spotsFor(formation);
  const teamChem = Object.values(playerChem).reduce((sum, value) => sum + value, 0);

  return (
    <>
      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={{
          height,
          borderRadius: 22,
          overflow: 'hidden',
          direction: 'ltr',
          borderWidth: 1,
          borderColor: appearance === 'sbc' ? '#586078' : 'rgba(80, 200, 160, 0.28)',
          shadowColor: appearance === 'sbc' ? '#080B13' : '#0EF3A3',
          shadowOpacity: 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={appearance === 'sbc' ? ['#232B3D', '#121A28', '#1B1C29', '#2A2430'] : ['#061510', '#0B2A1F', '#0A1C16', '#07140F']}
          locations={[0, 0.35, 0.7, 1]}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <LinearGradient
          colors={appearance === 'sbc' ? ['rgba(193, 164, 105, 0.09)', 'transparent', 'rgba(128, 145, 189, 0.09)'] : ['rgba(14, 243, 163, 0.12)', 'transparent', 'rgba(59, 130, 246, 0.08)']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />

        {/* Pitch markings */}
        <View
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            top: 14,
            bottom: 14,
            borderWidth: 1.5,
            borderColor: appearance === 'sbc' ? 'rgba(191, 199, 219, 0.22)' : 'rgba(160, 230, 200, 0.22)',
            borderRadius: 12,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: '50%',
            marginLeft: -42,
            top: 14,
            width: 84,
            height: 48,
            borderWidth: 1.5,
            borderColor: appearance === 'sbc' ? 'rgba(191, 199, 219, 0.22)' : 'rgba(160, 230, 200, 0.22)',
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: '50%',
            marginLeft: -42,
            bottom: 14,
            width: 84,
            height: 48,
            borderWidth: 1.5,
            borderColor: appearance === 'sbc' ? 'rgba(191, 199, 219, 0.22)' : 'rgba(160, 230, 200, 0.22)',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: '22%',
            right: '22%',
            top: height / 2 - 0.75,
            height: 1.5,
            backgroundColor: appearance === 'sbc' ? 'rgba(191, 199, 219, 0.22)' : 'rgba(160, 230, 200, 0.2)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: '50%',
            marginLeft: -28,
            top: height / 2 - 28,
            width: 56,
            height: 56,
            borderRadius: 28,
            borderWidth: 1.5,
            borderColor: appearance === 'sbc' ? 'rgba(191, 199, 219, 0.22)' : 'rgba(160, 230, 200, 0.18)',
          }}
        />

        {/* Optional Team chem HUD (centered pill at top, never overlaps corner cards) */}
        {showChemHud ? (
          <View
            style={{
              position: 'absolute',
              top: 8,
              alignSelf: 'center',
              zIndex: 5,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor: 'rgba(4, 14, 11, 0.85)',
              borderWidth: 1,
              borderColor: 'rgba(61, 220, 151, 0.4)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Text style={{ color: 'rgba(200, 240, 220, 0.8)', fontSize: 11, fontWeight: '700' }}>{t("כימיה", "Chemistry")}</Text>
            <Text style={{ color: '#3DDC97', fontSize: 14, fontWeight: '900' }}>
              {teamChem}
              <Text style={{ color: 'rgba(200, 240, 220, 0.5)', fontSize: 11, fontWeight: '700' }}>/33</Text>
            </Text>
          </View>
        ) : null}

        {width > 0
          ? formation.lines.flat().map((slot) => {
              const spot = spots[slot.id];
              if (!spot) return null;
              const locked = activeSlots !== undefined && !activeSlots.includes(slot.id);
              const player = locked ? null : placed[slot.id];
              const chem = playerChem[slot.id] ?? 0;
              const selected = activeSlot === slot.id;
              const body = locked ? (
                <View testID={`sbc-locked-${slot.id}`} accessibilityLabel={`${slot.position}: ${t('משבצת נעולה', 'Locked slot')}`} style={{ width: cardW, height: cardH, borderRadius: 12, backgroundColor: '#171B25', borderWidth: 1, borderColor: '#5C6470', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Text style={{ color: '#B3BAC7', fontSize: 20 }}>×</Text>
                  <Text style={{ color: '#B3BAC7', fontSize: 10 }}>{slot.position}</Text>
                  <Text style={{ color: '#B3BAC7', fontSize: 9 }}>{t('נעול', 'Locked')}</Text>
                </View>
              ) : player ? (
                <View
                  style={{
                    borderRadius: 12,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? '#5B9CFF' : 'rgba(255,255,255,0.12)',
                    shadowColor: selected ? '#5B9CFF' : '#000',
                    shadowOpacity: selected ? 0.55 : 0.35,
                    shadowRadius: selected ? 10 : 6,
                    shadowOffset: { width: 0, height: 4 },
                  }}
                >
                  <PortraitCard player={player} width={cardW - 2} variant="pitch" />
                  <View style={{ position: 'absolute', bottom: 6, left: 6, zIndex: 4 }}>
                    <ChemDiamonds chem={chem} size={6} />
                  </View>
                </View>
              ) : (
                <LinearGradient
                  colors={
                    selected
                      ? ['rgba(59, 130, 246, 0.35)', 'rgba(14, 40, 32, 0.85)']
                      : ['rgba(18, 40, 32, 0.55)', 'rgba(8, 20, 16, 0.75)']
                  }
                  style={{
                    width: cardW,
                    height: cardH,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: selected ? '#5B9CFF' : 'rgba(140, 210, 180, 0.28)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: selected ? '#9EC5FF' : 'rgba(160, 230, 200, 0.4)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#E8FFF4', fontSize: 16, fontWeight: '300', marginTop: -2 }}>+</Text>
                  </View>
                  <Text style={{ color: 'rgba(220, 245, 230, 0.85)', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 }}>
                    {slot.position}
                  </Text>
                </LinearGradient>
              );
              return (
                <Pressable
                  key={slot.id}
                  disabled={locked}
                  accessibilityRole="button"
                  accessibilityLabel={locked ? `${slot.position}: ${t('משבצת נעולה', 'Locked slot')}` : player ? `${slot.position}: ${playerDisplayName(player, language)}` : `${slot.position}: ${t('בחר שחקן', 'Choose player')}`}
                  onPress={() => {
                    if (onSlot) onSlot(slot.id);
                    else if (player) setOpened(player);
                  }}
                  onLongPress={() => {
                    if (player) setOpened(player);
                  }}
                  style={{
                    position: 'absolute',
                    ...pitchCardPosition(spot.x, spot.y, width, height, cardW, cardH),
                    zIndex: 2,
                  }}
                >
                  {body}
                </Pressable>
              );
            })
          : null}
      </View>
      {opened ? <FutCard player={opened} onClose={() => setOpened(null)} /> : null}
    </>
  );
}
