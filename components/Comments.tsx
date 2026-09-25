import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Badge, Button, ChoiceGroup, colors, Field, Muted } from '@/components/ui';
import { errorMessage } from '@/lib/format';
import { displayName, PRESETS, presetLabel } from '@/lib/labels';
import { useApp } from '@/lib/store';
import type { CommentTarget, CommentPreset } from '@/lib/types';

export function Comments({ targetType, targetId }: { targetType: CommentTarget; targetId: string }) {
  const app = useApp();
  const [preset, setPreset] = useState<CommentPreset | null>(null);
  const [body, setBody] = useState('');
  const items = app.comments.filter((comment) => comment.targetType === targetType && comment.targetId === targetId);

  async function send() {
    try {
      const held = await app.addComment({ targetType, targetId, preset, body });
      setBody('');
      setPreset(null);
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
    <View style={{ gap: 10 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'right' }}>תגובות</Text>
      {items.length === 0 ? <Muted>עדיין אין תגובות. אפשר לפתוח בכבוד, יפה, חכם או מצחיק.</Muted> : null}
      {items.map((comment) => (
        <View key={comment.id} style={{ gap: 6 }}>
          <Muted>
            {displayName(app.profiles, comment.userId)}
            {comment.preset ? ` · ${presetLabel(comment.preset)}` : ''}
          </Muted>
          {comment.body ? <Text style={{ color: colors.text, textAlign: 'right', writingDirection: 'rtl' }}>{comment.body}</Text> : null}
          {comment.status === 'hidden_pending' ? <Badge text="ממתין לבדיקה" tone="amber" /> : null}
          {comment.status === 'visible' && comment.userId !== app.user?.id ? (
            <Button label="דיווח" variant="ghost" onPress={() => report(comment.id)} />
          ) : null}
        </View>
      ))}
      <ChoiceGroup
        label="תגובה מוכנה"
        options={[{ id: 'none' as const, label: 'בלי' }, ...PRESETS]}
        value={preset ?? 'none'}
        onChange={(value) => setPreset(value === 'none' ? null : value)}
      />
      <Field label="משפט קצר, עד 120 תווים" value={body} onChangeText={setBody} placeholder="אפשר גם בלי טקסט חופשי" />
      <Button label="פרסום תגובה" onPress={send} disabled={app.busy} />
    </View>
  );
}
