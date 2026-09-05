import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AudioPlayer } from '../components/AudioPlayer';
import { Avatar, BodyText, Button, Field, MutedText, Pill, Screen, SectionHeader, Surface } from '../components/Themed';
import { radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { addComment, listPostComments } from '../lib/posts';
import { timeAgo } from '../lib/timeAgo';
import { RootStackParamList } from '../navigation/types';
import { Comment } from '../types/models';

export function PostDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PostDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session } = useAuth();
  const { theme } = useTheme();
  const { post } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      setComments(await listPostComments(post.id));
    } catch (e) {
      console.error(e);
    }
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

  const handleProfilePress = (userId?: string) => {
    if (userId) {
      navigation.navigate('UserProfile', { userId });
    }
  };

  const authorUsername = post.profiles?.username || 'A reader';
  const postUserId = post.user_id || post.profiles?.id;
  const postTime = post.created_at ? timeAgo(post.created_at) : '';

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Top Post Card */}
      <Surface elevated style={styles.postCard}>
        {/* User Info Header */}
        <View style={styles.userHeader}>
          <Pressable style={styles.userInfo} onPress={() => handleProfilePress(postUserId)}>
            <Avatar username={authorUsername} avatarUrl={post.profiles?.avatar_url} size="md" />
            <View style={styles.userTextContainer}>
              <Text style={[styles.usernameText, { color: theme.colors.text }]}>{authorUsername}</Text>
              {postTime ? <Text style={[styles.timestampText, { color: theme.colors.textMuted }]}>{postTime}</Text> : null}
            </View>
          </Pressable>
          <Pill label={post.genre} />
        </View>

        {/* Book Title & Author */}
        <View style={styles.bookBlock}>
          <Text style={[styles.bookTitle, { color: theme.colors.text }]}>{post.book_title}</Text>
          <Text style={[styles.authorName, { color: theme.colors.textMuted }]}>by {post.author_name}</Text>
        </View>

        {/* Caption */}
        {post.caption ? (
          <View style={[styles.captionBox, { backgroundColor: theme.colors.surfaceMuted, borderLeftColor: theme.colors.accent }]}>
            <BodyText style={styles.captionText}>"{post.caption}"</BodyText>
          </View>
        ) : null}

        {/* Audio Player */}
        <AudioPlayer uri={post.audio_url} durationSeconds={post.duration_seconds} />
      </Surface>

      <SectionHeader title="Discussion" subtitle={`${comments.length} comments`} style={{ marginTop: spacing.md }} />
    </View>
  );

  const renderComment = ({ item }: { item: Comment }) => {
    const commentUsername = item.profiles?.username || 'Reader';
    const commentUserId = item.user_id || item.profiles?.id;
    const commentTime = item.created_at ? timeAgo(item.created_at) : '';

    return (
      <View style={[styles.commentRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}>
        <Pressable onPress={() => handleProfilePress(commentUserId)}>
          <Avatar username={commentUsername} avatarUrl={item.profiles?.avatar_url} size="sm" />
        </Pressable>
        <View style={styles.commentContent}>
          <View style={styles.commentMeta}>
            <Pressable onPress={() => handleProfilePress(commentUserId)}>
              <Text style={[styles.commentUsername, { color: theme.colors.text }]}>{commentUsername}</Text>
            </Pressable>
            {commentTime ? <Text style={[styles.commentTime, { color: theme.colors.textMuted }]}>{commentTime}</Text> : null}
          </View>
          <BodyText style={styles.commentText}>{item.text}</BodyText>
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <FlatList
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.list}
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          ListEmptyComponent={<MutedText style={styles.emptyText}>No comments yet. Start the conversation!</MutedText>}
          showsVerticalScrollIndicator={false}
        />

        {/* Bottom Comment Composer */}
        <View style={[styles.composer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.borderLight }]}>
          <Field
            placeholder="Write a comment..."
            value={text}
            onChangeText={setText}
            style={styles.input}
            rightElement={
              <Button
                label="Post"
                variant="primary"
                size="sm"
                onPress={send}
                loading={sending}
                disabled={!text.trim() || sending}
              />
            }
          />
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
    gap: spacing.sm,
    paddingTop: spacing.md,
    marginBottom: spacing.sm
  },
  postCard: {
    padding: spacing.md,
    borderRadius: radius.xl,
    gap: spacing.md
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  userTextContainer: {
    justifyContent: 'center'
  },
  usernameText: {
    fontSize: 15,
    fontWeight: '700'
  },
  timestampText: {
    fontSize: 12,
    marginTop: 1
  },
  bookBlock: {
    gap: 2
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  authorName: {
    fontSize: 15,
    fontWeight: '500'
  },
  captionBox: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderLeftWidth: 3
  },
  captionText: {
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 20
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.lg
  },
  commentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth
  },
  commentContent: {
    flex: 1,
    gap: 2
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '700'
  },
  commentTime: {
    fontSize: 11
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: spacing.md
  },
  composer: {
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  input: {
    flex: 1
  }
});
