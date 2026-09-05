import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { likePost, reportPost } from '../lib/posts';
import { timeAgo } from '../lib/timeAgo';
import { RootStackParamList } from '../navigation/types';
import { Post } from '../types/models';
import { AudioPlayer } from './AudioPlayer';
import { Avatar, BodyText, MutedText, Pill, Surface } from './Themed';

export function getCount(value: { count: number }[] | undefined) {
  return value?.[0]?.count ?? 0;
}

export function PostCard({
  post,
  navigation,
  onChanged
}: {
  post: Post;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onChanged?: () => void;
}) {
  const { theme } = useTheme();
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);
  const [liked, setLiked] = useState(false);

  const like = async () => {
    if (!session?.user.id) return;
    setBusy(true);
    setLiked(!liked);
    try {
      await likePost(post.id, session.user.id);
      onChanged?.();
    } catch (error) {
      setLiked(liked);
      Alert.alert('Could not like reading', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const report = async () => {
    if (!session?.user.id) return;
    setBusy(true);
    try {
      await reportPost(post.id, session.user.id);
      Alert.alert('Report received', 'Thanks. This reading has been flagged for review.');
    } catch (error) {
      Alert.alert('Could not report reading', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleProfilePress = () => {
    const targetUserId = post.user_id || post.profiles?.id;
    if (targetUserId) {
      navigation.navigate('UserProfile', { userId: targetUserId });
    }
  };

  const username = post.profiles?.username || 'A reader';
  const timeLabel = post.created_at ? timeAgo(post.created_at) : '';

  return (
    <Surface elevated style={styles.card}>
      {/* Instagram-style user header */}
      <View style={styles.userHeader}>
        <Pressable style={styles.userInfo} onPress={handleProfilePress}>
          <Avatar username={username} avatarUrl={post.profiles?.avatar_url} size="md" />
          <View style={styles.userTextContainer}>
            <Text style={[styles.usernameText, { color: theme.colors.text }]}>{username}</Text>
            {timeLabel ? <Text style={[styles.timestampText, { color: theme.colors.textMuted }]}>{timeLabel}</Text> : null}
          </View>
        </Pressable>
        <Pill label={post.genre} />
      </View>

      {/* Book details */}
      <Pressable onPress={() => navigation.navigate('PostDetail', { post })} style={styles.bookDetails}>
        <Text style={[styles.bookTitle, { color: theme.colors.text }]}>{post.book_title}</Text>
        {post.author_name ? <Text style={[styles.authorName, { color: theme.colors.textMuted }]}>by {post.author_name}</Text> : null}
      </Pressable>

      {/* Caption if present */}
      {post.caption ? (
        <View style={[styles.captionContainer, { backgroundColor: theme.colors.surfaceMuted, borderLeftColor: theme.colors.accent }]}>
          <BodyText style={styles.captionText}>"{post.caption}"</BodyText>
        </View>
      ) : null}

      {/* Audio Player */}
      <AudioPlayer uri={post.audio_url} durationSeconds={post.duration_seconds} />

      {/* Action Bar */}
      <View style={[styles.actionBar, { borderTopColor: theme.colors.borderLight }]}>
        <Pressable
          onPress={like}
          disabled={busy}
          style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[styles.actionIcon, { color: liked ? theme.colors.heart : theme.colors.textMuted }]}>
            {liked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
            {getCount(post.likes)}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('PostDetail', { post })}
          style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
            {getCount(post.comments)}
          </Text>
        </Pressable>

        <View style={styles.spacer} />

        <Pressable
          onPress={report}
          disabled={busy}
          style={({ pressed }) => [styles.reportButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <MutedText style={styles.reportText}>Report</MutedText>
        </Pressable>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md
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
  bookDetails: {
    gap: 2
  },
  bookTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500'
  },
  captionContainer: {
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
  actionBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  actionIcon: {
    fontSize: 16
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600'
  },
  spacer: {
    flex: 1
  },
  reportButton: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  reportText: {
    fontSize: 12
  }
});
