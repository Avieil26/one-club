import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { countryName, countryOptions } from '@/lib/countries';
import { useLanguage } from '@/lib/language';

export function CountryPicker({ value, onChange, allowAll = false }: { value: string; onChange: (value: string) => void; allowAll?: boolean }) {
 const { t, language } = useLanguage(); const rtl = language === 'he';
 const [open, setOpen] = useState(false); const [search, setSearch] = useState('');
 const options = useMemo(() => countryOptions(search, language), [search, language]);
 const close = () => { setOpen(false); setSearch(''); };
 const choose = (code: string) => { onChange(code); close(); };
 return <View style={{ gap: 8, minWidth: 0 }}>
  <Text style={[s.label, { textAlign: rtl ? 'right' : 'left' }]}>{t('מדינה', 'Country')}</Text>
  <Pressable accessibilityRole="button" accessibilityLabel={t('בחירת מדינה', 'Choose country')} onPress={() => setOpen(true)} style={[s.trigger, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
   <Ionicons name="globe-outline" size={19} color="#44D8E5" />
   <Text style={[s.value, { textAlign: rtl ? 'right' : 'left' }]}>{!value ? allowAll ? t('כל המדינות', 'All countries') : t('בחירת מדינה', 'Choose country') : countryName(value, language)}</Text>
   <Ionicons name="chevron-down" size={16} color="#A9BBC6" />
  </Pressable>
  <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
   <View style={s.backdrop}><View accessibilityViewIsModal style={s.dialog}>
    <View style={[s.header, { flexDirection: rtl ? 'row-reverse' : 'row' }]}><Text style={s.title}>{t('בחירת מדינה', 'Choose country')}</Text><Pressable accessibilityRole="button" accessibilityLabel={t('סגירה', 'Close')} onPress={close} style={s.close}><Ionicons name="close" size={22} color="#F5F8FA" /></Pressable></View>
    <TextInput accessibilityLabel={t('חיפוש מדינה', 'Search countries')} value={search} onChangeText={setSearch} placeholder={t('שם מדינה או קוד…', 'Country name or code…')} placeholderTextColor="#8DA4B3" style={[s.search, { textAlign: rtl ? 'right' : 'left' }]} autoCorrect={false} />
    <ScrollView keyboardShouldPersistTaps="handled">
     {allowAll && !search ? <Pressable accessibilityRole="button" onPress={() => choose('')} style={s.option}><Text style={s.value}>{t('כל המדינות', 'All countries')}</Text></Pressable> : null}
     {options.map((c) => <Pressable key={c.code} accessibilityRole="button" accessibilityLabel={c[language]} accessibilityState={{ selected: value === c.code }} onPress={() => choose(c.code)} style={[s.option, { flexDirection: rtl ? 'row-reverse' : 'row' }, value === c.code && s.selected]}>
      <Text style={s.code}>{c.code}</Text><Text style={[s.value, { textAlign: rtl ? 'right' : 'left' }]}>{c[language]}</Text>{value === c.code ? <Ionicons name="checkmark" size={18} color="#44D8E5" /> : null}
     </Pressable>)}
     {!options.length ? <Text style={s.label}>{t('לא נמצאו מדינות', 'No countries found')}</Text> : null}
    </ScrollView>
   </View></View>
  </Modal>
 </View>;
}
const s = StyleSheet.create({
 label: { color: '#B4C5CF', fontSize: 12, fontWeight: '800' },
 trigger: { minHeight: 48, paddingHorizontal: 13, gap: 10, alignItems: 'center', backgroundColor: '#030D16', borderWidth: 1, borderColor: '#294652', borderRadius: 6 },
 value: { flex: 1, flexShrink: 1, color: '#F5F8FA', fontSize: 14, fontWeight: '700' },
 backdrop: { flex: 1, backgroundColor: 'rgba(0,5,10,0.86)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 50 },
 dialog: { width: '100%', maxWidth: 520, maxHeight: '100%', backgroundColor: '#06131F', borderColor: '#315866', borderWidth: 1, borderRadius: 10, padding: 16, gap: 14 },
 header: { alignItems: 'center', justifyContent: 'space-between', gap: 12 },
 title: { color: '#FFFFFF', fontWeight: '900', fontSize: 20, flexShrink: 1 },
 close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
 search: { minHeight: 48, backgroundColor: '#020B13', color: '#FFFFFF', borderWidth: 1, borderColor: '#31505F', borderRadius: 6, paddingHorizontal: 12, fontSize: 15 },
 option: { minHeight: 48, alignItems: 'center', gap: 12, paddingHorizontal: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#142C38' },
 selected: { backgroundColor: '#103541' },
 code: { color: '#68DFE7', fontSize: 11, width: 28, fontWeight: '900' },
});
