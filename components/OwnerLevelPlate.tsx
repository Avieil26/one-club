import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Polygon, Stop } from 'react-native-svg';

import { careerFont } from '@/lib/careerCardTheme';
import type { XpProgress } from '@/lib/communityBoard';
import { playerLevelTone } from '@/lib/labels';

/** Small level pip. The ring is progress toward the next level. */
export function LevelMark({ progress }: { progress: XpProgress }) {
  const tone = playerLevelTone(progress.level);
  const filled = progress.maxed ? 1 : Math.min(1, progress.into / progress.span);
  const r = 16.5;
  const c = 2 * Math.PI * r;
  const gid = `lvl-mark-${progress.level}`;
  return (
    <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={40} height={40} style={{ position: 'absolute' }}>
        <Defs>
          <SvgGradient id={gid} x1="0.2" y1="0" x2="0.8" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" />
            <Stop offset="0.22" stopColor={tone.gradient[0]} />
            <Stop offset="0.62" stopColor={tone.gradient[1]} />
            <Stop offset="1" stopColor={tone.gradient[2]} />
          </SvgGradient>
        </Defs>
        <Circle cx={20} cy={20} r={r} stroke="rgba(8,12,16,0.9)" strokeWidth={4} fill="#0C1218" />
        <Circle cx={20} cy={20} r={r} stroke="rgba(255,255,255,0.2)" strokeWidth={2.4} fill="none" />
        <Circle
          cx={20}
          cy={20}
          r={r}
          stroke={tone.gradient[0]}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * filled} ${c}`}
          transform="rotate(-90 20 20)"
        />
        <Polygon points="20,8 30,13.5 30,26.5 20,32 10,26.5 10,13.5" fill={`url(#${gid})`} />
        <Polygon points="20,9.5 27,13.5 27,16.5 20,13 13,16.5 13,13.5" fill="rgba(255,255,255,0.35)" />
      </Svg>
      <Text style={{ color: tone.text, fontFamily: careerFont, fontSize: 12, fontWeight: '900' }}>{progress.level}</Text>
    </View>
  );
}

function XpFigure({ value }: { value: string }) {
  return <Text style={{ writingDirection: 'ltr', fontWeight: '900' }}>{`\u2066${value}\u2069`}</Text>;
}

/** Visual left of the profile. Tap opens a small window on this screen. */
export function LevelChip({ progress }: { progress: XpProgress }) {
  const [open, setOpen] = useState(false);
  const tone = playerLevelTone(progress.level);
  const xp = progress.xp.toLocaleString('en-US');
  const left = Math.max(0, progress.span - progress.into).toLocaleString('en-US');
  const next = String(progress.level + 1);
  return (
    <View style={{ width: 40, height: 40 }}>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`רמה ${progress.level}`}
        hitSlop={8}
      >
        <LevelMark progress={progress} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(4,8,12,0.78)', justifyContent: 'center', alignItems: 'center', padding: 22 }}
        >
          <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 340 }}>
            <View style={{ borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' }}>
              <LinearGradient colors={['#31404C', '#161D24', '#0C1116']} locations={[0, 0.45, 1]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']}
                  style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 56 }}
                />
                <View style={{ padding: 18, gap: 14, direction: 'rtl' }}>
                  <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#F7F4EA', fontFamily: careerFont, fontSize: 18, fontWeight: '900', writingDirection: 'rtl' }}>הרמה שלך</Text>
                    <Pressable onPress={() => setOpen(false)} hitSlop={10} accessibilityRole="button" accessibilityLabel="סגירה">
                      <Text style={{ color: 'rgba(247,244,234,0.7)', fontSize: 18, fontWeight: '800' }}>✕</Text>
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', direction: 'rtl', alignItems: 'center', gap: 14 }}>
                    <LevelMark progress={progress} />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ color: 'rgba(247,244,234,0.7)', fontFamily: careerFont, fontSize: 13, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' }}>
                        יש לך
                      </Text>
                      <Text style={{ color: tone.gradient[0], fontFamily: careerFont, fontSize: 28, fontWeight: '900', textAlign: 'right' }}>
                        <XpFigure value={`${xp} XP`} />
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: '#F7F4EA', fontFamily: careerFont, fontSize: 16, lineHeight: 24, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' }}>
                    {progress.maxed ? (
                      'רמה 50. אין לאן לעלות.'
                    ) : (
                      <>
                        צריך עוד <XpFigure value={`${left} XP`} /> לעלות לרמה <XpFigure value={next} />
                      </>
                    )}
                  </Text>
                  <View style={{ gap: 7, paddingTop: 2 }}>
                    <Text style={{ color: tone.gradient[0], fontFamily: careerFont, fontSize: 15, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' }}>
                      איך מרוויחים XP?
                    </Text>
                    <Text style={{ color: 'rgba(247,244,234,0.78)', fontFamily: careerFont, fontSize: 13, lineHeight: 21, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' }}>
                      • אתגר Career שאושר: <XpFigure value="25 XP" />
                    </Text>
                    <Text style={{ color: 'rgba(247,244,234,0.78)', fontFamily: careerFont, fontSize: 13, lineHeight: 21, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' }}>
                      • פתרון SBC שקיבל 3 סימוני «עבד לי»: <XpFigure value="15 XP" />
                    </Text>
                    <Text style={{ color: 'rgba(247,244,234,0.78)', fontFamily: careerFont, fontSize: 13, lineHeight: 21, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' }}>
                      • Squad שקיבל 3 דירוגים: <XpFigure value="10 XP" />
                    </Text>
                    <Text style={{ color: 'rgba(247,244,234,0.72)', fontFamily: careerFont, fontSize: 12, lineHeight: 20, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' }}>
                      • העלאת Pack מאושרת: <XpFigure value="5 XP" /> · עד 5 פעולות בשבוע
                    </Text>
                    <Text style={{ color: 'rgba(247,244,234,0.72)', fontFamily: careerFont, fontSize: 12, lineHeight: 20, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' }}>
                      • אימות רמה ב־Grounds: <XpFigure value="5 XP" /> · עד 5 בשבוע
                    </Text>
                    <Text style={{ color: 'rgba(247,244,234,0.72)', fontFamily: careerFont, fontSize: 12, lineHeight: 20, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' }}>
                      • דירוג Squad של שחקן אחר: <XpFigure value="2 XP" /> · עד 5 בשבוע
                    </Text>
                    <Text style={{ color: 'rgba(247,244,234,0.72)', fontFamily: careerFont, fontSize: 12, lineHeight: 20, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' }}>
                      • סימון פתרון SBC כ«עבד לי»: <XpFigure value="2 XP" /> לכל פתרון
                    </Text>
                    <Text style={{ color: 'rgba(247,244,234,0.72)', fontFamily: careerFont, fontSize: 12, lineHeight: 20, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' }}>
                      • תגובה שעוברת לאישור ופרסום: <XpFigure value="1 XP" /> · עד 5 בשבוע
                    </Text>
                    <Text style={{ color: 'rgba(247,244,234,0.55)', fontFamily: careerFont, fontSize: 12, lineHeight: 19, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' }}>
                      משחקונים לא נותנים XP — הם רק לכיף.
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
