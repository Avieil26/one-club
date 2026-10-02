import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View, type ImageStyle } from 'react-native';

import { careerCream, careerFont, careerThemeFor, type CareerCardTheme } from '@/lib/careerCardTheme';
import { formatDate } from '@/lib/format';
import { modeLabel } from '@/lib/labels';
import { isOpen } from '@/lib/selectors';
import type { CareerChallenge } from '@/lib/types';

const ink = '#F7F4EA';

function webPhotoStyle(position: string): ImageStyle | null {
  if (Platform.OS !== 'web') return null;
  return { objectFit: 'cover', objectPosition: position } as ImageStyle;
}

export function challengeStatusLine(challenge: Pick<CareerChallenge, 'endsAt'>): string {
  return isOpen(challenge) ? `פתוח עד ${formatDate(challenge.endsAt)}` : 'האתגר נסגר';
}

export function CareerStripes({ theme }: { theme: CareerCardTheme }) {
  return (
    <View style={styles.stripes}>
      {[...theme.stripe].reverse().map((color) => (
        <View key={color} style={{ flex: 1, backgroundColor: color }} />
      ))}
    </View>
  );
}

export function CareerCreamButton({
  theme,
  label,
  onPress,
}: {
  theme: CareerCardTheme;
  label: string;
  onPress?: () => void;
}) {
  const body = (
    <View style={styles.button}>
      <View style={[styles.inset, { backgroundColor: theme.inset }]} />
      <View style={[styles.pip, { backgroundColor: theme.accent }]} />
      <Text style={[styles.buttonText, { color: theme.ink }]}>{label}</Text>
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {body}
    </Pressable>
  );
}

function CareerPhoto({ theme, large, banner }: { theme: CareerCardTheme; large?: boolean; banner?: boolean }) {
  return (
    <View style={[styles.panel, large && !banner && styles.panelLarge, banner && styles.panelBanner]}>
      {theme.photo ? (
        <Image
          source={theme.photo}
          resizeMode="cover"
          style={[styles.photo, webPhotoStyle(theme.photoPosition)]}
        />
      ) : (
        <LinearGradient
          colors={[theme.accent, theme.background]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <LinearGradient colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.62)']} style={styles.scrim} />
      <Text style={styles.panelLabel}>{theme.panelLabel}</Text>
    </View>
  );
}

export function CareerChallengeCard({
  challenge,
  onPress,
}: {
  challenge: CareerChallenge;
  onPress: () => void;
}) {
  const theme = careerThemeFor(challenge);
  const narrow = useWindowDimensions().width < 520;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={challenge.title}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.background }]}
    >
      <CareerStripes theme={theme} />
      <View style={narrow ? styles.stack : styles.row}>
        {narrow ? <CareerPhoto theme={theme} banner /> : null}
        <View style={styles.copy}>
          <View style={[styles.eye, narrow && styles.eyeStack]}>
            <Text style={[styles.brand, { color: theme.accent }]}>{modeLabel(challenge.mode)}</Text>
            <Text style={[styles.dim, narrow && styles.dimStack]}>{challengeStatusLine(challenge)}</Text>
          </View>
          <Text style={[styles.title, narrow && styles.titleNarrow]}>{challenge.title}</Text>
          <Text style={styles.rules}>{challenge.rules}</Text>
          <CareerCreamButton theme={theme} label="לכרטיס האתגר" />
        </View>
        {narrow ? null : <CareerPhoto theme={theme} />}
      </View>
    </Pressable>
  );
}

export function CareerDetailBlock({
  challenge,
  children,
}: {
  challenge: CareerChallenge;
  children: ReactNode;
}) {
  const theme = careerThemeFor(challenge);
  const narrow = useWindowDimensions().width < 720;
  return (
    <View style={[styles.card, { backgroundColor: theme.background }]}>
      <CareerStripes theme={theme} />
      <View style={narrow ? styles.stack : styles.row}>
        {narrow ? <CareerPhoto theme={theme} banner /> : null}
        <View style={styles.copy}>
          <View style={[styles.eye, narrow && styles.eyeStack]}>
            <Text style={[styles.brand, { color: theme.accent }]}>{modeLabel(challenge.mode)}</Text>
            <Text style={[styles.dim, narrow && styles.dimStack]}>{challengeStatusLine(challenge)}</Text>
          </View>
          <Text style={[styles.detailTitle, narrow && styles.detailTitleNarrow]}>{challenge.title}</Text>
        </View>
        {narrow ? null : <CareerPhoto theme={theme} large />}
      </View>
      <View style={styles.detailPad}>{children}</View>
    </View>
  );
}

export function CareerFact({
  challenge,
  label,
  text,
}: {
  challenge: CareerChallenge;
  label: string;
  text: string;
}) {
  const theme = careerThemeFor(challenge);
  return (
    <View style={[styles.fact, { borderRightColor: theme.inset }]}>
      <Text style={[styles.factLabel, { color: theme.accent }]}>{label}</Text>
      <Text style={styles.factText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stripes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    zIndex: 2,
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  panel: {
    width: 148,
    alignSelf: 'stretch',
    position: 'relative',
    minHeight: 230,
  },
  panelLarge: {
    width: 220,
    minHeight: 280,
  },
  panelBanner: {
    width: '100%',
    height: 210,
    minHeight: 210,
    alignSelf: 'stretch',
  },
  stack: {
    flexDirection: 'column',
  },
  photo: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  panelLabel: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    color: '#fff',
    fontFamily: careerFont,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  eye: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontFamily: careerFont,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  dim: {
    flexShrink: 1,
    color: 'rgba(247,244,234,0.7)',
    fontFamily: careerFont,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  eyeStack: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  dimStack: {
    textAlign: 'right',
  },
  title: {
    color: ink,
    fontFamily: careerFont,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  titleNarrow: {
    fontSize: 28,
    lineHeight: 36,
  },
  rules: {
    color: 'rgba(247,244,234,0.82)',
    fontFamily: careerFont,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  button: {
    marginTop: 8,
    height: 44,
    borderRadius: 4,
    backgroundColor: careerCream,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  inset: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 4,
  },
  pip: {
    width: 8,
    height: 8,
  },
  buttonText: {
    fontFamily: careerFont,
    fontSize: 15,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  detailPad: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  detailTitle: {
    color: ink,
    fontFamily: careerFont,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  detailTitleNarrow: {
    fontSize: 28,
    lineHeight: 38,
  },
  fact: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRightWidth: 3,
    gap: 4,
  },
  factLabel: {
    fontFamily: careerFont,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  factText: {
    color: 'rgba(247,244,234,0.9)',
    fontFamily: careerFont,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
