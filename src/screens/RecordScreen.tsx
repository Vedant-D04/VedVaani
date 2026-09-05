import { Audio } from 'expo-av';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { AudioPlayer } from '../components/AudioPlayer';
import { BodyText, Button, Field, MutedText, Pill, Screen, Surface, Title } from '../components/Themed';
import { GENRES } from '../constants/genres';
import { spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BookSuggestion, searchBooks } from '../lib/books';
import { createPost, listAuthorSuggestions } from '../lib/posts';

const MAX_SECONDS = 60;

export function RecordScreen() {
  const { session } = useAuth();
  const { theme } = useTheme();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [genre, setGenre] = useState<string>(GENRES[0]);
  const [caption, setCaption] = useState('');
  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([]);
  const [bookSuggestions, setBookSuggestions] = useState<BookSuggestion[]>([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRecording) {
      timer = setInterval(() => {
        setSeconds((current) => {
          if (current + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return current + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      listAuthorSuggestions(authorName).then(setAuthorSuggestions).catch(() => setAuthorSuggestions([]));
    }, 200);
    return () => clearTimeout(timeout);
  }, [authorName]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchBooks(bookTitle).then(setBookSuggestions).catch(() => setBookSuggestions([]));
    }, 300);
    return () => clearTimeout(timeout);
  }, [bookTitle]);

  const meterBars = useMemo(() => {
    return Array.from({ length: 18 }, (_, index) => 18 + ((seconds + index * 7) % 28));
  }, [seconds]);

  const startRecording = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Microphone needed', 'VedVaani records live readings with your microphone only.');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true
    });

    setAudioUri(null);
    setSeconds(0);
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    recordingRef.current = recording;
    setIsRecording(true);
  };

  const stopRecording = async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    setIsRecording(false);
    recordingRef.current = null;
    await recording.stopAndUnloadAsync();
    setAudioUri(recording.getURI());
  };

  const reset = () => {
    setAudioUri(null);
    setSeconds(0);
  };

  const post = async () => {
    if (!session?.user.id || !audioUri) return;
    if (!bookTitle.trim() || !authorName.trim() || !genre) {
      Alert.alert('Missing details', 'Add a book title, author, and genre before posting.');
      return;
    }
    setPosting(true);
    try {
      await createPost({
        userId: session.user.id,
        audioUri,
        bookTitle,
        authorName,
        genre,
        caption,
        durationSeconds: Math.max(1, seconds)
      });
      setBookTitle('');
      setAuthorName('');
      setCaption('');
      reset();
      Alert.alert('Posted', 'Your reading is live.');
    } catch (error) {
      Alert.alert('Could not post reading', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Title>Record</Title>
        <Surface style={styles.recorder}>
          <MutedText>{isRecording ? `${MAX_SECONDS - seconds}s remaining` : 'One continuous live take, up to 60 seconds.'}</MutedText>
          <View style={styles.meter}>
            {meterBars.map((height, index) => (
              <View key={index} style={[styles.bar, { height: isRecording ? height : 12, backgroundColor: theme.colors.accent }]} />
            ))}
          </View>
          {!isRecording && !audioUri ? <Button label="Start recording" onPress={startRecording} /> : null}
          {isRecording ? <Button label="Stop" variant="danger" onPress={stopRecording} /> : null}
          {audioUri ? (
            <View style={styles.preview}>
              <AudioPlayer uri={audioUri} durationSeconds={Math.max(1, seconds)} />
              <Button label="Record again" variant="secondary" onPress={reset} />
            </View>
          ) : null}
        </Surface>

        <Field placeholder="Book title" value={bookTitle} onChangeText={setBookTitle} />
        {bookSuggestions.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {bookSuggestions.map((book) => (
              <Pill
                key={book.id}
                label={`${book.title} · ${book.author}`}
                onPress={() => {
                  setBookTitle(book.title);
                  setAuthorName(book.author);
                  setBookSuggestions([]);
                }}
              />
            ))}
          </ScrollView>
        ) : null}
        <Field placeholder="Author" value={authorName} onChangeText={setAuthorName} />
        {authorSuggestions.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {authorSuggestions.map((name) => <Pill key={name} label={name} onPress={() => setAuthorName(name)} />)}
          </ScrollView>
        ) : null}
        <BodyText style={styles.label}>Genre</BodyText>
        <View style={styles.genreWrap}>
          {GENRES.map((item) => <Pill key={item} label={item} active={genre === item} onPress={() => setGenre(item)} />)}
        </View>
        <Field placeholder="Caption optional" value={caption} onChangeText={setCaption} multiline style={styles.caption} />
        <Button label="Post reading" onPress={post} loading={posting} disabled={!audioUri || posting} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl
  },
  recorder: {
    gap: spacing.md
  },
  meter: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  bar: {
    width: 7,
    borderRadius: 4
  },
  preview: {
    gap: spacing.md
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.md
  },
  genreWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  label: {
    fontWeight: '800'
  },
  caption: {
    minHeight: 88,
    paddingTop: spacing.md
  }
});
