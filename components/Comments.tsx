import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Badge, Button, colors, Field, Muted } from '@/components/ui';
import { ProfileFace } from '@/components/ProfileFace';
import { errorMessage } from '@/lib/format';
import { displayName, presetLabel } from '@/lib/labels';
import { useApp } from '@/lib/store';
import type { CommentTarget } from '@/lib/types';

const LIMIT = 120;

export function Comments({ targetType, targetId }: { targetType: CommentTarget; targetId: string }) {
  const app = useApp();
  const [body, setBody] = useState('');
  const items = app.comments.filter((comment) => comment.targetType === targetType && comment.targetId === targetId);

  async function send() {
    try {
      const held = await app.addComment({ targetType, targetId, preset: null, body });
      setBody('');
      if (held) Alert.alert('נשמר לבדיקה', 'התגובה לא פורסמה כי היא לא עומדת בכללי הכבוד.');
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  async function report(commentId: string) {
    try {
      await app.reportComment(commentId);
      Alert.alert('תודה', 'התגובה ירדה מהפיד ומחכה לבדיקה.');
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  return (
    <View style={{ gap: 14, paddingTop: 8 }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'right' }}>תגובות</Text>
      {items.length === 0 ? <Muted>עדיין אין תגובות.</Muted> : null}
      {items.map((comment) => {
        const name = displayName(app.profiles, comment.userId);
        const avatarUrl = app.profiles.find((profile) => profile.id === comment.userId)?.avatarUrl;
        return (
          <View
            key={comment.id}
            style={{
              backgroundColor: '#172033',
              borderRadius: 18,
              paddingVertical: 14,
              paddingHorizontal: 16,
              gap: 10,
              borderWidth: 1,
              borderColor: 'rgba(186, 206, 230, 0.28)',
            }}
          >
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
              <ProfileFace name={name} uri={avatarUrl} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: '#F4F7F2', fontSize: 15, fontWeight: '600', textAlign: 'right', writingDirection: 'rtl' }}>
                  {name}
                </Text>
                {comment.preset ? (
                  <Text style={{ color: '#D5E2F2', fontSize: 12, textAlign: 'right' }}>{presetLabel(comment.preset)}</Text>
                ) : null}
              </View>
            </View>
            {comment.body ? (
              <Text style={{ color: colors.text, fontSize: 17, lineHeight: 26, fontWeight: '500', textAlign: 'right', writingDirection: 'rtl' }}>
                {comment.body}
              </Text>
            ) : null}
            {comment.status === 'hidden_pending' ? <Badge text="ממתין לבדיקה" tone="amber" /> : null}
            {comment.status === 'visible' && comment.userId !== app.user?.id ? (
              <Pressable accessibilityRole="button" onPress={() => report(comment.id)} style={{ alignSelf: 'flex-end' }}>
                <Text style={{ color: '#D5E2F2', fontSize: 13 }}>דיווח</Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
      <Field
        label="תגובה"
        value={body}
        onChangeText={setBody}
        maxLength={LIMIT}
        multiline
        placeholder="משפט קצר"
      />
      <Button label="פרסום תגובה" onPress={send} disabled={app.busy || !body.trim()} />
    </View>
  );
}
