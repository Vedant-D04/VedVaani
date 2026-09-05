import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { listPosts } from '../lib/posts';
import { RootStackParamList } from '../navigation/types';
import { Post } from '../types/models';
import { PostCard } from '../components/PostCard';
import { MutedText, Screen, Title } from '../components/Themed';

export function FeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await listPosts();
    setPosts(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
    }, [load])
  );

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        ListHeaderComponent={<Title style={styles.title}>Feed</Title>}
        contentContainerStyle={styles.list}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} navigation={navigation} onChanged={load} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.colors.accent} />}
        ListEmptyComponent={<MutedText>No readings yet. Record the first one.</MutedText>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  list: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl
  },
  title: {
    marginBottom: spacing.sm
  }
});
