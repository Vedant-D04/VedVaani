import { Audio } from 'expo-av';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AudioPlayer } from '../components/AudioPlayer';
import { BodyText, Button, Field, MutedText, Pill, Screen, SectionHeader, Surface, Title } from '../components/Themed';
import { GENRES } from '../constants/genres';
import { radius, spacing } from '../constants/theme';
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
    return Array.from({ length: 24 }, (_, index) => 12 + ((seconds * 3 + index * 11) % 36));
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
      Alert.alert('Posted! 🎉', 'Your voice reading is live on VedVaani.');
    } catch (error) {
      Alert.alert('Could not post reading', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Title>Record Studio</Title>

        {/* Recorder Hero Card */}
        <Surface elevated style={styles.recorderCard}>
          <Text style={[styles.timerDisplay, { color: isRecording ? theme.colors.danger : theme.colors.text }]}>
            00:{String(seconds).padStart(2, '0')} <Text style={styles.maxTimer}>/ 01:00</Text>
          </Text>
          <MutedText style={styles.recorderSubtitle}>
            {isRecording ? 'Recording live audio...' : audioUri ? 'Recording ready!' : 'One continuous take up to 60 seconds.'}
          </MutedText>

          {/* Meter visualization */}
          <View style={styles.meterContainer}>
            {meterBars.map((height, index) => (
              <View
                key={index}
                style={[
                  styles.bar,
                  {
                    height: isRecording ? height : 8,
                    backgroundColor: isRecording ? theme.colors.accent : theme.colors.border
                  }
                ]}
              />
            ))}
          </View>

          {/* Record Control */}
          {!audioUri ? (
            <Pressable
              onPress={isRecording ? stopRecording : startRecording}
              style={({ pressed }) => [
                styles.recordCircle,
                {
                  backgroundColor: isRecording ? theme.colors.danger : theme.colors.accent,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }]
                }
              ]}
            >
              <Text style={styles.recordCircleIcon}>{isRecording ? '⏹' : '🎙️'}</Text>
            </Pressable>
          ) : (
            <View style={styles.previewBox}>
              <AudioPlayer uri={audioUri} durationSeconds={Math.max(1, seconds)} />
              <Button label="Re-record" variant="accentSoft" size="sm" onPress={reset} style={{ marginTop: spacing.sm }} />
            </View>
          )}
        </Surface>

        {/* Passage Details Form */}
        <SectionHeader title="Passage Details" subtitle="Help listeners find your reading" />

        <Field
          placeholder="Book Title"
          value={bookTitle}
          onChangeText={setBookTitle}
          leftElement={<Text style={styles.fieldIcon}>📖</Text>}
        />
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

        <Field
          placeholder="Author Name"
          value={authorName}
          onChangeText={setAuthorName}
          leftElement={<Text style={styles.fieldIcon}>✍️</Text>}
        />
        {authorSuggestions.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {authorSuggestions.map((name) => (
              <Pill key={name} label={name} onPress={() => setAuthorName(name)} />
            ))}
          </ScrollView>
        ) : null}

        <BodyText style={styles.sectionTitle}>Genre</BodyText>
        <View style={styles.genreGrid}>
          {GENRES.map((item) => (
            <Pill key={item} label={item} active={genre === item} onPress={() => setGenre(item)} />
          ))}
        </View>

        <Field
          placeholder="Add an optional caption or note..."
          value={caption}
          onChangeText={setCaption}
          multiline
          style={styles.captionField}
        />

        <Button
          label="Publish Reading"
          variant="primary"
          size="lg"
          onPress={post}
          loading={posting}
          disabled={!audioUri || posting}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 40
  },
  recorderCard: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    gap: spacing.sm
  },
  timerDisplay: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1
  },
  maxTimer: {
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.6
  },
  recorderSubtitle: {
    fontSize: 13
  },
  meterContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: spacing.sm
  },
  bar: {
    width: 5,
    borderRadius: radius.pill
  },
  recordCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  recordCircleIcon: {
    fontSize: 30,
    color: '#FFF'
  },
  previewBox: {
    width: '100%',
    gap: spacing.xs
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.md
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginTop: spacing.xs
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  fieldIcon: {
    fontSize: 16,
    marginRight: spacing.xs
  },
  captionField: {
    minHeight: 80,
    paddingTop: spacing.sm
  }
});
