import { CountryPicker } from '@/components/CountryPicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Image, Pressable, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { AvatarCropModal } from '@/components/AvatarCropModal';
import { Screen } from '@/components/ui';
import { GROUNDS_PREVIEW_BACKGROUND } from '@/assets/groundsPreviewBackground';
import { GROUNDS_PLAYSTYLE_CATEGORIES, GROUNDS_PLAYSTYLES, selectionForPlayStyle } from '@/lib/groundsPlaystyles';
import { errorMessage } from '@/lib/format';
import { pickImages } from '@/lib/images';
import { ARCHETYPES, DIVISIONS, POSITIONS, playerLevelTone } from '@/lib/labels';
import { useApp } from '@/lib/store';
import { useLanguage } from '@/lib/language';
import { groundsLabel } from '@/lib/groundsLocalization';
import type { DivisionId, GroundsIntent, GroundsPlayStyle, PlatformId } from '@/lib/types';

const LEVELS = Array.from({ length: 50 }, (_, index) => index + 1);
const PLATFORMS: { id: PlatformId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'ps5', label: 'PlayStation 5', icon: 'game-controller-outline' },
  { id: 'xbox', label: 'Xbox', icon: 'game-controller-outline' },
  { id: 'pc', label: 'PC', icon: 'desktop-outline' },
  { id: 'switch2', label: 'Switch 2', icon: 'game-controller-outline' },
];

const colors = {
  ink: '#F5F8FA', muted: '#A9BBC6', cyan: '#44D8E5', green: '#8FF2A1', gold: '#E9C36A',
  panel: 'rgba(3, 13, 22, 0.94)', line: 'rgba(88, 187, 206, 0.25)',
};

function FieldLabel({ children, optional = false }: { children: string; optional?: boolean }) {
  const { locale, isRTL: rtl } = useLanguage();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', direction: rtl ? 'rtl' : 'ltr', marginBottom: 7 }}>
      <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14, textAlign: rtl ? 'right' : 'left' }}>{groundsLabel(children, locale)}</Text>
      {optional ? <Text style={{ color: '#D0DCE2', fontSize: 11, fontWeight: '800' }}>{groundsLabel("רשות", locale)}</Text> : null}
    </View>
  );
}

function TextField({ label, value, onChangeText, placeholder, keyboardType, maxLength, optional = false }: {
  label: string; value: string; onChangeText: (value: string) => void; placeholder: string;
  keyboardType?: 'default' | 'number-pad'; maxLength?: number; optional?: boolean;
}) {
  const { locale, isRTL: rtl } = useLanguage();
  return (
    <View style={{ flex: 1, minWidth: 220 }}>
      <FieldLabel optional={optional}>{label}</FieldLabel>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={groundsLabel(placeholder, locale)}
        placeholderTextColor="#718591"
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={{ minHeight: 46, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(103, 166, 188, 0.35)', backgroundColor: 'rgba(1, 8, 14, 0.88)', color: colors.ink, paddingHorizontal: 12, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr', fontSize: 13 }}
        accessibilityLabel={groundsLabel(label, locale)}
      />
    </View>
  );
}

