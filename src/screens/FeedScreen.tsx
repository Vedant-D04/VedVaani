import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { PostCard } from '../components/PostCard';
import { Button, MutedText, Screen } from '../components/Themed';
import { radius, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { listPosts } from '../lib/posts';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { Post } from '../types/models';

export function FeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList & MainTabParamList>>();
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await listPosts();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.brandingRow}>
        <View style={[styles.logoIcon, { backgroundColor: theme.colors.accentSoft }]}>
          <Text style={[styles.logoText, { color: theme.colors.accent }]}>📖</Text>
        </View>
        <Text style={[styles.appName, { color: theme.colors.text }]}>VedVaani</Text>
      </View>
      <MutedText style={styles.tagline}>Discover voice recordings of great literature</MutedText>
    </View>
  );

  const renderEmpty = () => (
    <View style={[styles.emptyContainer, { backgroundColor: theme.colors.surfaceMuted }]}>
      <Text style={styles.emptyIcon}>🎙️</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No readings yet</Text>
      <MutedText style={styles.emptySubtitle}>Be the first to record a passage from your favorite book!</MutedText>
      <Button
        label="Record a Reading"
        variant="primary"
        size="md"
        style={{ marginTop: spacing.md }}
        onPress={() => (navigation as any).navigate('Record')}
      />
    </View>
  );

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} navigation={navigation as any} onChanged={load} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={theme.colors.accent}
          />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 40
  },
  header: {
    marginBottom: spacing.lg,
    paddingHorizontal: 4
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    fontSize: 20
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  tagline: {
    fontSize: 13,
    marginTop: 4
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: radius.lg,
    marginTop: spacing.md,
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4
  }
});
