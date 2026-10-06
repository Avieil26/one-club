import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/components/ui';

export default function ChampionsComingSoon() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🏆</Text>
        <Text style={styles.title}>FUT Champions</Text>
        <Text style={styles.status}>בקרוב</Text>
        <Text style={styles.message}>
          מרכז FUT Champions החדש נמצא בהכנה.
          {'\n'}
          הוא ייפתח באתר לאחר שהגרסה הסופית תהיה מוכנה.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(240, 74, 82, 0.35)',
    backgroundColor: '#15100F',
    paddingHorizontal: 28,
    paddingVertical: 34,
    alignItems: 'center',
  },
  icon: {
    fontSize: 42,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  status: {
    marginTop: 8,
    color: '#F04A52',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    marginTop: 16,
    color: '#B7C0BA',
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '600',
    textAlign: 'center',
  },
});
