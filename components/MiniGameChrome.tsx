import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { careerFont } from '@/lib/careerCardTheme';

export function Hearts({ lives }: { lives: number }) {
  return (
    <View style={styles.hearts}>
      {[0, 1, 2].map((index) => {
        const on = index < lives;
        return (
          <Svg key={index} width={22} height={22} viewBox="0 0 24 24">
            <Path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={on ? '#E23B57' : 'rgba(255,255,255,0.22)'}
            />
          </Svg>
        );
      })}
    </View>
  );
}

export function RoundNote({ text, good }: { text: string; good?: boolean }) {
  return (
    <View style={[styles.note, good ? styles.noteGood : styles.noteBad]}>
      <View style={[styles.noteStripe, good ? styles.noteStripeGood : null]} />
      <Text style={styles.noteText}>{text}</Text>
    </View>
  );
}

export function GameEnd({
  title,
  onAgain,
  onBack,
}: {
  title: string;
  onAgain: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.end}>
      <Text style={styles.endTitle}>{title}</Text>
      <Pressable accessibilityRole="button" onPress={onAgain} style={styles.againPress}>
        <LinearGradient colors={['#fffaf4', '#ffe8c8']} style={styles.again}>
          <View style={styles.againShine} />
          <Text style={styles.againText}>עוד משחק</Text>
        </LinearGradient>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>חזור למשחקונים</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  hearts: {
    flexDirection: 'row' as const,
    gap: 4,
    alignItems: 'center' as const,
  },
  note: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
    borderWidth: 1,
  },
  noteBad: {
    backgroundColor: 'rgba(226,59,87,0.2)',
    borderColor: 'rgba(255,143,163,0.55)',
  },
  noteGood: {
    backgroundColor: 'rgba(61,220,151,0.16)',
    borderColor: 'rgba(61,220,151,0.5)',
  },
  noteStripe: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    right: 0,
    width: 4,
    backgroundColor: '#E23B57',
  },
  noteStripeGood: {
    backgroundColor: '#3DDC97',
  },
  noteText: {
    fontFamily: careerFont,
    color: '#fffaf6',
    fontSize: 15,
    fontWeight: '800' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  end: {
    gap: 10,
    marginTop: 4,
  },
  endTitle: {
    fontFamily: careerFont,
    color: '#fffaf6',
    fontSize: 28,
    fontWeight: '800' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  againPress: {
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  again: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  againShine: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#fff',
  },
  againText: {
    fontFamily: careerFont,
    color: '#3a1248',
    fontSize: 16,
    fontWeight: '800' as const,
    writingDirection: 'rtl' as const,
  },
  back: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  backText: {
    fontFamily: careerFont,
    color: '#fffaf6',
    fontSize: 16,
    fontWeight: '800' as const,
    writingDirection: 'rtl' as const,
  },
};
