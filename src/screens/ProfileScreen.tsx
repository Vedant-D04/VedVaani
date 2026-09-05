import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { BodyText, Button, Field, MutedText, Pill, Screen, Surface, Title } from '../components/Themed';
import { spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCurrentProfile, listPosts, upsertProfile } from '../lib/posts';
import { supabase } from '../lib/supabase';
import { Post, Profile } from '../types/models';

export function ProfileScreen() {
  const { session } = useAuth();
  const { mode, setMode } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!session?.user.id) return;
    const [nextProfile, allPosts] = await Promise.all([getCurrentProfile(session.user.id), listPosts()]);
    setProfile(nextProfile);
    setUsername(nextProfile?.username ?? session.user.email?.split('@')[0] ?? 'reader');
    setBio(nextProfile?.bio ?? '');
    setPosts(allPosts.filter((post) => post.user_id === session.user.id));
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
      Alert.alert('Saved', 'Your profile is updated.');
    } catch (error) {
      Alert.alert('Could not save profile', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <Title>Profile</Title>
            <Surface style={styles.block}>
              <Field placeholder="Username" value={username} onChangeText={setUsername} />
              <Field placeholder="Bio" value={bio} onChangeText={setBio} multiline style={styles.bio} />
              <Button label="Save profile" onPress={save} loading={saving} />
            </Surface>
            <Surface style={styles.block}>
              <BodyText style={styles.section}>Theme</BodyText>
              <View style={styles.row}>
                {(['system', 'light', 'dark'] as const).map((item) => <Pill key={item} label={item} active={mode === item} onPress={() => setMode(item)} />)}
              </View>
            </Surface>
            <Button label="Sign out" variant="secondary" onPress={() => supabase.auth.signOut()} />
            <BodyText style={styles.section}>Your readings</BodyText>
          </View>
        }
        contentContainerStyle={styles.list}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Surface style={styles.reading}>
            <BodyText style={styles.book}>{item.book_title}</BodyText>
            <MutedText>{item.author_name} · {item.genre}</MutedText>
          </Surface>
        )}
        ListEmptyComponent={<MutedText>You have not posted a reading yet.</MutedText>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    paddingTop: spacing.lg
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  block: {
    gap: spacing.md
  },
  bio: {
    minHeight: 88,
    paddingTop: spacing.md
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  section: {
    fontWeight: '800'
  },
  reading: {
    gap: spacing.xs
  },
  book: {
    fontWeight: '800'
  }
});
