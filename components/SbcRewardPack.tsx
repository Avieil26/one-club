import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

export type PackVisual =
  | 'gold-small'
  | 'gold'
  | 'gold-jumbo'
  | 'gold-giant'
  | 'electrum-small'
  | 'electrum'
  | 'silver-x2'
  | 'rare-75'
  | 'otw'
  | 'pick'
  | 'mixed'
  | 'practice';

type PackTone = {
  rim: [string, string, string];
  face: [string, string, string];
  band: [string, string];
  ink: string;
  glow: string;
  foil: string;
};

const TONES: Record<PackVisual, PackTone> = {
  'gold-small': {
    rim: ['#F8E7A8', '#C9A227', '#6A4E12'],
    face: ['#3A2C0C', '#1A1408', '#0A0804'],
    band: ['#E3B341', '#8A6418'],
    ink: '#FFE9A8',
    glow: '#E3B341',
    foil: '#FFF1C2',
  },
  gold: {
    rim: ['#FFE9A8', '#E3B341', '#7A5A14'],
    face: ['#3D3010', '#1C1508', '#0C0804'],
    band: ['#F0C14A', '#9A7018'],
    ink: '#FFE7A0',
    glow: '#F0C14A',
    foil: '#FFF6D0',
  },
  'gold-jumbo': {
    rim: ['#FFF0B8', '#E8B84A', '#8A6418'],
    face: ['#422F0C', '#211806', '#100C04'],
    band: ['#F5C84E', '#A87814'],
    ink: '#FFE9A8',
    glow: '#F5C84E',
    foil: '#FFF8DC',
  },
  'gold-giant': {
    rim: ['#FFF6CC', '#F0C14A', '#9A7018'],
    face: ['#4A340C', '#241808', '#120C04'],
    band: ['#FFD45C', '#B88814'],
    ink: '#FFF0B0',
    glow: '#FFD45C',
    foil: '#FFFBE8',
  },
  'electrum-small': {
    rim: ['#F5E6A8', '#C8D0DA', '#6A7280'],
    face: ['#1A1E28', '#0E1218', '#06080C'],
    band: ['#C9A227', '#8A90A0'],
    ink: '#F0F3F8',
    glow: '#D0A84A',
    foil: '#E8ECF2',
  },
  electrum: {
    rim: ['#FFE9A8', '#D0D6E0', '#707888'],
    face: ['#1E2430', '#10141C', '#080A10'],
    band: ['#E3B341', '#9098A8'],
    ink: '#F4F6FA',
    glow: '#E0B85A',
    foil: '#EEF2F6',
  },
  'silver-x2': {
    rim: ['#F2F5F8', '#A8B4C2', '#5A6474'],
    face: ['#1A2028', '#0E1218', '#06080C'],
    band: ['#C8D2DE', '#6E7B8C'],
    ink: '#EEF3F8',
    glow: '#A8B0C0',
    foil: '#F4F7FA',
  },
  'rare-75': {
    rim: ['#FFF1C2', '#E3B341', '#6A5010'],
    face: ['#2A220C', '#141008', '#080604'],
    band: ['#E3B341', '#8A6418'],
    ink: '#F5E6A8',
    glow: '#E3B341',
    foil: '#FFE08A',
  },
  otw: {
    rim: ['#A8FFE8', '#2BB8A0', '#0E5A4C'],
    face: ['#061816', '#030C0C', '#020808'],
    band: ['#3DDC97', '#0E5A4C'],
    ink: '#C8FFF0',
    glow: '#3DDC97',
    foil: '#7EF0D0',
  },
  pick: {
    rim: ['#C5DEFF', '#3B82F6', '#1E3A8A'],
    face: ['#060E1C', '#030810', '#02040C'],
    band: ['#5B9CFF', '#1E3A8A'],
    ink: '#D6E8FF',
    glow: '#5B9CFF',
    foil: '#9EC5FF',
  },
  mixed: {
    rim: ['#F5E6A8', '#8B9BB8', '#4A5568'],
    face: ['#181410', '#0C0A08', '#060404'],
    band: ['#C9A227', '#5A6474'],
    ink: '#F0E8D8',
    glow: '#C9A227',
    foil: '#E8ECF2',
  },
  practice: {
    rim: ['#C5DECC', '#4A7A68', '#1E3A30'],
    face: ['#081410', '#040A08', '#020604'],
    band: ['#3DDC97', '#1E3A30'],
    ink: '#D0E8DC',
    glow: '#3DDC97',
    foil: '#A8F0C8',
  },
};

