import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/components/ui';
import { dismissNotice, subscribeNotice, type Notice } from '@/lib/notice';

export function NoticeHost() {
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => subscribeNotice(setNotice), []);

  if (!notice) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
      <View style={styles.card}>
        <View style={styles.edge} />
        <Text style={styles.title}>{notice.title}</Text>
        {notice.message ? <Text style={styles.message}>{notice.message}</Text> : null}
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
                  {button.text || 'הבנתי'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    zIndex: 80,
    backgroundColor: 'rgba(0,0,0,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    width: '100%',
    maxWidth: 440,
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
