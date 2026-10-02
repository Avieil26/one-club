import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, Text, View, type ImageStyle } from 'react-native';
import { Stack } from 'expo-router';

import { ClubBadge } from '@/components/ClubBadge';
import { Screen } from '@/components/ui';
import { careerFont } from '@/lib/careerCardTheme';
import { nextClubQuestion, type ClubQuestion } from '@/lib/clubQuiz';

const CREAM = '#F4F1E6';
const ROSE = '#FF8FA3';
const POINTS = 12;

function face(position: string): ImageStyle | null {
  if (Platform.OS !== 'web') return null;
  return { objectFit: 'cover', objectPosition: position } as ImageStyle;
}

export default function ClubGameScreen() {
  const [used, setUsed] = useState<string[]>([]);
  const [question, setQuestion] = useState<ClubQuestion | null>(() => nextClubQuestion([]));
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    if (!pick || !question || over) return;
    const correct = pick === question.club;
    const timer = setTimeout(() => {
      const nextUsed = [...used, question.playerId];
      const nextLives = correct ? lives : lives - 1;
      if (!correct && nextLives <= 0) {
        setLives(0);
        setOver(true);
        setPick(null);
        return;
      }
      const next = nextClubQuestion(nextUsed);
      setUsed(nextUsed);
      setLives(nextLives);
      setQuestion(next);
      setPick(null);
      if (!next) setOver(true);
    }, 900);
    return () => clearTimeout(timer);
  }, [pick, question, over, used, lives]);

  function choose(club: string) {
    if (!question || pick || over) return;
    setPick(club);
    if (club === question.club) setScore((value) => value + POINTS);
  }

  function again() {
    setUsed([]);
    setQuestion(nextClubQuestion([]));
    setLives(3);
    setScore(0);
    setPick(null);
    setOver(false);
  }

  return (
    <Screen scene="games" maxWidth={460}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.sheet}>
        <View style={styles.stripes}>
          {['#E23B57', '#F4F1E6', '#6B1D32'].map((color) => (
            <View key={color} style={{ flex: 1, backgroundColor: color }} />
          ))}
        </View>
        <View style={styles.pad}>
          <View style={styles.top}>
            <Text style={styles.pill}>+{POINTS} לניחוש</Text>
            <View style={styles.lives}>
              {[0, 1, 2].map((index) => (
                <View key={index} style={[styles.life, index >= lives && styles.lifeOff]} />
              ))}
            </View>
          </View>
          <Text style={styles.title}>איזה מועדון?</Text>
          <Text style={styles.lead}>
            {over ? `הסיבוב נגמר. ניקוד ${score}.` : 'השם מוסתר. שלוש טעויות סוגרות את הסיבוב.'}
          </Text>

          {question && !over ? (
            <>
              <View style={styles.shot}>
                <Image source={{ uri: question.photo }} style={[styles.shotImage, face('center 12%')]} />
              </View>
              {question.choices.map((club) => {
                const revealed = pick !== null;
                const correct = revealed && club === question.club;
                const wrong = revealed && club === pick && club !== question.club;
                return (
                  <Pressable
                    key={club}
                    accessibilityRole="button"
                    onPress={() => choose(club)}
                    style={[styles.opt, correct && styles.optRight, wrong && styles.optWrong]}
                  >
                    <Text style={styles.optText}>{club}</Text>
                    <ClubBadge club={club} size={28} />
                  </Pressable>
                );
              })}
            </>
          ) : null}

          {over ? (
            <Pressable accessibilityRole="button" onPress={again} style={styles.again}>
              <View style={styles.inset} />
              <View style={styles.pip} />
              <Text style={styles.againText}>עוד סיבוב</Text>
            </Pressable>
          ) : (
            <Text style={styles.score}>ניקוד {score}</Text>
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
    backgroundColor: '#14090D',
    borderWidth: 1,
    borderColor: 'rgba(255,143,163,0.28)',
  },
  stripes: {
    height: 7,
    flexDirection: 'row' as const,
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
    color: ROSE,
    fontSize: 12,
    fontWeight: '800' as const,
    overflow: 'hidden' as const,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  lives: {
    flexDirection: 'row' as const,
    gap: 6,
  },
  life: {
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: '#E23B57',
  },
  lifeOff: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  title: {
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 30,
    fontWeight: '800' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  lead: {
    fontFamily: careerFont,
    color: 'rgba(247,244,234,0.74)',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  shot: {
    height: 250,
    borderRadius: 18,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: 'rgba(255,143,163,0.35)',
    backgroundColor: '#2A1218',
    position: 'relative' as const,
  },
  shotImage: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  opt: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optRight: {
    borderColor: '#3DDC97',
    backgroundColor: 'rgba(61,220,151,0.12)',
  },
  optWrong: {
    borderColor: '#E23B57',
    backgroundColor: 'rgba(226,59,87,0.16)',
  },
  optText: {
    fontFamily: careerFont,
    color: CREAM,
    fontSize: 16,
    fontWeight: '800' as const,
    writingDirection: 'rtl' as const,
  },
  score: {
    fontFamily: careerFont,
    color: 'rgba(247,244,234,0.7)',
    fontSize: 13,
    fontWeight: '700' as const,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  },
  again: {
    height: 44,
    borderRadius: 8,
    backgroundColor: CREAM,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-end' as const,
  },
  inset: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    right: 0,
    width: 4,
    backgroundColor: '#B4233C',
  },
  pip: {
    width: 8,
    height: 8,
    backgroundColor: '#E23B57',
  },
  againText: {
    fontFamily: careerFont,
    color: '#2A0A12',
    fontSize: 15,
    fontWeight: '800' as const,
    writingDirection: 'rtl' as const,
  },
};
