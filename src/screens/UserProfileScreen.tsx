import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { PostCard } from '../components/PostCard';
import { Avatar, BodyText, MutedText, Screen, SectionHeader, Surface } from '../components/Themed';
import { radius, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { getUserProfile, listUserPosts } from '../lib/posts';
import { RootStackParamList } from '../navigation/types';
import { Post, Profile } from '../types/models';

export function UserProfileScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'UserProfile'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { userId } = route.params;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [fetchedProfile, userPosts] = await Promise.all([
        getUserProfile(userId),
        listUserPosts(userId)
      ]);
      setProfile(fetchedProfile);
      setPosts(userPosts);
    } catch (e) {
      console.error('Error fetching user profile:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </Screen>
    );
  }

  const username = profile?.username || 'Reader';
  const bio = profile?.bio;
  const totalLikes = posts.reduce((acc, p) => acc + (p.likes?.[0]?.count ?? 0), 0);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Profile Header Card */}
      <Surface elevated style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <Avatar username={username} avatarUrl={profile?.avatar_url} size="lg" />
          <View style={styles.profileInfo}>
            <Text style={[styles.usernameText, { color: theme.colors.text }]}>{username}</Text>
            {bio ? <BodyText style={styles.bioText}>{bio}</BodyText> : <MutedText style={styles.bioText}>VedVaani Reader</MutedText>}
          </View>
        </View>

        {/* Stats bar */}
        <View style={[styles.statsBar, { borderTopColor: theme.colors.borderLight }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{posts.length}</Text>
            <MutedText style={styles.statLabel}>Readings</MutedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.borderLight }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{totalLikes}</Text>
            <MutedText style={styles.statLabel}>Likes</MutedText>
          </View>
        </View>
      </Surface>

      <SectionHeader title={`${username}'s Readings`} subtitle={`${posts.length} shared voice recordings`} style={{ marginTop: spacing.md }} />
    </View>
  );

  const renderEmpty = () => (
    <View style={[styles.emptyBox, { backgroundColor: theme.colors.surfaceMuted }]}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No readings yet</Text>
      <MutedText style={styles.emptySubtitle}>{username} hasn't posted any readings yet.</MutedText>
    </View>
  );

  return (
    <Screen>
      <FlatList
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} navigation={navigation} onChanged={loadData} />}
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
    paddingBottom: spacing.xxl + 40
  },
  header: {
    gap: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.md
  },
  profileCard: {
    padding: spacing.md,
    borderRadius: radius.xl,
    gap: spacing.md
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  profileInfo: {
    flex: 1
  },
  usernameText: {
    fontSize: 22,
    fontWeight: '800'
  },
  bioText: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic'
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900'
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 24
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: radius.lg,
    marginTop: spacing.sm
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: spacing.sm
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center'
  }
});
