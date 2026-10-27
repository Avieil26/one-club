import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions, type TextStyle, type ViewStyle } from 'react-native';
import { GalleryGradeBadge, gradeMetals } from './GalleryGradeBadge';
import { useLanguage } from '@/lib/language';
import type { GalleryGrade, GalleryItem, GallerySet } from '@/lib/galleryTypes';
import { GALLERY_GRADES } from '@/lib/galleryTypes';
export const galleryColors = { bg: '#0B1117', panel: '#141C23', line: '#394650', text: '#F4F1E9', muted: '#BDC2CB', orange: '#FF8B36', gold: '#D6BD85' };
export function GalleryText({ children, size = 15, quiet = false, style, testID }: { children: ReactNode; size?: number; quiet?: boolean; style?: TextStyle; testID?: string }) {
 const { isRTL } = useLanguage();
 return <Text testID={testID} style={{ color: quiet ? galleryColors.muted : galleryColors.text, fontSize: size, lineHeight: size * 1.45, textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr', ...style }}>{children}</Text>;
}
export function GalleryPanel({ children, style }: { children: ReactNode; style?: ViewStyle }) {
 return <LinearGradient colors={['rgba(31,40,48,0.93)', 'rgba(12,19,25,0.95)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.panel, style]}>{children}</LinearGradient>;
}
export function GalleryButton({ label, onPress, active = false, primary = false, disabled = false, testID, compact = false }: { label: string; onPress: () => void; active?: boolean; primary?: boolean; disabled?: boolean; testID?: string; compact?: boolean }) {
 return <Pressable testID={testID} accessibilityRole="button" accessibilityState={{ disabled, selected: active }} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ minHeight: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 8, paddingVertical: 10, paddingHorizontal: compact?8:15, borderWidth: 1, borderColor: active || primary ? galleryColors.orange : galleryColors.line, backgroundColor: primary ? '#F98732' : active ? '#38291D' : '#161C25', opacity: disabled ? 0.45 : pressed ? 0.75 : 1 })}><Text style={{ color: primary ? '#17110B' : active ? '#FFD6B1' : galleryColors.text, fontSize: compact?12:14, fontWeight: '700', textAlign: 'center' }}>{label}</Text></Pressable>;
}
export function GallerySearch({ value, onChangeText, placeholder }: { value: string; onChangeText: (value: string) => void; placeholder: string }) {
 const { isRTL } = useLanguage();
 return <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, backgroundColor: '#121820', borderWidth: 1, borderColor: galleryColors.line, borderRadius: 8, paddingHorizontal: 14 }}><Ionicons name="search-outline" size={20} color={galleryColors.muted} /><TextInput accessibilityLabel={placeholder} placeholder={placeholder} value={value} onChangeText={onChangeText} placeholderTextColor="#AAB2BF" style={{ flex: 1, minWidth: 0, minHeight: 50, color: galleryColors.text, fontSize: 15, textAlign: isRTL ? 'right' : 'left', paddingVertical: 12 }} /></View>;
}
export function GalleryToken({ value, size = 18 }: { value?: number | string; size?: number }) {
 return <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 6 }}><Image accessibilityLabel="Gallery Token" source={require('@/assets/images/gallery-token.png')} resizeMode="contain" style={{ width: size + 6, height: size + 6 }} />{value !== undefined ? <Text style={{ color: '#E5CD99', fontSize: size, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{value}</Text> : null}</View>;
}
export function GalleryPoints({ value, size = 16 }: { value: number; size?: number }) {
 return <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 6 }}><Image source={require('@/assets/images/item-score.png')} accessibilityLabel="Item Score" style={{ width: size + 2, height: size + 2 }} resizeMode="contain" /><Text style={{ fontSize: size, color: '#CEF4D9', fontWeight: '700', fontVariant: ['tabular-nums'] }}>{value.toLocaleString('en-US')}</Text></View>;
}
export function GalleryGrades({ value, onChange, available }: { value: GalleryGrade | null; onChange?: (grade: GalleryGrade) => void; available?: GalleryGrade[] }) {
 return <View testID="gallery-grade-selector" style={{ flexDirection: 'row', direction: 'ltr', gap: 5 }}>{GALLERY_GRADES.map(grade => {
  const active = value === grade, metal = gradeMetals[grade];
  const badge = <GalleryGradeBadge grade={grade} size={onChange ? 49 : 34} muted={!!available && !available.includes(grade)} />;
  const style: ViewStyle = { flex: 1, minWidth: 28, minHeight: onChange ? 64 : 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: active ? metal.light : '#38434D', backgroundColor: active ? metal.dark : 'rgba(8,14,20,0.65)' };
  return onChange ? <Pressable key={grade} testID={`gallery-grade-${grade}`} accessibilityRole="button" accessibilityLabel={`Grade ${grade}`} accessibilityState={{ selected: active }} aria-pressed={active} onPress={() => onChange(grade)} style={style}>{badge}</Pressable> : <View key={grade} style={style}>{badge}</View>;
 })}</View>;
}

