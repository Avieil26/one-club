import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { useLanguage } from '@/lib/language';
import type { GalleryGrade, GalleryItem, GallerySet } from '@/lib/galleryTypes';
import { GALLERY_GRADES } from '@/lib/galleryTypes';
export const galleryColors = { bg: '#0D1015', panel: '#171C24', line: '#424954', text: '#F4F1E9', muted: '#BDC2CB', orange: '#F29B51', gold: '#D6BD85' };
export function GalleryText({ children, size = 15, quiet = false, style, testID }: { children: ReactNode; size?: number; quiet?: boolean; style?: TextStyle; testID?: string }) {
 const { language } = useLanguage();
 return <Text testID={testID} style={{ color: quiet ? galleryColors.muted : galleryColors.text, fontSize: size, lineHeight: size * 1.45, textAlign: language === 'he' ? 'right' : 'left', writingDirection: language === 'he' ? 'rtl' : 'ltr', ...style }}>{children}</Text>;
}
export function GalleryPanel({ children, style }: { children: ReactNode; style?: ViewStyle }) {
 return <View style={[styles.panel, style]}>{children}</View>;
}
export function GalleryButton({ label, onPress, active = false, primary = false, disabled = false, testID }: { label: string; onPress: () => void; active?: boolean; primary?: boolean; disabled?: boolean; testID?: string }) {
 return <Pressable testID={testID} accessibilityRole="button" accessibilityState={{ disabled, selected: active }} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ minHeight: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: active || primary ? galleryColors.orange : galleryColors.line, backgroundColor: primary ? '#ED913F' : active ? '#38291D' : '#161C25', opacity: disabled ? 0.45 : pressed ? 0.75 : 1 })}><Text style={{ color: primary ? '#17110B' : active ? '#FFD6B1' : galleryColors.text, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>{label}</Text></Pressable>;
}
export function GallerySearch({ value, onChangeText, placeholder }: { value: string; onChangeText: (value: string) => void; placeholder: string }) {
 const { language } = useLanguage();
 return <View style={{ flexDirection: language === 'he' ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, backgroundColor: '#121820', borderWidth: 1, borderColor: galleryColors.line, borderRadius: 8, paddingHorizontal: 14 }}><Ionicons name="search-outline" size={20} color={galleryColors.muted} /><TextInput accessibilityLabel={placeholder} placeholder={placeholder} value={value} onChangeText={onChangeText} placeholderTextColor="#AAB2BF" style={{ flex: 1, minWidth: 0, minHeight: 50, color: galleryColors.text, fontSize: 15, textAlign: language === 'he' ? 'right' : 'left', paddingVertical: 12 }} /></View>;
}
export function GalleryToken({ value, size = 18 }: { value?: number | string; size?: number }) {
 return <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 6 }}><Image accessibilityLabel="Gallery Token" source={require('@/assets/images/gallery-token.png')} resizeMode="contain" style={{ width: size + 6, height: size + 6 }} />{value !== undefined ? <Text style={{ color: '#E5CD99', fontSize: size, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{value}</Text> : null}</View>;
}
export function GalleryPoints({ value, size = 16 }: { value: number; size?: number }) {
 return <View style={{ flexDirection: 'row', direction: 'ltr', alignItems: 'center', gap: 6 }}><Image source={require('@/assets/images/item-score.png')} accessibilityLabel="Item Score" style={{ width: size + 2, height: size + 2 }} resizeMode="contain" /><Text style={{ fontSize: size, color: '#CEF4D9', fontWeight: '700', fontVariant: ['tabular-nums'] }}>{value.toLocaleString('en-US')}</Text></View>;
}
export function GalleryGrades({ value, onChange, available }: { value: GalleryGrade | null; onChange?: (grade: GalleryGrade) => void; available?: GalleryGrade[] }) {
 return <View style={{ flexDirection: 'row', direction: 'ltr', gap: 6 }}>{GALLERY_GRADES.map(grade => <Pressable key={grade} accessibilityRole="button" accessibilityLabel={`Grade ${grade}`} accessibilityState={{ selected: value === grade }} onPress={() => onChange?.(grade)} style={{ flex: 1, minWidth: 28, minHeight: onChange ? 46 : 32, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 1, borderColor: value === grade ? '#E3C990' : '#525965', borderStyle: available && !available.includes(grade) ? 'dashed' : 'solid', backgroundColor: value === grade ? '#D6BD85' : '#151A21' }}><Text style={{ color: value === grade ? '#19150E' : '#C3C9D2', fontSize: onChange ? 17 : 13, fontWeight: '800' }}>{grade}</Text></Pressable>)}</View>;
}
export function GalleryItemArt({ item, width = 110 }: { item: GalleryItem; width?: number }) {
 const [failed, setFailed] = useState(false);
 return failed ? <View style={{ width, height: width * 1.45, justifyContent: 'center', alignItems: 'center', padding: 8, borderWidth: 1, borderColor: '#766C55', borderRadius: 8 }}><GalleryText size={19}>{item.overall}</GalleryText><GalleryText size={12} style={{ textAlign: 'center' }}>{item.cardName}</GalleryText><GalleryButton label="↻" onPress={() => setFailed(false)} /></View> : <Image accessibilityLabel={`${item.cardName} ${item.overall} ${item.rarityName}`} source={{ uri: item.cardImageUrl }} onError={() => setFailed(true)} resizeMode="contain" style={{ width, height: width * 1.45 }} />;
}
export function GalleryPlayerTile({ item, selected, collected, firstOwner, onAdd, onRemove, onCollected, onFirstOwner, width = 170 }: { item: GalleryItem; selected?: boolean; collected?: boolean; firstOwner?: boolean; onAdd?: () => void; onRemove?: () => void; onCollected?: () => void; onFirstOwner?: () => void; width?: number }) {
 const { t, language } = useLanguage();
 return <View testID={selected ? 'gallery-selected-card' : 'gallery-search-card'} style={[styles.panel, { width, padding: 10, gap: 9, alignItems: 'center', borderColor: selected ? '#8E7956' : galleryColors.line }]}>
  <GalleryPoints value={item.score} size={14} /><GalleryItemArt item={item} width={Math.min(132, width - 24)} />
  <GalleryText size={14} style={{ fontWeight: '700', textAlign: 'center' }}>{language === 'he' ? item.he || item.cardName : item.cardName}</GalleryText>
  <GalleryText size={12} quiet style={{ textAlign: 'center' }}>{item.overall} OVR · {item.rarityName}</GalleryText>
  <GalleryText size={13} style={{ color: '#E7CE99', textAlign: 'center' }}>{item.price !== null ? `◉ ${item.price.toLocaleString('en-US')}` : t('מחיר לא זמין', 'Price unavailable')}</GalleryText>
  {!selected && onAdd ? <GalleryButton label={t('הוספה לתכנון', 'Add to plan')} onPress={onAdd} primary /> : null}
  {selected ? <View style={{ alignSelf: 'stretch', gap: 7 }}>
   <GalleryButton label={collected ? t('✓ נאסף', '✓ Collected') : t('סימון כנאסף', 'Mark collected')} active={collected} onPress={() => onCollected?.()} />
   <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: !!firstOwner }} accessibilityLabel={t('בעלים ראשון', 'First owner')} onPress={onFirstOwner} style={{ minHeight: 44, justifyContent: 'center' }}><GalleryText size={12} style={{ textAlign: 'center' }}>{firstOwner ? '☑' : '☐'} {t('בעלים ראשון', 'First owner')}</GalleryText></Pressable>
   <GalleryButton label={t('הסרה', 'Remove')} onPress={() => onRemove?.()} />
  </View> : null}
 </View>;
}
export function GalleryRewards({ set, target }: { set: GallerySet; target?: GalleryGrade }) {
 const { t } = useLanguage();
 return <GalleryPanel><GalleryText size={23} style={{ fontWeight: '800' }}>{t('דרגות ופרסים', 'Grades & rewards')}</GalleryText><GalleryText quiet>{t('D היא הדרגה הראשונה, אחריה C, B, A ו־S הגבוהה ביותר. יש למלא את כל המקומות באוסף. הספים שונים בכל אוסף, והפרסים מצטברים.', 'D is the first grade, followed by C, B, A and S, the highest. Every slot must be filled. Thresholds vary by set and rewards are cumulative.')}</GalleryText>
  {set.grades.map(g => <View key={g.name} testID={`gallery-reward-${g.name}`} style={{ borderTopWidth: 1, borderColor: galleryColors.line, paddingTop: 13, paddingBottom: 5, gap: 8, backgroundColor: target === g.name ? '#282720' : 'transparent' }}><View style={{ flexDirection: 'row', direction: 'ltr', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontSize: 23, color: '#E9D2A2', fontWeight: '800' }}>{g.name}</Text><GalleryPoints value={g.threshold} /></View>
   {!g.rewards.length ? <GalleryText quiet size={13}>{t('ללא פרס בדרגה זו', 'No reward at this grade')}</GalleryText> : g.rewards.map((r,index) => r.type === 'event_token_1' ? <GalleryToken key={index} value={r.value * r.count} /> : <GalleryText key={index} size={14}>{r.imagePath?.includes('kit') ? t('ערכת מדים למועדון', 'Club kit') : r.imagePath?.includes('badge') ? t('סמל המועדון', 'Club badge') : r.label}</GalleryText>)}
  </View>)}
 </GalleryPanel>;
}
export function GalleryHero({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
 return <LinearGradient colors={['rgba(43,38,29,0.84)', 'rgba(15,20,28,0.94)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 12, borderWidth: 1, borderColor: '#665942', padding: 22, gap: 10 }}><GalleryText size={11} style={{ letterSpacing: 2, color: '#D3BB8C' }}>ULTIMATE TEAM / FC 27</GalleryText><GalleryText size={36} style={{ fontWeight: '900' }}>{title}</GalleryText><GalleryText quiet>{subtitle}</GalleryText>{children}</LinearGradient>;
}
const styles = StyleSheet.create({ panel: { borderRadius: 10, borderWidth: 1, borderColor: galleryColors.line, backgroundColor: 'rgba(20,26,35,0.96)', padding: 18, gap: 14, minWidth: 0 } });