function Section({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon: keyof typeof Ionicons.glyphMap; children: ReactNode }) {
  const { locale, isRTL: rtl } = useLanguage();
  return (
    <View style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.panel, padding: 16, gap: 15 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, direction: rtl ? 'rtl' : 'ltr', borderBottomWidth: 1, borderBottomColor: 'rgba(93, 168, 190, 0.17)', paddingBottom: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(68,216,229,0.35)', backgroundColor: 'rgba(22,65,79,0.48)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={18} color={colors.cyan} />
        </View>
        <View style={{ flex: 1, gap: 3, alignItems: 'flex-start' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '900', textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }}>{groundsLabel(title, locale)}</Text>
          {subtitle ? <Text style={{ color: '#D0DCE2', fontSize: 11, fontWeight: '700', textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }}>{groundsLabel(subtitle, locale)}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function DivisionBadge({ id }: { id: string }) {
  const colorsByRank: Record<string, string> = {
    elite: '#B78AFF', '1': '#E76668', '2': '#D6B968', '3': '#C99254', '4': '#8C9CFF',
    '5': '#6DAAD6', '6': '#61B6B0', '7': '#77B77B', '8': '#8C9BA7', '9': '#A1ADB5', '10': '#B7C0C6',
  };
  const tint = colorsByRank[id] ?? '#C7D1D7';
  const mark = id === 'elite' ? 'E' : id;
  return (
    <View accessibilityLabel={id === 'elite' ? 'Elite' : `Division ${id}`} style={{ width: 25, height: 28, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="shield" size={25} color={tint} />
      <Text style={{ position: 'absolute', color: '#07111A', fontSize: id === '10' ? 8 : 9, lineHeight: 11, fontWeight: '900', textAlign: 'center' }}>{mark}</Text>
    </View>
  );
}

function ChoiceChips({ label, values, value, onChange, columns, divisionBadges = false }: {
  label: string; values: { id: string; label: string }[]; value: string; onChange: (value: string) => void; columns?: number; divisionBadges?: boolean;
}) {
  const { locale, isRTL: rtl } = useLanguage();
  return (
    <View style={{ gap: 8 }}>
      <FieldLabel>{label}</FieldLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, direction: rtl ? 'rtl' : 'ltr' }}>
        {values.map((option) => {
          const selected = value === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => onChange(option.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => ({ minHeight: 43, flexGrow: columns ? 0 : 1, flexBasis: columns ? `${100 / columns - 2}%` : 'auto', paddingHorizontal: 10, borderRadius: 7, borderWidth: 1, borderColor: selected ? colors.gold : 'rgba(160, 177, 188, 0.35)', backgroundColor: selected ? 'rgba(71, 52, 20, 0.72)' : 'rgba(5, 17, 27, 0.94)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, direction: divisionBadges ? 'ltr' : rtl ? 'rtl' : 'ltr' }}>
                {divisionBadges ? <DivisionBadge id={option.id} /> : null}
                <Text style={{ color: selected ? '#FFFFFF' : '#E8EEF1', fontSize: 12, fontWeight: '900', textAlign: 'center' }}>{groundsLabel(option.label, locale)}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function PlayStyleCard({ item, selected, onSelect }: {
  item: (typeof GROUNDS_PLAYSTYLES)[number]; selected: 'base' | 'plus' | null; onSelect: (tier: 'base' | 'plus') => void;
}) {
  const { locale, isRTL: rtl } = useLanguage();
  const tierButton = (tier: 'base' | 'plus', label: string) => {
    const active = selected === tier;
    const accent = tier === 'plus' ? colors.gold : '#D9E4EA';
    return (
      <Pressable
        onPress={() => onSelect(tier)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${tier === 'plus' ? 'PlayStyle Plus' : groundsLabel('PlayStyle רגיל', locale)}`}
        accessibilityState={{ selected: active }}
        style={{ minHeight: 26, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 4, borderWidth: 1, borderColor: active ? accent : 'rgba(131, 158, 171, 0.18)', backgroundColor: active ? (tier === 'plus' ? 'rgba(124, 87, 23, 0.48)' : 'rgba(164, 185, 196, 0.2)') : 'rgba(0,0,0,0.23)', paddingHorizontal: 3 }}
      >
        <Text style={{ color: active ? accent : '#8799A4', fontSize: 8, fontWeight: '900' }}>{groundsLabel(label, locale)}</Text>
      </Pressable>
    );
  };
  const highlighted = Boolean(selected);
  const highlightColor = selected === 'plus' ? colors.gold : '#D9E4EA';
  return (
    <View style={{ width: '48.5%', minWidth: 130, flexGrow: 1, borderRadius: 7, borderWidth: 1, borderColor: highlighted ? `${highlightColor}88` : 'rgba(92, 144, 163, 0.24)', backgroundColor: highlighted ? 'rgba(14, 39, 50, 0.88)' : 'rgba(2, 13, 21, 0.78)', padding: 9, gap: 7 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, direction: rtl ? 'rtl' : 'ltr' }}>
        <View style={{ width: 40, height: 40, borderRadius: 6, backgroundColor: selected === 'plus' ? 'rgba(209,164,68,0.18)' : 'rgba(149,173,188,0.14)', borderWidth: 1, borderColor: highlighted ? highlightColor : 'rgba(149,173,188,0.25)', alignItems: 'center', justifyContent: 'center' }}>
          <Image source={item.icon} resizeMode="contain" style={{ width: 34, height: 34, tintColor: colors.gold }} accessibilityLabel={`${item.name} PlayStyle icon`} />
        </View>
        <Text numberOfLines={2} style={{ flex: 1, color: colors.ink, fontSize: 10, lineHeight: 14, fontWeight: '800', textAlign: rtl ? 'right' : 'left' }}>{item.name}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 5 }}>
        {tierButton('base', 'רגיל')}
        {tierButton('plus', 'PLUS +')}
      </View>
    </View>
  );
}

export default function NewGroundsScreen() {
  const { language, locale, t, isRTL: rtl } = useLanguage();
  const app = useApp();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 680;
  const [intent, setIntent] = useState<GroundsIntent>('need_player');
  const [platform, setPlatform] = useState<PlatformId>('ps5');
  const [position, setPosition] = useState(POSITIONS[0]);
  const [division, setDivision] = useState<DivisionId>('7');
  const [playerLevel, setPlayerLevel] = useState(1);
  const [skillRating, setSkillRating] = useState('');
  const [archetype, setArchetype] = useState('');
  const [region, setRegion] = useState('IL');
  const [eaId, setEaId] = useState('');
  const [gamertag, setGamertag] = useState('');
  const [rawUri, setRawUri] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [playStyles, setPlayStyles] = useState<GroundsPlayStyle[]>([]);
  const levelTone = playerLevelTone(playerLevel);
  const playStyleCount = playStyles.length;

  async function choosePhoto() {
    try {
      const picked = await pickImages(1);
      if (!picked[0]) return;
      setRawUri(picked[0]);
      setCropOpen(true);
    } catch (error) {
      Alert.alert(groundsLabel("רגע", locale), errorMessage(error, locale));
    }
  }

  function setPlayStyle(id: string, tier: 'base' | 'plus') {
    setPlayStyles((current) => {
      const selected = selectionForPlayStyle(current, id);
      return selected === tier ? current.filter((item) => item.id !== id) : [...current.filter((item) => item.id !== id), { id, tier }];
    });
  }

  async function save() {
    if (saving) return;
    if (!app.user) {
      Alert.alert(groundsLabel("צריך להתחבר", locale), groundsLabel("התחברו כדי לשמור את פרופיל השחקן שלכם.", locale));
      router.push('/register');
      return;
    }
    if (!gamertag.trim() && !eaId.trim()) {
      Alert.alert(groundsLabel("חסר פרטי התחברות למשחק", locale), groundsLabel("צריך למלא לפחות שם משתמש או EA ID לפני הפרסום.", locale));
      return;
    }
    if (skillRating.trim() && (!/^\d+$/.test(skillRating.trim()) || Number(skillRating) < 1 || Number(skillRating) > 5000)) {
      Alert.alert(groundsLabel("Skill Rating לא תקין", locale), groundsLabel("אפשר להזין מספר בין 1 ל־5,000.", locale));
      return;
    }
    setSaving(true);
    try {
      if (avatarUri) await app.setAvatar(avatarUri);
      await app.createGrounds({
        intent,
        platform,
        position,
        division,
        playerLevel,
        skillRating,
        archetype: archetype || 'לא צוין עדיין',
        region,
        eaId,
        gamertag,
        avatarUri: null,
        levelImageUri: null,
        playStyles,
      });
      Alert.alert(groundsLabel("הפרופיל פורסם", locale), groundsLabel("הפרטים נשמרו בגראונדס.", locale));
      router.replace('/grounds');
    } catch (error) {
      Alert.alert(groundsLabel("שמירת הפרופיל נכשלה", locale), errorMessage(error, locale));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scene="grounds" maxWidth={1180} backgroundImage={GROUNDS_PREVIEW_BACKGROUND}>
      <Stack.Screen options={{ title: groundsLabel('יצירת פרופיל · THE GROUNDS', locale) }} />
      <View style={{ gap: 16, paddingBottom: 14 }}>
        <View style={{ minHeight: compact ? 180 : 220, overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(80, 201, 220, 0.44)', justifyContent: 'flex-end', backgroundColor: 'rgba(2, 11, 19, 0.78)' }}>
          <LinearGradient colors={['rgba(1,8,14,0.06)', 'rgba(2,10,17,0.28)', 'rgba(2,10,17,0.94)']} locations={[0, 0.4, 1]} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
          <View style={{ padding: compact ? 17 : 24, gap: 8, alignItems: 'flex-start', direction: rtl ? 'rtl' : 'ltr' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 99, backgroundColor: 'rgba(2,11,18,0.76)', borderWidth: 1, borderColor: 'rgba(143,242,161,0.35)', paddingHorizontal: 10, paddingVertical: 5 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green }} />
              <Text style={{ color: colors.green, fontSize: 9, fontWeight: '900' }}>FC 27 · CLUBS</Text>
            </View>
            <Text style={{ color: colors.ink, fontSize: compact ? 24 : 31, fontWeight: '900', textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }}>{groundsLabel("בונים את הפרופיל שלך", locale)}</Text>
            <Text style={{ color: '#E0E8ED', maxWidth: 620, fontSize: 12, lineHeight: 19, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }}>{groundsLabel("הפרטים והסגנונות שתבחרו יוצגו לשחקנים שמחפשים אתכם בגראונדס.", locale)}</Text>
          </View>
        </View>

        <Section title="סוג פרופיל ופלטפורמה" subtitle="בחרו מה אתם מחפשים ואיפה אתם משחקים" icon="people-outline">
          <ChoiceChips
            label="מטרת הפרסום"
            values={[{ id: 'need_player', label: 'המועדון שלי מחפש שחקנים' }, { id: 'looking_for_club', label: 'אני מחפש מועדון' }]}
            value={intent}
            onChange={(value) => setIntent(value as GroundsIntent)}
          />
          <View style={{ gap: 8 }}>
            <FieldLabel>פלטפורמה</FieldLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, direction: rtl ? 'rtl' : 'ltr' }}>
              {PLATFORMS.map((item) => {
                const selected = platform === item.id;
                return (
                  <Pressable key={item.id} onPress={() => setPlatform(item.id)} accessibilityRole="button" accessibilityState={{ selected }} style={{ minHeight: 45, flexGrow: 1, flexBasis: compact ? '45%' : '22%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, borderRadius: 6, borderWidth: 1, borderColor: selected ? colors.cyan : 'rgba(111, 153, 171, 0.28)', backgroundColor: selected ? 'rgba(29, 106, 119, 0.48)' : 'rgba(5, 17, 27, 0.82)', paddingHorizontal: 8 }}>
                    <Ionicons name={item.icon} size={16} color={selected ? colors.cyan : colors.muted} />
                    <Text style={{ color: selected ? colors.cyan : '#C7D5DD', fontSize: 10, fontWeight: '800' }}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Section>

        <Section title="פרטי השחקן" subtitle="הוסיפו מספיק מידע כדי ששחקנים יוכלו למצוא אתכם" icon="person-circle-outline">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 11, direction: rtl ? 'rtl' : 'ltr' }}>
            <TextField label={platform === 'pc' ? 'שם משתמש במחשב' : 'שם משתמש במשחק'} value={gamertag} onChangeText={setGamertag} placeholder="כמו שמופיע ב־EA או בקונסולה" maxLength={40} />
            <TextField label="EA ID" value={eaId} onChangeText={setEaId} placeholder="מזהה EA שלכם" maxLength={40} />
          </View>
          <Text style={{ color: '#8FA4AF', fontSize: 10, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }}>{groundsLabel("צריך למלא לפחות שם משתמש אחד או EA ID.", locale)}</Text>
          <ChoiceChips label="עמדה מועדפת" values={POSITIONS.map((item) => ({ id: item, label: item }))} value={position} onChange={setPosition} />
          <ChoiceChips label="Division ב־Clubs" values={DIVISIONS.map((item) => ({ id: item.id, label: item.label }))} value={division} onChange={(value) => setDivision(value as DivisionId)} divisionBadges />
          <ChoiceChips label="ארכיטיפ ב־Clubs" values={[{ id: '', label: 'לא בחרתי עדיין' }, ...ARCHETYPES.map((item) => ({ id: item, label: item }))]} value={archetype} onChange={setArchetype} />
          <Text style={{ color: '#D0DCE2', fontSize: 11, fontWeight: '700', lineHeight: 17, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }}>{groundsLabel("ארכיטיפ הוא סוג הבנייה של ה־Pro, כמו Finisher או Creator. הוא משפיע על ההתפתחות וה־PlayStyles הייחודיים. אין לך את המשחק או שאתה לא בטוח? אפשר להשאיר ריק.", locale)}</Text>
          {archetype ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', direction: rtl ? 'rtl' : 'ltr' }}>
            <View style={{ flex: 1, minWidth: 230, gap: 8 }}>
              <FieldLabel optional>רמת ארכיטיפ</FieldLabel>
              <View style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(103, 166, 188, 0.35)', borderRadius: 7, backgroundColor: 'rgba(1, 8, 14, 0.88)', paddingHorizontal: 8 }}>
                <Pressable onPress={() => setPlayerLevel((level) => Math.max(1, level - 1))} accessibilityRole="button" accessibilityLabel={groundsLabel("הפחתת רמה", locale)} style={{ width: 34, height: 34, borderRadius: 6, backgroundColor: 'rgba(29,106,119,0.35)', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="remove" size={18} color={colors.cyan} /></Pressable>
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: 7 }}>
                  <Text style={{ color: levelTone.bg, fontSize: 12, fontWeight: '900' }}>{groundsLabel(levelTone.label, locale)}</Text>
                  <TextInput value={String(playerLevel)} onChangeText={(value) => { const next = Number(value.replace(/\D/g, '')); if (next >= 1 && next <= 50) setPlayerLevel(next); }} keyboardType="number-pad" maxLength={2} style={{ minWidth: 48, color: colors.ink, fontSize: 19, fontWeight: '900', textAlign: 'center', padding: 2 }} accessibilityLabel={groundsLabel("רמת ארכיטיפ בין 1 ל-50", locale)} />
                  <Text style={{ color: colors.muted, fontSize: 10 }}>/ 50</Text>
                </View>
                <Pressable onPress={() => setPlayerLevel((level) => Math.min(50, level + 1))} accessibilityRole="button" accessibilityLabel={groundsLabel("העלאת רמה", locale)} style={{ width: 34, height: 34, borderRadius: 6, backgroundColor: 'rgba(29,106,119,0.35)', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="add" size={18} color={colors.cyan} /></Pressable>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, direction: rtl ? 'rtl' : 'ltr' }}>
                {LEVELS.filter((level) => level === 1 || level === 50 || level % 10 === 0).map((level) => <Pressable key={level} onPress={() => setPlayerLevel(level)} style={{ minWidth: 34, minHeight: 28, borderRadius: 5, borderWidth: 1, borderColor: level === playerLevel ? colors.cyan : 'rgba(111,153,171,0.24)', backgroundColor: level === playerLevel ? 'rgba(29,106,119,0.42)' : 'rgba(5,17,27,0.75)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: level === playerLevel ? colors.cyan : colors.muted, fontSize: 9, fontWeight: '800' }}>{level}</Text></Pressable>)}
              </View>
            </View>
          </View> : null}
          <TextField label="Skill Rating" value={skillRating} onChangeText={(value) => setSkillRating(value.replace(/\D/g, ''))} placeholder="לדוגמה: 1,250" keyboardType="number-pad" maxLength={4} optional />
          <CountryPicker value={region} onChange={setRegion} />
        </Section>

        <Section title="PlayStyles" subtitle={t('36 הסגנונות של FC 27 · {count} נבחרו', '36 FC 27 PlayStyles · {count} selected').replace('{count}', String(playStyleCount))} icon="flash-outline">
          <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }}>{groundsLabel("בחרו את הסגנונות שמופיעים אצלכם ב־My Pro. אפשר לסמן רגיל או PlayStyle+ לכל סגנון; סמני השוערות מוצגים בנפרד.", locale)}</Text>
          {GROUNDS_PLAYSTYLE_CATEGORIES.map((category) => {
            const items = GROUNDS_PLAYSTYLES.filter((style) => style.category === category.id);
            return (
              <View key={category.id} style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, direction: rtl ? 'rtl' : 'ltr' }}>
                  <View style={{ width: 4, height: 17, borderRadius: 2, backgroundColor: category.id === 'Goalkeeping' ? colors.gold : colors.cyan }} />
                  <Text style={{ color: colors.ink, fontSize: 12, fontWeight: '900', textAlign: rtl ? 'right' : 'left' }}>{t(category.label, category.id)}</Text>
                  <Text style={{ color: colors.muted, fontSize: 9 }}>{items.length}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, direction: rtl ? 'rtl' : 'ltr' }}>
                  {items.map((item) => (
                    <PlayStyleCard key={item.id} item={item} selected={selectionForPlayStyle(playStyles, item.id)} onSelect={(tier) => setPlayStyle(item.id, tier)} />
                  ))}
                </View>
              </View>
            );
          })}
        </Section>

        <Section title="תמונת פרופיל" subtitle="תמונה ברורה עוזרת לשחקנים לזהות אתכם" icon="image-outline">
          <Text style={{ color: colors.muted, fontSize: 10, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }}>{groundsLabel("אפשר להעלות תמונה, לחתוך אותה, ולשמור אותה כתמונת המשתמש שלכם.", locale)}</Text>
          <Pressable onPress={() => void choosePhoto()} accessibilityRole="button" style={{ minHeight: 48, borderRadius: 7, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.cyan, backgroundColor: 'rgba(12, 42, 54, 0.42)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
            <Ionicons name={avatarUri ? 'refresh-outline' : 'cloud-upload-outline'} size={18} color={colors.cyan} />
            <Text style={{ color: colors.cyan, fontSize: 12, fontWeight: '900' }}>{groundsLabel(avatarUri ? 'בחירת תמונה אחרת' : 'בחירת תמונה וחיתוך', locale)}</Text>
          </Pressable>
          {avatarUri ? (
            <Pressable onPress={() => rawUri && setCropOpen(true)} accessibilityRole="button" style={{ alignSelf: 'center', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 92, height: 92, borderRadius: 46, overflow: 'hidden', borderWidth: 2, borderColor: levelTone.bg }}><Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /></View>
              <Text style={{ color: colors.muted, fontSize: 9 }}>{groundsLabel("לחצו על התמונה לעריכת החיתוך", locale)}</Text>
            </Pressable>
          ) : null}
        </Section>

        <Pressable onPress={() => void save()} disabled={saving} accessibilityRole="button" style={({ pressed }) => ({ minHeight: 52, borderRadius: 8, overflow: 'hidden', opacity: saving ? 0.65 : pressed ? 0.84 : 1 })}>
          <LinearGradient colors={['#70E8E8', '#49D4DA', '#9FF3B0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Ionicons name={saving ? 'hourglass-outline' : 'checkmark-circle-outline'} size={19} color="#06151A" />
            <Text style={{ color: '#06151A', fontSize: 14, fontWeight: '900' }}>{groundsLabel(saving ? 'שומר את הפרופיל…' : app.user ? 'שמירת פרופיל בגראונדס' : 'התחברות לפרסום פרופיל', locale)}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {rawUri ? (
        <AvatarCropModal
          uri={rawUri}
          visible={cropOpen}
          onCancel={() => setCropOpen(false)}
          onConfirm={(cropped) => {
            setAvatarUri(cropped);
            setCropOpen(false);
          }}
        />
      ) : null}
    </Screen>
  );
}
