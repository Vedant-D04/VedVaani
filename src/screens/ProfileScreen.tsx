import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { PostCard } from '../components/PostCard';
import { Avatar, BodyText, Button, Field, MutedText, Pill, Screen, SectionHeader, Surface, Title } from '../components/Themed';
import { radius, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCurrentProfile, listPosts, upsertProfile } from '../lib/posts';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../navigation/types';
import { Post, Profile } from '../types/models';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session } = useAuth();
  const { mode, setMode, theme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = async () => {
    if (!session?.user.id) return;
    try {
      const [nextProfile, allPosts] = await Promise.all([getCurrentProfile(session.user.id), listPosts()]);
      setProfile(nextProfile);
      setUsername(nextProfile?.username ?? session.user.email?.split('@')[0] ?? 'reader');
      setBio(nextProfile?.bio ?? '');
      setPosts(allPosts.filter((post) => post.user_id === session.user.id));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [session?.user.id]);

  const save = async () => {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      await upsertProfile({
        id: session.user.id,
        username: username.trim() || 'reader',
        bio: bio.trim() || null,
        avatar_url: profile?.avatar_url ?? null
      });
      await load();
      setEditing(false);
      Alert.alert('Profile saved', 'Your profile details have been updated.');
    } catch (error) {
      Alert.alert('Could not save profile', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const totalLikes = posts.reduce((acc, p) => acc + (p.likes?.[0]?.count ?? 0), 0);

  const renderHeader = () => (
    <View style={styles.header}>
      <Title style={styles.pageTitle}>Profile</Title>

      {/* User Info Header Card */}
      <Surface elevated style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <Avatar username={username} avatarUrl={profile?.avatar_url} size="lg" />
          <View style={styles.profileTextInfo}>
            <Text style={[styles.displayName, { color: theme.colors.text }]}>{username}</Text>
            <MutedText style={styles.emailText}>{session?.user.email}</MutedText>
            {bio ? <BodyText style={styles.bioText}>{bio}</BodyText> : null}
          </View>
        </View>

        {/* Stats Row */}
        <View style={[styles.statsRow, { borderTopColor: theme.colors.borderLight }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{posts.length}</Text>
            <MutedText style={styles.statLabel}>Readings</MutedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.borderLight }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{totalLikes}</Text>
            <MutedText style={styles.statLabel}>Total Likes</MutedText>
          </View>
        </View>

        <Button
          label={editing ? 'Cancel Editing' : 'Edit Profile'}
          variant="accentSoft"
          size="sm"
          onPress={() => setEditing(!editing)}
        />
      </Surface>

      {/* Edit Profile Form */}
      {editing ? (
        <Surface elevated style={styles.editCard}>
          <SectionHeader title="Edit Profile Details" />
          <Field placeholder="Username" value={username} onChangeText={setUsername} />
          <Field placeholder="Short Bio" value={bio} onChangeText={setBio} multiline style={styles.bioInput} />
          <Button label="Save Changes" variant="primary" size="md" onPress={save} loading={saving} />
        </Surface>
      ) : null}

      {/* Appearance Settings */}
      <Surface style={styles.settingsCard}>
        <SectionHeader title="Appearance" subtitle="Choose your app theme" />
        <View style={styles.themePillsRow}>
          {(['system', 'light', 'dark'] as const).map((item) => (
            <Pill
              key={item}
              label={item.charAt(0).toUpperCase() + item.slice(1)}
              active={mode === item}
              onPress={() => setMode(item)}
            />
          ))}
        </View>
      </Surface>

      {/* Sign Out Button */}
      <Button
        label="Sign Out"
        variant="danger"
        size="md"
        onPress={() => supabase.auth.signOut()}
        style={styles.signOutBtn}
      />

      <SectionHeader title="Your Readings" subtitle={`${posts.length} published passages`} style={{ marginTop: spacing.md }} />
    </View>
  );

  const renderEmpty = () => (
    <View style={[styles.emptyContainer, { backgroundColor: theme.colors.surfaceMuted }]}>
      <Text style={styles.emptyIcon}>🎙️</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No readings yet</Text>
      <MutedText style={styles.emptySubtitle}>Readings you publish will appear here on your profile.</MutedText>
    </View>
  );

  return (
    <Screen>
      <FlatList
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} navigation={navigation} onChanged={load} />}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.xxl + 40
  },
  header: {
    gap: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.md
  },
  pageTitle: {
    marginBottom: spacing.xs
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
  profileTextInfo: {
    flex: 1
  },
  displayName: {
    fontSize: 20,
    fontWeight: '800'
  },
  emailText: {
    fontSize: 12,
    marginTop: 1
  },
  bioText: {
    fontSize: 14,
    marginTop: 6,
    fontStyle: 'italic'
  },
  statsRow: {
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
    fontSize: 22,
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
  editCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.md
  },
  bioInput: {
    minHeight: 70,
    paddingTop: spacing.sm
  },
  settingsCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.md
  },
  themePillsRow: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  signOutBtn: {
    marginVertical: spacing.xs
  },
  emptyContainer: {
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
