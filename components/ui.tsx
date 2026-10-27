import { ReactNode } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SceneAtmosphere, type SceneId } from '@/components/MarketAtmosphere';
import { SiteNav } from '@/components/SiteNav';
import { useLanguage } from '@/lib/language';

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
  backgroundImage,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  maxWidth?: number;
  scene?: SceneId;
  showNav?: boolean;
  backgroundImage?: string;
}) {
  const { isRTL: rtl } = useLanguage();
  const web = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(96, insets.bottom + 72);

  return (
    <View style={[styles.screenShell, { backgroundColor: scene === 'sbc' ? '#060A14' : scene === 'board' ? '#07080c' : '#05080A' }, !web && { width: '100%', overflow: 'hidden' }]}>
      {/* Full-bleed background behind everything */}
      {backgroundImage ? (
        <>
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <ImageBackground source={{ uri: backgroundImage }} resizeMode="cover" imageStyle={{ opacity: 0.9 }} style={StyleSheet.absoluteFill} />
          </View>
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(2, 8, 15, 0.22)' }]} />
        </>
      ) : <SceneAtmosphere scene={scene} />}
      {showNav ? <SiteNav /> : null}
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ backgroundColor: 'transparent', ...(!web ? { width: '100%' } : {}) }}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: bottomPad, paddingTop: !web && !showNav ? insets.top + 16 : 16, direction: rtl ? 'rtl' : 'ltr' },
            !web && { width: '100%', alignItems: 'stretch' },
            web && (isMobile ? styles.mobileWebContent : styles.webContent),
            web && { paddingBottom: bottomPad },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={colors.blue} />
            ) : undefined
          }
        >
          <View
            style={[
              web ? { width: '100%', maxWidth, alignSelf: 'center', gap: 14 } : { width: '100%', gap: 14 },
              { direction: rtl ? 'rtl' : 'ltr', alignItems: 'stretch' },
            ]}
          >
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const { isRTL: rtl } = useLanguage();
  return (
    <Text style={[styles.h1, { width: '100%', textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr', alignSelf: 'stretch' }]}>
      {children}
    </Text>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  const { isRTL: rtl } = useLanguage();
  return (
    <Text style={[styles.muted, { width: '100%', textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr', alignSelf: 'stretch' }]}>
      {children}
    </Text>
  );
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
  maxLength,
  tone,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secure?: boolean;
  maxLength?: number;
  tone?: 'sbc';
}) {
  const { t, isRTL: rtl } = useLanguage();
  const remaining = maxLength != null ? Math.max(0, maxLength - value.length) : 0;
  return (
    <View style={styles.field}>
      <Text style={[styles.label, tone === 'sbc' && { color: '#F3F5FA', fontSize: 15, lineHeight: 23, fontWeight: '700' }, { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={(text) => onChangeText(maxLength ? text.slice(0, maxLength) : text)}
        placeholder={placeholder}
        placeholderTextColor={tone === 'sbc' ? '#C2CBDA' : colors.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        autoCapitalize={secure || keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={secure || keyboardType === 'email-address' ? false : undefined}
        maxLength={maxLength}
        style={[styles.input, tone === 'sbc' && { backgroundColor: '#101724', borderColor: '#46516A', borderRadius: 6 }, { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }, multiline && { minHeight: 96, textAlignVertical: 'top' }]}
      />
      {maxLength != null ? (
        <Text style={[styles.label, { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }]}>{t('נשארו {count}', '{count} left').replace('{count}', String(remaining))}</Text>
      ) : null}
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
  content: { padding: 16, paddingBottom: 60, direction: 'rtl' },
  webContent: { paddingHorizontal: 24, paddingTop: 28 },
  mobileWebContent: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 60 },
  h1: { color: colors.text, fontSize: 24, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', width: '100%', alignSelf: 'stretch' },
  h2: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl', width: '100%', alignSelf: 'stretch' },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl', width: '100%', alignSelf: 'stretch' },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.line, width: '100%', alignSelf: 'stretch' },
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
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
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
