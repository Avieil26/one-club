import { useMemo, useState } from 'react';
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
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const items = app.comments.filter((comment) => comment.targetType === targetType && comment.targetId === targetId);
  const roots = useMemo(() => items.filter((item) => !item.parentId), [items]);

  async function send() {
    try {
      const held = await app.addComment({ targetType, targetId, preset: null, body, parentId: replyTo });
      setBody('');
      setReplyTo(null);
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

  async function like(commentId: string) {
    try {
      await app.toggleCommentLike(commentId);
    } catch (error) {
      Alert.alert('רגע', errorMessage(error));
    }
  }

  function CommentCard({ comment, depth = 0 }: { comment: (typeof items)[number]; depth?: number }) {
    const name = displayName(app.profiles, comment.userId);
    const avatarUrl = app.profiles.find((profile) => profile.id === comment.userId)?.avatarUrl;
    const likes = app.commentLikes.filter((like) => like.commentId === comment.id);
    const liked = likes.some((like) => like.userId === app.user?.id);
    const replies = items.filter((item) => item.parentId === comment.id);

    return (
      <View style={{ gap: 8, marginRight: depth ? 22 : 0 }}>
        <View style={{
          backgroundColor: depth ? '#111A27' : '#172033',
          borderRadius: 16,
          paddingVertical: 12,
          paddingHorizontal: 14,
          gap: 9,
          borderWidth: 1,
          borderColor: depth ? 'rgba(186,206,230,.16)' : 'rgba(186,206,230,.28)',
        }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 9 }}>
            <ProfileFace name={name} uri={avatarUrl} />
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={{ color: '#F4F7F2', fontSize: 14, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl' }}>{name}</Text>
              {comment.preset ? <Text style={{ color: '#D5E2F2', fontSize: 11, textAlign: 'right' }}>{presetLabel(comment.preset)}</Text> : null}
            </View>
          </View>
          {comment.body ? <Text style={{ color: colors.text, fontSize: 16, lineHeight: 24, fontWeight: '500', textAlign: 'right', writingDirection: 'rtl' }}>{comment.body}</Text> : null}
          {comment.status === 'hidden_pending' ? <Badge text="ממתין לבדיקה" tone="amber" /> : null}
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 14 }}>
            <Pressable onPress={() => like(comment.id)} disabled={app.busy} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 5 }}>
              <Text style={{ color: liked ? '#FF5D73' : '#AEB7C2', fontSize: 17 }}>{liked ? '♥' : '♡'}</Text>
              <Text style={{ color: '#AEB7C2', fontSize: 12, fontWeight: '700' }}>{likes.length || 'לייק'}</Text>
            </Pressable>
            <Pressable onPress={() => { setReplyTo(comment.id); setBody(''); }} disabled={app.busy}>
              <Text style={{ color: '#D5E2F2', fontSize: 12, fontWeight: '800' }}>השב</Text>
            </Pressable>
            {comment.status === 'visible' && comment.userId !== app.user?.id ? (
              <Pressable onPress={() => report(comment.id)}><Text style={{ color: '#7F8995', fontSize: 12 }}>דיווח</Text></Pressable>
            ) : null}
          </View>
        </View>
        {replies.map((reply) => <CommentCard key={reply.id} comment={reply} depth={depth + 1} />)}
      </View>
    );
  }

  const replyName = replyTo ? displayName(app.profiles, items.find((item) => item.id === replyTo)?.userId ?? '') : null;

  return (
    <View style={{ gap: 12, paddingTop: 8 }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'right' }}>
        תגובות{items.length ? ' (' + items.length + ')' : ''}
      </Text>
      {roots.length === 0 ? <Muted>עדיין אין תגובות.</Muted> : null}
      {roots.map((comment) => <CommentCard key={comment.id} comment={comment} />)}
      {replyTo ? (
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(227,179,65,.08)', borderRadius: 10, padding: 9 }}>
          <Text style={{ color: '#E3B341', fontSize: 12, fontWeight: '800' }}>משיב ל־{replyName}</Text>
          <Pressable onPress={() => setReplyTo(null)}><Text style={{ color: '#D5E2F2', fontSize: 12 }}>ביטול</Text></Pressable>
        </View>
      ) : null}
      <Field label={replyTo ? 'תגובה לתגובה' : 'תגובה'} value={body} onChangeText={setBody} maxLength={LIMIT} multiline placeholder={replyTo ? 'כתוב תשובה...' : 'כתוב תגובה...'} />
      <Button label={replyTo ? 'שליחת תשובה' : 'פרסום תגובה'} onPress={send} disabled={app.busy || !body.trim()} />
    </View>
  );
}