/** Slim FUT-style pack — tall, foil rim, small face window. */
export function SbcRewardPack({
  visual,
  size = 44,
  label,
}: {
  visual: PackVisual;
  size?: number;
  label?: string;
}) {
  const tone = TONES[visual];
  const w = size;
  const h = Math.round(size * 1.55);
  const r = Math.max(5, size * 0.12);

  return (
    <View
      style={{
        width: w,
        height: h,
        shadowColor: tone.glow,
        shadowOpacity: 0.45,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 6,
      }}
    >
      <LinearGradient colors={tone.rim} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: r, padding: 2 }}>
        <LinearGradient colors={tone.face} style={{ flex: 1, borderRadius: r - 1.5, overflow: 'hidden' }}>
          <LinearGradient
            colors={['rgba(255,255,255,0.28)', 'transparent', 'rgba(0,0,0,0.35)']}
            locations={[0, 0.35, 1]}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
          {/* Top foil strip */}
          <LinearGradient
            colors={tone.band}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ height: h * 0.11, opacity: 0.95 }}
          />
          {/* Face circle */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                width: w * 0.55,
                height: w * 0.55,
                borderRadius: w * 0.28,
                borderWidth: 1.5,
                borderColor: tone.foil,
                backgroundColor: 'rgba(0,0,0,0.35)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: w * 0.22,
                  height: w * 0.28,
                  borderRadius: 3,
                  backgroundColor: tone.foil,
                  opacity: 0.85,
                }}
              />
            </View>
          </View>
          {/* Bottom label */}
          <View
            style={{
              paddingVertical: 3,
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.45)',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: tone.ink,
                fontSize: Math.max(7, size * 0.16),
                fontWeight: '800',
                letterSpacing: 0.3,
              }}
            >
              {label ?? 'PACK'}
            </Text>
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}

export type BadgeTone = 'teal' | 'blue' | 'gold' | 'green' | 'silver' | 'bronze';

/** FUTBIN-style shield badge for upgrade SBCs (83+, 79+, …). */
export function SbcChallengeBadge({
  text,
  tone = 'teal',
  size = 72,
}: {
  text: string;
  tone?: BadgeTone;
  size?: number;
}) {
  const palette = {
    teal: { rim: ['#7EF0D0', '#1A8A78', '#0A3A34'] as [string, string, string], face: ['#0E3A36', '#062420', '#031412'] as [string, string, string], ink: '#F4FFFC' },
    blue: { rim: ['#9EC5FF', '#3B82F6', '#1E3A8A'] as [string, string, string], face: ['#0C1A3A', '#061028', '#030A18'] as [string, string, string], ink: '#F0F6FF' },
    gold: { rim: ['#FFE9A8', '#E3B341', '#7A5A14'] as [string, string, string], face: ['#3A2C0C', '#1A1408', '#0A0804'] as [string, string, string], ink: '#FFF6D0' },
    green: { rim: ['#A8F0C8', '#2E8A5A', '#0E3A24'] as [string, string, string], face: ['#0C2A1C', '#061810', '#030C08'] as [string, string, string], ink: '#E8FFF2' },
    silver: { rim: ['#E8ECF2', '#9AA3B2', '#5A6474'] as [string, string, string], face: ['#1A2028', '#0E1218', '#06080C'] as [string, string, string], ink: '#F4F7FA' },
    bronze: { rim: ['#E8C090', '#B07840', '#5A3A1C'] as [string, string, string], face: ['#2A1A0C', '#140E08', '#080604'] as [string, string, string], ink: '#F8E8D0' },
  }[tone];

  const w = size;
  const h = size * 1.12;

  return (
    <View style={{ width: w, height: h, alignItems: 'center' }}>
      <LinearGradient
        colors={palette.rim}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          width: w,
          height: h,
          borderRadius: w * 0.22,
          padding: 2.5,
          shadowColor: palette.rim[1],
          shadowOpacity: 0.55,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <LinearGradient
          colors={palette.face}
          style={{ flex: 1, borderRadius: w * 0.18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.25)', 'transparent']}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '40%' }}
          />
          <Text
            style={{
              color: palette.ink,
              fontSize: Math.max(16, size * 0.34),
              fontWeight: '900',
              letterSpacing: -0.5,
              textShadowColor: 'rgba(0,0,0,0.5)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {text}
          </Text>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}
