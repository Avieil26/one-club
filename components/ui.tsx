import { ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { SceneAtmosphere, type SceneId } from '@/components/MarketAtmosphere';
import { SiteNav } from '@/components/SiteNav';

export const colors = {
  bg: '#0A100E',
  card: 'rgba(18, 28, 24, 0.88)',
  cardAlt: 'rgba(28, 42, 36, 0.9)',
  line: 'rgba(80, 110, 92, 0.45)',
  text: '#F4F7F2',
  muted: '#C5D5C8',
  blue: '#3B82F6',
  link: '#C5DEFF',
  career: '#9CC7FF',
  green: '#3DDC97',
  greenInk: '#10281C',
  gold: '#E3B341',
  goldInk: '#2A2208',
  copper: '#E0915C',
  copperInk: '#1A1008',
  danger: '#F07164',
  amber: '#E0A24A',
};

export function Screen({
  children,
  refreshing,
  onRefresh,
  maxWidth = 1120,
  scene = 'home',
  showNav = true,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  maxWidth?: number;
  scene?: SceneId;
  showNav?: boolean;
}) {
  const web = Platform.OS === 'web';
  return (
    <View style={[styles.screenShell, { backgroundColor: scene === 'sbc' ? '#060A14' : '#05080A' }]}>
      {/* Full-bleed background behind everything */}
      <SceneAtmosphere scene={scene} />
      {showNav ? <SiteNav /> : null}
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ backgroundColor: 'transparent' }}
          contentContainerStyle={[styles.content, web && styles.webContent]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={colors.blue} />
            ) : undefined
          }
        >
          <View style={web ? { width: '100%', maxWidth, alignSelf: 'center', gap: 14 } : { gap: 14 }}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Card({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  if (!onPress) return <View style={styles.card}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      {children}
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'gold' | 'copper' | 'ghost' | 'link' | 'danger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, styles[variant], disabled && styles.disabled]}
    >
      <Text style={[styles.buttonText, styles[`${variant}Text` as const]]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  secure,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secure?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        style={[styles.input, multiline && { minHeight: 96, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.wrap}>
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              onPress={() => onChange(option.id)}
              style={[styles.chip, selected && styles.chipOn]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextOn]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Badge({
  text,
  tone = 'muted',
}: {
  text: string;
  tone?: 'green' | 'gold' | 'amber' | 'muted' | 'blue' | 'copper';
}) {
  return (
    <View
      style={[
        styles.badge,
        tone === 'green' && styles.badgeGreen,
        tone === 'gold' && styles.badgeGold,
        tone === 'amber' && styles.badgeAmber,
        tone === 'blue' && styles.badgeBlue,
        tone === 'copper' && styles.badgeCopper,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          tone === 'green' && styles.badgeTextGreen,
          tone === 'gold' && styles.badgeTextGold,
          tone === 'amber' && styles.badgeTextAmber,
          tone === 'blue' && styles.badgeTextBlue,
          tone === 'copper' && styles.badgeTextCopper,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

export function ImageRow({ uris }: { uris: string[] }) {
  if (!uris.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {uris.map((uri) => (
        <Image key={uri} source={{ uri }} style={{ width: 112, height: 112, borderRadius: 12, backgroundColor: colors.cardAlt }} />
      ))}
    </ScrollView>
  );
}

export function ScorePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.wrap}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
          const on = score === value;
          return (
            <Pressable key={score} onPress={() => onChange(score)} style={[styles.dot, on && styles.dotOn]}>
              <Text style={[styles.dotText, on && styles.dotTextOn]}>{score}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenShell: { flex: 1, backgroundColor: '#05080A' },
  screen: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 16, paddingBottom: 40 },
  webContent: { paddingHorizontal: 24, paddingTop: 28 },
  h1: { color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' },
  h2: { color: colors.text, fontSize: 16, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl' },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.line },
  button: { borderRadius: 10, minHeight: 46, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.blue },
  gold: { backgroundColor: colors.gold },
  copper: { backgroundColor: colors.copper },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
  link: { backgroundColor: 'transparent', minHeight: 36 },
  danger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger },
  disabled: { opacity: 0.5 },
  buttonText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  primaryText: { color: '#FFFFFF' },
  goldText: { color: colors.goldInk },
  copperText: { color: colors.copperInk },
  ghostText: { color: colors.text },
  linkText: { color: colors.link },
  dangerText: { color: colors.danger },
  field: { gap: 6 },
  label: { color: colors.muted, fontSize: 13, textAlign: 'right', writingDirection: 'rtl' },
  input: {
    backgroundColor: colors.cardAlt,
    color: colors.text,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  wrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.cardAlt },
  chipOn: { backgroundColor: colors.blue, borderColor: colors.blue },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  chipTextOn: { color: '#FFFFFF' },
  badge: { alignSelf: 'flex-end', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
  badgeGreen: { borderColor: colors.green },
  badgeGold: { borderColor: colors.gold },
  badgeAmber: { borderColor: colors.amber },
  badgeBlue: { borderColor: colors.career },
  badgeCopper: { borderColor: colors.copper },
  badgeText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  badgeTextGreen: { color: colors.green },
  badgeTextGold: { color: colors.gold },
  badgeTextAmber: { color: colors.amber },
  badgeTextBlue: { color: colors.career },
  badgeTextCopper: { color: colors.copper },
  dot: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  dotText: { color: colors.text, fontWeight: '700' },
  dotTextOn: { color: colors.goldInk },
  placeholder: { borderRadius: 12, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: colors.muted, fontWeight: '700' },
});
