import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, Text, View, type ImageStyle } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { GameEnd, Hearts, RoundNote } from '@/components/MiniGameChrome';
import { Screen } from '@/components/ui';
import { careerFont } from '@/lib/careerCardTheme';
import { makeMarkRound, missLine, type MarkRound } from '@/lib/miniGames';

function face(colored: boolean): ImageStyle {
  const crop = Platform.OS === 'web' ? ({ objectFit: 'cover', objectPosition: 'center 18%' } as ImageStyle) : {};
  if (colored || Platform.OS !== 'web') return crop;
  return { ...crop, filter: 'grayscale(1)' } as ImageStyle;
}

export default function WhoGameScreen() {
  const router = useRouter();
  const [round, setRound] = useState<MarkRound>(() => makeMarkRound());
  const [lives, setLives] = useState(3);
  const [locked, setLocked] = useState<Record<string, 'hit' | 'miss'>>({});
  const [note, setNote] = useState<string | null>(null);
  const [good, setGood] = useState(false);
  const [over, setOver] = useState(false);
  const wait = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockedRef = useRef<Record<string, 'hit' | 'miss'>>({});
  const livesRef = useRef(3);

  useEffect(() => () => {
    if (wait.current) clearTimeout(wait.current);
  }, []);

  const remain = round.players.filter((player) => player.hit && locked[player.id] !== 'hit').length;

  function tap(id: string) {
    if (over || lockedRef.current[id] || wait.current) return;
    const player = round.players.find((item) => item.id === id);
    if (!player) return;
    if (player.hit) {
      const next = { ...lockedRef.current, [id]: 'hit' as const };
      lockedRef.current = next;
      setLocked(next);
      const cleared = round.players.filter((item) => item.hit).every((item) => next[item.id] === 'hit');
      if (!cleared) {
        setNote(null);
        return;
      }
      setGood(true);
      setNote('נכון');
      wait.current = setTimeout(() => {
        wait.current = null;
        lockedRef.current = {};
        setRound(makeMarkRound(round.prompt));
        setLocked({});
        setNote(null);
        setGood(false);
      }, 700);
      return;
    }
    const left = livesRef.current - 1;
    livesRef.current = left;
    setLives(left);
    const next = { ...lockedRef.current, [id]: 'miss' as const };
    lockedRef.current = next;
    setLocked(next);
    setGood(false);
    setNote(missLine(left));
    if (left <= 0) setOver(true);
  }

  function again() {
    if (wait.current) clearTimeout(wait.current);
    wait.current = null;
    lockedRef.current = {};
    livesRef.current = 3;
    setRound(makeMarkRound());
    setLives(3);
    setLocked({});
    setNote(null);
    setGood(false);
    setOver(false);
  }

  return (
    <Screen scene="games" maxWidth={460}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#ff8a1e', '#ff2f78', '#6a22d6']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.sheet}>
        <View style={styles.glow} />
        <View style={styles.pad}>
          <View style={styles.top}>
            <Text style={styles.pill}>{over ? 'נגמר' : `נשארו ${remain}`}</Text>
            <Hearts lives={lives} />
          </View>
          <Text style={styles.title}>נחש מי</Text>
          <Text style={styles.lead}>כולם בשחור־לבן. לחצו רק על מי שמתאים. צבע נשאר על נכון.</Text>

          <LinearGradient colors={['#fffaf4', '#ffe8c8']} style={styles.ask}>
            <View style={styles.askEdge} />
            <Text style={styles.askText}>{round.prompt}</Text>
          </LinearGradient>

          {note && !over ? <RoundNote text={note} good={good} /> : null}

          <View style={styles.tray}>
            {[0, 1, 2].map((row) => (
              <View key={row} style={styles.faceRow}>
                {round.players.slice(row * 3, row * 3 + 3).map((player) => {
                  const state = locked[player.id];
                  const colored = state === 'hit';
                  return (
                    <Pressable
                      key={player.id}
                      accessibilityRole="button"
                      accessibilityLabel={player.name}
                      onPress={() => tap(player.id)}
                      style={[styles.cell, state === 'miss' && styles.cellMiss, colored && styles.cellHit]}
                    >
                      <Image source={{ uri: player.photo }} style={[styles.photo, face(colored)]} />
                      {!colored && Platform.OS !== 'web' ? <View style={styles.grayWash} /> : null}
                      <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          {over ? (
            <GameEnd title="המשחק נגמר" onAgain={again} onBack={() => router.push('/games')} />
          ) : null}
        </View>
      </LinearGradient>
    </Screen>
  );
}

const styles = {
  sheet: {
    borderRadius: 22,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    position: 'relative' as const,
  },
  glow: {
    position: 'absolute' as const,
    top: -40,
    left: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,226,122,0.45)',
  },
  pad: {
    padding: 16,
    gap: 12,
  },
  top: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  pill: {
    fontFamily: careerFont,
    color: '#6a1480',
    fontSize: 13,
    fontWeight: '800' as const,
    overflow: 'hidden' as const,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    writingDirection: 'rtl' as const,
  },
  title: {
    fontFamily: careerFont,
    color: '#fffaf6',
    fontSize: 40,
    fontWeight: '800' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  lead: {
    fontFamily: careerFont,
    color: 'rgba(255,250,246,0.92)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  ask: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  askEdge: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    right: 0,
    width: 5,
    backgroundColor: '#ff2f78',
  },
  askText: {
    fontFamily: careerFont,
    color: '#3a1248',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  tray: {
    gap: 8,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  faceRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  cell: {
    flex: 1,
    height: 108,
    borderRadius: 12,
    overflow: 'hidden' as const,
    backgroundColor: '#2a1030',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cellMiss: {
    borderColor: '#E23B57',
    borderWidth: 2,
  },
  cellHit: {
    borderColor: '#ffe14a',
    borderWidth: 2,
  },
  photo: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  grayWash: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(20,20,24,0.55)',
  },
  name: {
    position: 'absolute' as const,
    right: 0,
    left: 0,
    bottom: 0,
    paddingHorizontal: 3,
    paddingTop: 12,
    paddingBottom: 4,
    fontFamily: careerFont,
    color: '#fff',
    fontSize: 11,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    backgroundColor: 'rgba(0,0,0,0.55)',
    writingDirection: 'rtl' as const,
  },
};
