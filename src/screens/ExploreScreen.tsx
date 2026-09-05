import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { GENRES } from '../constants/genres';
import { spacing } from '../constants/theme';
import { listAuthors, listPosts } from '../lib/posts';
import { RootStackParamList } from '../navigation/types';
import { Post } from '../types/models';
import { PostCard } from '../components/PostCard';
import { Field, MutedText, Pill, Screen, Title } from '../components/Themed';

type Mode = 'Genre' | 'Author' | 'Newest' | 'Most Discussed';
const MODES: Mode[] = ['Genre', 'Author', 'Newest', 'Most Discussed'];

export function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>('Genre');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [authors, setAuthors] = useState<{ author_name: string; count: number }[]>([]);

  const load = async () => {
    const [nextPosts, nextAuthors] = await Promise.all([listPosts(query), listAuthors()]);
    setPosts(nextPosts);
    setAuthors(nextAuthors);
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

  return (
    <Screen>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <Title>Explore</Title>
            <Field placeholder="Search books, authors, genres" value={query} onChangeText={setQuery} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {MODES.map((item) => (
                <Pill
                  key={item}
                  label={item}
                  active={mode === item}
                  onPress={() => {
                    setMode(item);
                    setSelectedAuthor(null);
                    setSelectedGenre(null);
                  }}
                />
              ))}
            </ScrollView>
            {mode === 'Genre' ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {GENRES.map((genre) => <Pill key={genre} label={genre} active={selectedGenre === genre} onPress={() => setSelectedGenre(selectedGenre === genre ? null : genre)} />)}
              </ScrollView>
            ) : null}
            {mode === 'Author' ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {authors.map((author) => (
                  <Pill
                    key={author.author_name}
                    label={`${author.author_name} · ${author.count}`}
                    active={selectedAuthor === author.author_name}
                    onPress={() => setSelectedAuthor(selectedAuthor === author.author_name ? null : author.author_name)}
                  />
                ))}
              </ScrollView>
            ) : null}
          </View>
        }
        contentContainerStyle={styles.list}
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} navigation={navigation} onChanged={load} />}
        ListEmptyComponent={<MutedText>No matching readings.</MutedText>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    paddingTop: spacing.lg
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.md
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl
  }
});
