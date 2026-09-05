import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PostCard } from '../components/PostCard';
import { Field, MutedText, Pill, Screen, Title } from '../components/Themed';
import { GENRES } from '../constants/genres';
import { radius, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { listAuthors, listPosts } from '../lib/posts';
import { RootStackParamList } from '../navigation/types';
import { Post } from '../types/models';

type Mode = 'Genre' | 'Author' | 'Newest' | 'Most Discussed';

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: 'Genre', label: 'Genre', icon: '🏷️' },
  { id: 'Author', label: 'Author', icon: '✍️' },
  { id: 'Newest', label: 'Newest', icon: '⏱️' },
  { id: 'Most Discussed', label: 'Popular', icon: '💬' }
];

export function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>('Genre');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [authors, setAuthors] = useState<{ author_name: string; count: number }[]>([]);

  const load = async () => {
    try {
      const [nextPosts, nextAuthors] = await Promise.all([listPosts(query), listAuthors()]);
      setPosts(nextPosts);
      setAuthors(nextAuthors);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const visiblePosts = useMemo(() => {
    let result = [...posts];
    if (mode === 'Genre' && selectedGenre) {
      result = result.filter((post) => post.genre === selectedGenre);
    }
    if (mode === 'Author' && selectedAuthor) {
      result = result.filter((post) => post.author_name === selectedAuthor);
    }
    if (mode === 'Most Discussed') {
      result.sort((a, b) => (b.comments?.[0]?.count ?? 0) - (a.comments?.[0]?.count ?? 0));
    }
    return result;
  }, [mode, posts, selectedAuthor, selectedGenre]);

  const renderHeader = () => (
    <View style={styles.header}>
      <Title>Explore</Title>
      <Field
        placeholder="Search books, authors, genres..."
        value={query}
        onChangeText={setQuery}
        leftElement={<Text style={styles.searchIcon}>🔍</Text>}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {MODES.map((item) => (
          <Pill
            key={item.id}
            label={item.label}
            icon={item.icon}
            active={mode === item.id}
            onPress={() => {
              setMode(item.id);
              setSelectedAuthor(null);
              setSelectedGenre(null);
            }}
          />
        ))}
      </ScrollView>

      {mode === 'Genre' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subRow}>
          {GENRES.map((genre) => (
            <Pill
              key={genre}
              label={genre}
              active={selectedGenre === genre}
              onPress={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
            />
          ))}
        </ScrollView>
      ) : null}

      {mode === 'Author' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subRow}>
          {authors.map((author) => (
            <Pill
              key={author.author_name}
              label={`${author.author_name} (${author.count})`}
              active={selectedAuthor === author.author_name}
              onPress={() => setSelectedAuthor(selectedAuthor === author.author_name ? null : author.author_name)}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );

  const renderEmpty = () => (
    <View style={[styles.emptyContainer, { backgroundColor: theme.colors.surfaceMuted }]}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No readings found</Text>
      <MutedText style={styles.emptySubtitle}>Try adjusting your search query or filters.</MutedText>
    </View>
  );

  return (
    <Screen>
      <FlatList
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} navigation={navigation} onChanged={load} />}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.md
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.xs
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.md
  },
  subRow: {
    gap: spacing.xs,
    paddingRight: spacing.md,
    marginTop: -spacing.xs
  },
  list: {
    paddingBottom: spacing.xxl + 40
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: radius.lg,
    marginTop: spacing.md
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
    marginTop: 4
  }
});