export function GallerySetBackdrop({ name }: { name: string }) {
 const rare = /hero|icon|totw|season|potm|rarit/i.test(name);
 return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
  <Image source={name === 'Como' ? require('@/assets/images/gallery-como.webp') : name === 'Arsenal' ? require('@/assets/images/gallery-arsenal.webp') : name === 'FC Barcelona' ? require('@/assets/images/gallery-barcelona.webp') : rare ? require('@/assets/images/gallery-hall.webp') : /madrid|liga/i.test(name) ? require('@/assets/images/stadium-night-bright.png') : require('@/assets/images/market-stadium-bg-wide.png')} resizeMode="cover" style={StyleSheet.absoluteFill}/>
  <LinearGradient colors={['rgba(5,12,19,0.08)', 'rgba(7,15,23,0.32)', '#0C141B']} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill}/>
 </View>;
}
export function GalleryItemArt({ item, width = 110 }: { item: GalleryItem; width?: number }) {
 const [failed, setFailed] = useState(false);
 return failed ? <View style={{ width, height: width * 1.45, justifyContent: 'center', alignItems: 'center', padding: 8, borderWidth: 1, borderColor: '#766C55', borderRadius: 8 }}><GalleryText size={19}>{item.overall}</GalleryText><GalleryText size={12} style={{ textAlign: 'center' }}>{item.cardName}</GalleryText><GalleryButton label="↻" onPress={() => setFailed(false)} /></View> : <Image accessibilityLabel={`${item.cardName} ${item.overall} ${item.rarityName}`} source={{ uri: item.cardImageUrl }} onError={() => setFailed(true)} resizeMode="contain" style={{ width, height: width * 1.45 }} />;
}
export function GalleryPlayerTile({ item, selected, collected, firstOwner, onAdd, onRemove, onCollected, onFirstOwner, width = 170 }: { item: GalleryItem; selected?: boolean; collected?: boolean; firstOwner?: boolean; onAdd?: () => void; onRemove?: () => void; onCollected?: () => void; onFirstOwner?: () => void; width?: number }) {
 const { t, language } = useLanguage();
 return <LinearGradient colors={collected ? ['#273229', '#111B21'] : ['#1B2832', '#0D171E']} testID={selected ? 'gallery-selected-card' : 'gallery-search-card'} style={[styles.panel, { width, padding: 10, gap: 9, alignItems: 'center', borderColor: collected ? '#9A8B5E' : selected ? '#64727C' : galleryColors.line }]}>
  <View style={{flexDirection:'row',direction:'ltr',alignItems:'center',justifyContent:'space-between',width:'100%'}}><GalleryPoints value={item.score} size={14} />{selected?<Pressable accessibilityRole="button" accessibilityLabel={t('הסרה','Remove')} onPress={onRemove} style={{minWidth:36,minHeight:36,alignItems:'center',justifyContent:'center'}}><Ionicons name="close-outline" size={20} color="#BAC5CF"/></Pressable>:null}</View><GalleryItemArt item={item} width={Math.min(115, width - 24)} />
  <GalleryText size={14} style={{ fontWeight: '700', textAlign: 'center' }}>{language === 'he' ? item.he || item.cardName : item.cardName}</GalleryText>
  <GalleryText size={12} quiet style={{ textAlign: 'center' }}>{item.overall} OVR · {item.rarityName}</GalleryText>
  <GalleryText size={13} style={{ color: '#E7CE99', textAlign: 'center' }}>{item.price !== null ? `◉ ${item.price.toLocaleString('en-US')}` : t('מחיר לא זמין', 'Price unavailable')}</GalleryText>
  {!selected && onAdd ? <GalleryButton label={t('הוספה לתכנון', 'Add to plan')} onPress={onAdd} primary /> : null}
  {selected ? <View style={{ alignSelf: 'stretch', gap: 7 }}>
   <GalleryButton label={collected ? t('✓ נאסף', '✓ Collected') : t('סימון כנאסף', 'Mark collected')} active={collected} onPress={() => onCollected?.()} />
   <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: !!firstOwner }} aria-checked={!!firstOwner} accessibilityLabel={t('בעלים ראשון', 'First owner')} onPress={onFirstOwner} style={{ minHeight: 44, justifyContent: 'center' }}><GalleryText size={12} style={{ textAlign: 'center' }}>{firstOwner ? '☑' : '☐'} {t('בעלים ראשון', 'First owner')}</GalleryText></Pressable>
  </View> : null}
 </LinearGradient>;
}
export function GalleryRewards({ set, target }: { set: GallerySet; target?: GalleryGrade }) {
 const { t, language } = useLanguage(), { width } = useWindowDimensions();
 return <GalleryPanel><GalleryText size={23} style={{ fontWeight: '800' }}>{t('דרגות ופרסים', 'Grades & rewards')}</GalleryText><GalleryText quiet>{t('D היא הדרגה הראשונה, אחריה C, B, A ו־S הגבוהה ביותר. יש למלא את כל המקומות באוסף. הספים שונים בכל אוסף, והפרסים מצטברים.', 'D is the first grade, followed by C, B, A and S, the highest. Every slot must be filled. Thresholds vary by set and rewards are cumulative.')}</GalleryText>
  <View style={{flexDirection:width>=1100?(language==='he'?'row-reverse':'row'):'column',gap:12}}>{set.grades.map(g => <LinearGradient key={g.name} testID={`gallery-reward-${g.name}`} colors={[gradeMetals[g.name].dark, '#111B23']} start={{x:0,y:0}} end={{x:1,y:1}} style={{ flex:width>=1100?1:undefined,minWidth:0,borderWidth: 1, borderColor: target === g.name ? gradeMetals[g.name].light : '#45505A', borderRadius:12, padding:16, gap:10 }}><View style={{ flexDirection:width>=1100?'column':'row', direction: 'ltr', justifyContent: 'space-between', alignItems: 'center',gap:12 }}><GalleryGradeBadge grade={g.name} size={76}/><GalleryPoints value={g.threshold} size={22}/></View>
   {!g.rewards.length ? <GalleryText quiet size={13}>{t('ללא פרס בדרגה זו', 'No reward at this grade')}</GalleryText> : g.rewards.map((r,index) => r.type === 'event_token_1' ? <GalleryToken key={index} value={r.value * r.count} /> : <GalleryText key={index} size={14}>{r.imagePath?.includes('kit') ? t('ערכת מדים למועדון', 'Club kit') : r.imagePath?.includes('badge') ? t('סמל המועדון', 'Club badge') : r.label}</GalleryText>)}
  </LinearGradient>)}</View>
 </GalleryPanel>;
}
export function GalleryHero({ title, subtitle, children, art, scenery, compact = false }: { title: string; subtitle: string; children?: ReactNode; art?: ReactNode; scenery?: string; compact?: boolean }) {
 const { width } = useWindowDimensions(), { language } = useLanguage();
 return <View style={{ borderRadius: 12, overflow: 'hidden', minHeight:width<700?145:compact?130:190, padding:width<700||compact?18:28, flexDirection:language==='he'?'row-reverse':'row', alignItems:'center', gap:18 }}>
  {scenery?<GallerySetBackdrop name={scenery}/>:null}
  <LinearGradient colors={['rgba(6,13,19,0.76)', 'rgba(6,13,19,0.10)', 'rgba(6,13,19,0.65)']} start={{x:0,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill}/>
  <View style={{ flex:1, minWidth:0, gap:7 }}><GalleryText size={11} style={{ letterSpacing: 2, color: '#D3BB8C' }}>ULTIMATE TEAM / FC 27</GalleryText><GalleryText size={width<700?36:48} style={{ fontWeight: '900', lineHeight:width<700?43:58 }}>{title}</GalleryText><GalleryText quiet>{subtitle}</GalleryText>{children}</View>
  {art ? <View style={{ flexShrink:0 }}>{art}</View> : null}
 </View>;
}
const styles = StyleSheet.create({ panel: { borderRadius: 12, borderWidth: 1, borderColor: galleryColors.line, padding: 18, gap: 14, minWidth: 0 } });
