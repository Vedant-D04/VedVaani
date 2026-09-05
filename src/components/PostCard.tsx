import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { likePost, reportPost } from '../lib/posts';
import { RootStackParamList } from '../navigation/types';
import { Post } from '../types/models';
import { AudioPlayer } from './AudioPlayer';
import { BodyText, Button, MutedText, Pill, Surface } from './Themed';

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

  const like = async () => {
    if (!session?.user.id) return;
    setBusy(true);
    try {
      await likePost(post.id, session.user.id);
      onChanged?.();
    } catch (error) {
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

  return (
    <Surface style={styles.card}>
      <Pressable onPress={() => navigation.navigate('PostDetail', { post })} style={styles.header}>
        <View style={styles.titleBlock}>
          <BodyText style={styles.book}>{post.book_title}</BodyText>
          <MutedText>{post.author_name}</MutedText>
        </View>
        <Pill label={post.genre} />
      </Pressable>
      <MutedText>Read by {post.profiles?.username ?? 'A reader'}</MutedText>
      {post.caption ? <BodyText style={styles.caption}>{post.caption}</BodyText> : null}
      <AudioPlayer uri={post.audio_url} durationSeconds={post.duration_seconds} />
      <View style={[styles.meta, { borderTopColor: theme.colors.border }]}>
        <Button label={`${getCount(post.likes)} likes`} variant="ghost" onPress={like} disabled={busy} style={styles.smallButton} />
        <Button
          label={`${getCount(post.comments)} comments`}
          variant="ghost"
          onPress={() => navigation.navigate('PostDetail', { post })}
          style={styles.smallButton}
        />
        <Button label="Report" variant="danger" onPress={report} disabled={busy} style={styles.smallButton} />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    borderRadius: radius.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  titleBlock: {
    flex: 1
  },
  book: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800'
  },
  caption: {
    fontStyle: 'italic'
  },
  meta: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm
  },
  smallButton: {
    minHeight: 40,
    flex: 1,
    paddingHorizontal: spacing.sm
  }
});
