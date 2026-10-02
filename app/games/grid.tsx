import { useState } from 'react';
import { Image, Platform, Pressable, Text, TextInput, View, type ImageStyle } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { GameEnd, Hearts, RoundNote } from '@/components/MiniGameChrome';
import { Screen } from '@/components/ui';
import { careerFont } from '@/lib/careerCardTheme';
import { makeGrid, missLine, searchStars, type GamePlayer, type GridPuzzle } from '@/lib/miniGames';

const NET = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Football_goal_net.jpg/1280px-Football_goal_net.jpg';
const CREAM = '#f7f4ea';

function face(): ImageStyle | null {
  if (Platform.OS !== 'web') return null;
  return { objectFit: 'cover', objectPosition: 'center 16%' } as ImageStyle;
}

function cellKey(nation: string, club: string) {
  return `${nation}::${club}`;
}

export default function GridGameScreen() {
  const router = useRouter();
  const [puzzle, setPuzzle] = useState<GridPuzzle>(() => makeGrid());
  const [filled, setFilled] = useState<Record<string, GamePlayer>>({});
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [lives, setLives] = useState(3);
  const [note, setNote] = useState<string | null>(null);
  const [bad, setBad] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);

  const done = over || won;
  const results = done || !active ? [] : searchStars(query);
  const placed = Object.keys(filled).length;

  function guess(player: GamePlayer) {
    if (!active || done) return;
    const [nation, club] = active.split('::');
    if (Object.values(filled).some((item) => item.id === player.id)) {
      setNote('השחקן כבר על הלוח');
      return;
    }
    if (player.club === club && player.nation === nation) {
      const next = { ...filled, [active]: player };
      setFilled(next);
      setQuery('');
      setNote(null);
      setBad(null);
      setActive(null);
      if (Object.keys(next).length >= 9) setWon(true);
      return;
    }
    const left = lives - 1;
    setLives(left);
    setBad(active);
    setNote(missLine(left));
    if (left <= 0) setOver(true);
  }

  function again() {
    setPuzzle(makeGrid());
    setFilled({});
    setActive(null);
    setQuery('');
    setLives(3);
    setNote(null);
    setBad(null);
    setOver(false);
    setWon(false);
  }

  return (
    <Screen scene="games" maxWidth={460}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.sheet}>
        <Image source={{ uri: NET }} resizeMode="cover" style={styles.shot} />
        <View style={styles.veil} />
        <View style={styles.pad}>
          <View style={styles.top}>
            <Text style={styles.pill}>{`מולאו ${placed}`}</Text>
            <Hearts lives={lives} />
          </View>
          <Text style={styles.title}>הרשת</Text>
          <Text style={styles.lead}>שם אחד בכל משבצת: שחקן שיושב גם על השורה וגם על הטור.</Text>
          {note && !done ? <RoundNote text={note} /> : null}

          <View style={styles.board}>
            <View style={styles.row}>
              <View style={styles.side} />
              {puzzle.clubs.map((club) => (
                <Text key={club} style={styles.head} numberOfLines={2}>{club}</Text>
              ))}
            </View>
            {puzzle.nations.map((nation) => (
              <View key={nation} style={styles.row}>
                <Text style={styles.side} numberOfLines={2}>{nation}</Text>
                {puzzle.clubs.map((club) => {
                  const key = cellKey(nation, club);
                  const player = filled[key];
                  const selected = active === key;
                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityLabel={player ? player.name : `${nation}, ${club}`}
                      disabled={Boolean(player) || done}
                      onPress={() => {
                        setActive(key);
                        setQuery('');
                        setBad(null);
                      }}
                      style={[styles.cell, selected && styles.cellOn, bad === key && styles.cellBad]}
                    >
                      {player ? (
                        <>
                          <Image source={{ uri: player.photo }} style={[styles.photo, face()]} />
                          <Text style={styles.cellName} numberOfLines={1}>{player.name}</Text>
                        </>
                      ) : (
                        <Text style={styles.plus}>+</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          {done ? (
            <GameEnd
              title={won ? 'השלמת את הרשת' : 'המשחק נגמר'}
              onAgain={again}
              onBack={() => router.push('/games')}
            />
          ) : active ? (
            <View style={styles.search}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="חפשו שחקן למשבצת"
                placeholderTextColor="rgba(26,20,12,0.45)"
                style={styles.field}
                autoCorrect={false}
              />
              {results.map((player) => (
                <Pressable key={player.id} accessibilityRole="button" onPress={() => guess(player)} style={styles.hit}>
                  <Text style={styles.hitName}>{player.name}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.hint}>לחצו על משבצת פנויה</Text>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = {
  sheet: {
    borderRadius: 22,
    overflow: 'hidden' as const,
    backgroundColor: '#2a1418',
    borderWidth: 1,
    borderColor: 'rgba(245,215,220,0.28)',
    position: 'relative' as const,
  },
  shot: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.28,
  },
  veil: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(42,20,24,0.58)',
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
    color: CREAM,
    fontSize: 13,
    fontWeight: '800' as const,
    overflow: 'hidden' as const,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    writingDirection: 'rtl' as const,
  },
  title: {
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 40,
    fontWeight: '800' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  lead: {
    fontFamily: careerFont,
    color: 'rgba(243,236,223,0.9)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  board: {
    gap: 6,
  },
  row: {
    flexDirection: 'row' as const,
    gap: 6,
    alignItems: 'stretch' as const,
  },
  head: {
    flex: 1,
    minHeight: 36,
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 12,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    writingDirection: 'rtl' as const,
  },
  side: {
    width: 58,
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 12,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    writingDirection: 'rtl' as const,
  },
  cell: {
    flex: 1,
    height: 78,
    borderRadius: 10,
    overflow: 'hidden' as const,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cellOn: {
    borderColor: '#ffe8c8',
    borderWidth: 2,
  },
  cellBad: {
    borderColor: '#E23B57',
    borderWidth: 2,
    backgroundColor: 'rgba(226,59,87,0.28)',
  },
  plus: {
    fontFamily: careerFont,
    color: '#f5d7dc',
    fontSize: 22,
    fontWeight: '800' as const,
  },
  photo: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  cellName: {
    position: 'absolute' as const,
    right: 0,
    left: 0,
    bottom: 0,
    paddingHorizontal: 2,
    paddingBottom: 3,
    paddingTop: 10,
    fontFamily: careerFont,
    color: '#fff',
    fontSize: 10,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    backgroundColor: 'rgba(0,0,0,0.45)',
    writingDirection: 'rtl' as const,
  },
  search: {
    gap: 8,
  },
  field: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: CREAM,
    color: '#1a140c',
    fontFamily: careerFont,
    fontSize: 16,
    fontWeight: '800' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  hit: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  hitName: {
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 16,
    fontWeight: '800' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  hint: {
    fontFamily: careerFont,
    color: 'rgba(243,236,223,0.8)',
    fontSize: 15,
    fontWeight: '700' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
};
