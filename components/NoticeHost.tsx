import { useLanguage } from '@/lib/language';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppModal } from '@/components/AppModal';

import { colors } from '@/components/ui';
import { dismissNotice, subscribeNotice, type Notice } from '@/lib/notice';

export function NoticeHost() {
  const { t, language, isRTL } = useLanguage();
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => subscribeNotice(setNotice), []);

  if (!notice) return null;

  return (
    <AppModal onClose={() => {
      const cancel = notice.buttons.find((button) => button.style === 'cancel');
      dismissNotice();
      cancel?.onPress?.();
    }}>
      <View style={[styles.card, { direction: isRTL ? 'rtl' : 'ltr' }]}>
        <View style={styles.edge} />
        <ScrollView contentContainerStyle={{ gap: 12 }}>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{notice.title}</Text>
        {notice.message ? <Text style={[styles.message, { textAlign: isRTL ? 'right' : 'left' }]}>{notice.message}</Text> : null}
        <View style={{ gap: 8 }}>
          {notice.buttons.map((button, index) => {
            const quiet = button.style === 'cancel' || index > 0;
            return (
              <Pressable
                key={`${notice.id}-${index}`}
                accessibilityRole="button"
                onPress={() => {
                  dismissNotice();
                  button.onPress?.();
                }}
                style={[styles.action, quiet ? styles.quiet : styles.primary]}
              >
                <Text style={[styles.actionText, quiet ? styles.quietText : styles.primaryText]}>
                  {(!button.text || button.text === 'הבנתי') ? t('הבנתי', 'Got it') : button.text}
                </Text>
              </Pressable>
            );
          })}
        </View>
        </ScrollView>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '100%',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(227,179,65,0.62)',
    backgroundColor: 'rgba(10,14,12,0.96)',
    padding: 20,
    gap: 12,
    overflow: 'hidden',
  },
  edge: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 2,
    backgroundColor: '#E3B341',
  },
  title: {
    color: '#F7F4EA',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'right',
  },
  message: {
    color: '#D5E0D6',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
  },
  action: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.gold,
  },
  quiet: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(227,179,65,0.35)',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '800',
  },
  primaryText: {
    color: colors.goldInk,
  },
  quietText: {
    color: '#F7F4EA',
  },
});
