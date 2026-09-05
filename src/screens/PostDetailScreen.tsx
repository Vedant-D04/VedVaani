import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { AudioPlayer } from '../components/AudioPlayer';
import { BodyText, Button, Field, MutedText, Pill, Screen, Surface, Title } from '../components/Themed';
import { spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { addComment, listPostComments } from '../lib/posts';
import { RootStackParamList } from '../navigation/types';
import { Comment } from '../types/models';

export function PostDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PostDetail'>>();
  const { session } = useAuth();
  const { post } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    setComments(await listPostComments(post.id));
  };

  useEffect(() => {
    load();
  }, [post.id]);

  const send = async () => {
    if (!session?.user.id || !text.trim()) return;
    setSending(true);
    try {
      await addComment(post.id, session.user.id, text.trim());
      setText('');
      await load();
    } catch (error) {
      Alert.alert('Could not comment', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <FlatList
          ListHeaderComponent={
            <View style={styles.header}>
              <Title>{post.book_title}</Title>
              <MutedText>{post.author_name}</MutedText>
              <Pill label={post.genre} />
              <MutedText>Read by {post.profiles?.username ?? 'A reader'}</MutedText>
              {post.caption ? <BodyText>{post.caption}</BodyText> : null}
              <AudioPlayer uri={post.audio_url} durationSeconds={post.duration_seconds} />
              <BodyText style={styles.section}>Comments</BodyText>
            </View>
          }
          contentContainerStyle={styles.list}
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Surface style={styles.comment}>
              <BodyText style={styles.username}>{item.profiles?.username ?? 'Reader'}</BodyText>
              <BodyText>{item.text}</BodyText>
            </Surface>
          )}
          ListEmptyComponent={<MutedText>No comments yet.</MutedText>}
        />
        <View style={styles.composer}>
          <Field placeholder="Add a comment" value={text} onChangeText={setText} style={styles.input} />
          <Button label="Send" onPress={send} loading={sending} disabled={!text.trim()} style={styles.send} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  header: {
    gap: spacing.md,
    paddingTop: spacing.lg
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.md
  },
  section: {
    fontWeight: '800',
    marginTop: spacing.sm
  },
  comment: {
    gap: spacing.xs
  },
  username: {
    fontWeight: '800'
  },
  composer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md
  },
  input: {
    flex: 1
  },
  send: {
    width: 84
  }
});
