import { Audio } from 'expo-av';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { radius, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { BodyText, MutedText } from './Themed';

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
    <View style={styles.row}>
      <Pressable
        onPress={toggle}
        style={[styles.playButton, { backgroundColor: theme.colors.accent }]}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause reading' : 'Play reading'}
      >
        <BodyText style={{ color: theme.colors.accentText, fontWeight: '800' }}>{isPlaying ? 'II' : '▶'}</BodyText>
      </Pressable>
      <View style={styles.progressWrap}>
        <View style={[styles.track, { backgroundColor: theme.colors.surfaceMuted }]}>
          <View style={[styles.progress, { backgroundColor: theme.colors.accent, width: `${progress * 100}%` }]} />
        </View>
        <MutedText style={styles.time}>{formatTime(position / 1000)} / {formatTime(durationSeconds)}</MutedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center'
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  progressWrap: {
    flex: 1,
    gap: spacing.sm
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    overflow: 'hidden'
  },
  progress: {
    height: '100%'
  },
  time: {
    fontSize: 13,
    lineHeight: 18
  }
});
