import { Audio } from 'expo-av';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { MutedText } from './Themed';

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

export function AudioPlayer({ uri, durationSeconds }: { uri: string; durationSeconds: number }) {
  const { theme } = useTheme();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const progress = useMemo(() => {
    if (!durationSeconds) return 0;
    return Math.min(1, position / (durationSeconds * 1000));
  }, [durationSeconds, position]);

  const toggle = async () => {
    if (!sound) {
      const created = await Audio.Sound.createAsync({ uri }, { shouldPlay: true }, (status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          setPosition(status.positionMillis);
          if (status.didJustFinish) {
            created.sound.setPositionAsync(0);
          }
        }
      });
      setSound(created.sound);
      return;
    }

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceMuted }]}>
      <Pressable
        onPress={toggle}
        style={({ pressed }) => [
          styles.playButton,
          {
            backgroundColor: theme.colors.accent,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }]
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause reading' : 'Play reading'}
      >
        <Text style={[styles.playIcon, { color: theme.colors.accentText }]}>
          {isPlaying ? '⏸' : '▶'}
        </Text>
      </Pressable>
      <View style={styles.progressWrap}>
        <View style={[styles.track, { backgroundColor: theme.colors.borderLight }]}>
          <View style={[styles.progress, { backgroundColor: theme.colors.accent, width: `${Math.max(2, progress * 100)}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <MutedText style={styles.time}>{formatTime(position / 1000)}</MutedText>
          <MutedText style={styles.time}>{formatTime(durationSeconds)}</MutedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: radius.lg
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  playIcon: {
    fontSize: 16,
    fontWeight: '800'
  },
  progressWrap: {
    flex: 1,
    gap: 4
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden'
  },
  progress: {
    height: '100%',
    borderRadius: radius.pill
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  time: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    fontWeight: '600'
  }
});
